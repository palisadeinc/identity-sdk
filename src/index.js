'use strict';

class PalisadeIdentity {
    static instance;

    constructor(clientConfig) {
        if (PalisadeIdentity.instance) {
            return PalisadeIdentity.instance;
        }

        PalisadeIdentity.instance = this;

        const environmentDomains = {
            development: "https://identity.development.palisade.co",
            sandbox: "https://identity.sandbox.palisade.co",
            production: "https://identity.palisade.co"
        };

        function getDomainForEnvironment (clientConfig, urlParam) {

            if (!!urlParam) {
                return urlParam;
            }

            // TODO: Validate environment against possible options if defined
            switch (clientConfig.environment) {
                case 'DEVELOPMENT': {
                    return environmentDomains.development;
                }
                case 'SANDBOX': {
                    return environmentDomains.sandbox;
                }
                case 'PRODUCTION': {
                    return environmentDomains.production;
                }
                default: {
                    return environmentDomains.development;
                }
            }
        }

        this.params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });

        const domain = getDomainForEnvironment(clientConfig, this.params.domain);

        this.sdkConfig = {
            apiUri: `${domain}/api`,
            authCookieName: 'PAL.auth',
            cookieExpiryDays: 7,
            debug: false,
            domain,
            modal: {
                positionTop: '150',
                title: "Connect with Palisade",
                width: '420',
                height: '665',
            },
            actions: {
                approveTransaction: 'APPROVE_TRANSACTION'
            },
            errorCodes: {
                notConnected: 'PAL.ERROR.101', // SDK specific errors start from 100
                noAuthToken: 'PAL.ERROR.102',
                unableToGetWallet: 'PAL.ERROR.103',
                unableToSignTransaction: 'PAL.ERROR.104',
                unableToSubmitTransaction: 'PAL.ERROR.105',
                jwtNotAuthenticated: 'PAL.ERROR.106',
				unableToGetTransaction: 'PAL.ERROR.107'
            },
            errorMessages: {
                'PAL.ERROR.101': 'You need to connect before you can approve a transaction',
                'PAL.ERROR.102': 'No auth token set',
                'PAL.ERROR.103': 'Unable to get wallet information',
                'PAL.ERROR.104': 'Unable to sign transaction',
                'PAL.ERROR.105': 'Unable to submit transaction',
                'PAL.ERROR.106': 'JWT is not authenticated so the app has disconnected'
            },
            eventCodes: {
                dappConnectedSuccessfully: 'PAL.EVENT.101'
            },
            eventMessages: {
                'PAL.EVENT.101': 'Dapp has connected successfully',
            }
        };

        this.clientConfig = {...clientConfig, ...{
            domain: window.location.origin,
            environment: !!clientConfig.environment ? clientConfig.environment : 'DEV'
        }};
        this.isConnected = this.getIsConnected();
        this.wallet = null;
		this.transactionId = null;

        const validationResponse = this.validateClientConfig(clientConfig);

        if (!validationResponse.isValid) {
            this.utils.onError(validationResponse.errorCode);
            return;
        }

        if (this.isConnected) {
            this.loadWallet();
        }
    }

    utils = {
        closeModal: () => {
            if (!!PalisadeIdentity.openedWindow) {
                PalisadeIdentity.openedWindow.close();
            }
        },

        convertJsonToBase64String: (data) => {
            const dataAsString = JSON.stringify(data);
            return btoa(dataAsString);
        },

        deleteCookie: (cname, cvalue, exdays) => {
            if (this.utils.getCookieValue(cname)) {
                this.utils.setCookie(cname, undefined, -10);
            }
        },

        truncateWithCenterEllipsis: (string, truncateLength = 5) => {
            const prefixSuffixLength = truncateLength;
            const stringLength = string.length;

            if (stringLength <= prefixSuffixLength * 2) {
                return string;
            }

            const prefix = string.substring(0, prefixSuffixLength);
            const suffix = string.substring(
                stringLength - prefixSuffixLength,
                stringLength
            );

            return `${prefix}...${suffix}`;
        },

        getCookieValue: (cname) => {
            let name = cname + "=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(';');
            let i = 0;
            for (i; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        },

        getElement: (elementAttr) => {
            return document.body.querySelector(`#${this.clientConfig.placeholder.wallet} [data-palisade='${elementAttr}']`);
        },

        initialiseMessageEventListener: () => {
            window.addEventListener('message', (event) => {
                if (event.origin === this.sdkConfig.domain) {
                    switch (event.data.type) {
                        case 'ERROR': {
                            this.utils.onError(event.data.code, event.data.errorMessages);
                            break;
                        }
                        case 'EVENT': {
                            this.utils.onEvent(event);
                            break;
                        }
                        case 'LOG': {
                            this.utils.onLog(event);
                            break;
                        }
                    }
                }
            });
        },

        isValidString: (value) => {
            return typeof value === 'string';
        },

        onError: (errorCode, errorMessages) => {
            if (typeof this.clientConfig.onError === 'function') {
                this.clientConfig.onError(errorCode, { errorMessages, ...this.sdkConfig.errorMessages });
            }
            else {
                if (!!errorMessages && !!errorMessages[errorCode]) {
                    console.error(`Palisade Identity UI Error [${errorCode}]: ${errorMessages[errorCode]}`);
                } else if (!!this.sdkConfig.errorMessages[errorCode]) {
                    console.error(`Palisade SDK Error [${errorCode}]: ${this.sdkConfig.errorMessages[errorCode]}`);
                } else {
                    console.error(`Undefined Error code: [${errorCode}]}`);
                }
            }
        },

        onEvent: (eventObj) => {

            // TODO: Validate these exist
            const eventCodes = eventObj.data.codes.event;
            const eventMessages = eventObj.data.messages.event;

            switch (eventObj.data.code) {
                case eventCodes.messagesCreatedSuccessfully: {
                    break;
                }

                case eventCodes.connectSuccess: {
                    if (!eventObj.data || !eventObj.data.token) {
                        console.error(`No token defined in ${eventObj.code} response`);
                        return;
                    }

                    this.utils.setCookie(this.sdkConfig.authCookieName, eventObj.data.token, this.sdkConfig.cookieExpiryDays);

                    this.getWallet()
                        .then(async (response) => {
                            const data = await response.json();
                            this.clientConfig.onEvent({ ...eventObj.data, ...{ wallet: data }, eventCodes, eventMessages });
                            this.isConnected = true;
                            PalisadeIdentity.instance.wallet = data;
                        })
                        .catch((error) => {
                            this.isConnected = false;
                            this.utils.onError(this.sdkConfig.errorCodes.unableToGetWallet);
                            console.error(error);
                        });

                    return;
                }
            }

            if (typeof this.clientConfig.onEvent === 'function') {
                this.clientConfig.onEvent(eventObj.data, eventCodes, eventMessages);
            }
            else {
                console.log(eventObj.data);
            }
        },

        onLog: (logCode, logMessages) => {
            if (this.clientConfig.onLog) {
                this.clientConfig.onLog(logCode, logMessages);
            }
            else {
                console.log(logCode);
            }
        },

        openModal: (configEncoded) => {
            const halfOfModalWidth = parseInt(this.sdkConfig.modal.width) / 2;
            const left = ((screen.width / 2) - halfOfModalWidth);

            PalisadeIdentity.openedWindow = window.open(
                `${this.sdkConfig.domain}?config=${configEncoded}`,
                this.sdkConfig.modal.title,
                `left=${left},top=${this.sdkConfig.modal.positionTop},width=${this.sdkConfig.modal.width},height=${this.sdkConfig.modal.height}`
            );
        },

        setCookie: (cname, cvalue, exdays) => {
            const d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            let expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }
    };

    api = {
		getTransaction: async (transactionId) => {

			// TODO: Add check in for transactionId

            const url = `${this.sdkConfig.apiUri}/v1/connection/transactions/${transactionId}`;
            const authToken = this.getAuthCookie();

            if (!authToken) {
                this.utils.onError(this.sdkConfig.errorCodes.noAuthToken);
                return;
            }

            return fetch(url, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                method: 'GET'
            });
        },
        signTransaction: async (rawTransactionHash) => {
            const url = `${this.sdkConfig.apiUri}/v1/connection/signatures`;
            const authToken = this.getAuthCookie();

            if (!authToken) {
                this.utils.onError(this.sdkConfig.errorCodes.noAuthToken);
                return;
            }

            return fetch(url, {
                body: JSON.stringify({ data: rawTransactionHash }),
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                method: 'POST'
            });
        },
        submitTransaction: async (rawTransactionHash) => {
            const url = `${this.sdkConfig.apiUri}/v1/connection/transactions`;
            const authToken = this.getAuthCookie();

            if (!authToken) {
                this.utils.onError(this.sdkConfig.errorCodes.noAuthToken);
                return;
            }

            return fetch(url, {
                body: JSON.stringify({ data: rawTransactionHash }),
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                method: 'POST'
            });
        }
    };

    async getTransaction(transactionId) {

        const response = await this.api.getTransaction(transactionId);

        if (!response.ok) {
            this.utils.onError(this.sdkConfig.errorCodes.unableToGetTransaction);
            return;
        }

        const data = await response.json();

        console.table(data);
    }

    async submitTransaction(rawTransactionHash) {
        if (!this.isConnected) {
            this.utils.onError(this.sdkConfig.errorCodes.notConnected);
            return;
        }

        const response = await this.api.submitTransaction(rawTransactionHash);

        if (!response.ok) {
            this.utils.onError(this.sdkConfig.errorCodes.unableToSubmitTransaction);
            return;
        }

        const data = await response.json();

		this.transactionId = data.ID;

        const clientConfig = {
            ...this.clientConfig,
            ...{ transactionId: this.transactionId },
            ...{ action: this.sdkConfig.actions.approveTransaction }
        };

        const clientConfigAsBase64 = this.utils.convertJsonToBase64String(clientConfig);
		//this.getTransaction(this.transactionId);
        this.utils.openModal(clientConfigAsBase64);
        this.utils.initialiseMessageEventListener();
    }

    async signTransaction(rawTransactionHash) {
        if (!this.isConnected) {
            this.utils.onError(this.sdkConfig.errorCodes.notConnected);
            return;
        }

        const response = await this.api.signTransaction(rawTransactionHash);

        if (!response.ok) {
            this.utils.onError(this.sdkConfig.errorCodes.unableToSignTransaction);
            return;
        }

        const data = await response.json();
		
		this.transactionId = data.ID;

        const clientConfig = {
            ...this.clientConfig,
            ...{ transactionId: this.transactionId },
            ...{ action: this.sdkConfig.actions.approveTransaction }
        };

        const clientConfigAsBase64 = this.utils.convertJsonToBase64String(clientConfig);

		//this.getTransaction(this.transactionId);
        this.utils.openModal(clientConfigAsBase64);
        this.utils.initialiseMessageEventListener();
    }

    connect() {
        const clientConfigAsBase64 = this.utils.convertJsonToBase64String(this.clientConfig);
        this.utils.openModal(clientConfigAsBase64);
        this.utils.initialiseMessageEventListener();
    }

    disconnect() {
        this.utils.deleteCookie(this.sdkConfig.authCookieName);
        this.isConnected = false;
    }

    getAuthCookie() {
        return this.utils.getCookieValue(this.sdkConfig.authCookieName);
    }

    getEvents() {
        return {
            walletConnectedSuccessfully: 'PAL.EVENT.001',
            transactionApprovedSuccessfully: 'PAL.EVENT.002',
            transactionApprovalRejected: 'PAL.EVENT.003',
            loginSuccess: 'PAL.EVENT.004',
            registrationSuccess: 'PAL.EVENT.005',
            passkeyLoginCancelled: 'PAL.EVENT.006',
            passkeyRegistrationCancelled: 'PAL.EVENT.007',
            connectSuccess: 'PAL.EVENT.008',
            walletLoaded: 'PAL.EVENT.009',
            messagesCreatedSuccessfully: 'PAL.EVENT.010',
            ...this.sdkConfig.eventCodes
        };
    }

    getIsConnected() {
        return !!this.getAuthCookie(this.sdkConfig.authCookieName);
    }

    async getWallet() {
        const url = `${this.sdkConfig.apiUri}/v1/connection/wallets`;
        const authToken = this.getAuthCookie();

        if (!authToken) {
            this.utils.onError(this.sdkConfig.errorCodes.noAuthToken);
            return;
        }

        return fetch(url, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            method: 'GET'
        });
    }

    validateClientConfig(clientConfig) {
        if (!this.utils.isValidString(clientConfig.clientId)) {
            return {
                isValid: false,
                errorCode: 'PAL.ERROR.003'
            };
        }

        return {
            isValid: true
        };
    }

    async loadWallet() {
        const response = await this.getWallet();

        if (!response.ok) {
            if (response.status === 401) {
                this.utils.onError(this.sdkConfig.errorCodes.jwtNotAuthenticated);
                this.disconnect();
                return;
            }

            this.utils.onError(this.sdkConfig.errorCodes.unableToGetWallet);
            return;
        }

        const data = await response.json();
        this.clientConfig.onEvent({ code: this.sdkConfig.eventCodes.dappConnectedSuccessfully, ...{ wallet: data }}, this.sdkConfig.eventCodes, this.sdkConfig.eventMessages);
        this.wallet = data;
    }
}