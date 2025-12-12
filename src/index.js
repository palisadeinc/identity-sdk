'use strict';

class EventEmitter {
    constructor(validEvents) {
        this.eventListeners = {};
        this.validEvents = validEvents;
    }

    #isValidEvent(eventName) {
        return this.validEvents.includes(eventName);
    }

    // Register an event listener
    on(eventName, callback) {
        if (!this.#isValidEvent(eventName)) {
            throw new Error(`Invalid event name: ${eventName}`);
        }

        if (typeof eventName !== 'string') {
            throw new Error(
                'Unable to register event: eventName must be a string'
            );
        }

        if (typeof callback !== 'function') {
            throw new Error(
                'Unable to register event: callback must be a function'
            );
        }

        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }

        this.eventListeners[eventName].push(callback);
    }

    // Remove an event listener
    off(eventName) {
        if (!this.#isValidEvent(eventName)) {
            throw new Error(`Invalid event name: ${eventName}`);
        }

        if (!this.eventListeners[eventName]) return;

        delete this.eventListeners[eventName];
    }

    // Emit an event
    emit(eventName, data) {
        if (!this.#isValidEvent(eventName)) {
            throw new Error(
                `Palisade Identity SDK: There is no event named: ${eventName}`
            );
        }

        if (!this.eventListeners[eventName]) {
            return;
        }

        this.eventListeners[eventName].forEach((listener) => {
            listener(data);
        });
    }

    // Remove all event listeners
    destroy() {
        this.eventListeners = [];
    }
}

export class PalisadeIdentitySDK {
    static instance;

    constructor(clientConfig) {
        if (PalisadeIdentitySDK.instance) {
            return PalisadeIdentitySDK.instance;
        }

        PalisadeIdentitySDK.instance = this;

        const environmentDomains = {
            development: 'https://identity.development.palisade.co',
            sandbox: 'https://identity.sandbox.palisade.co',
            production: 'https://identity.palisade.co'
        };

        function getDomainForEnvironment(clientConfig, urlParam) {
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
                    return environmentDomains.sandbox;
                }
            }
        }

        this.params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop)
        });

        const domain = getDomainForEnvironment(
            clientConfig,
            this.params.domain
        );

        this.sdkConfig = {
            apiUri: `${domain}/api`,
            authCookieName: 'PAL.auth',
            cookieExpiryDays: 7,
            debug: false,
            domain,
            modal: {
                positionTop: '150',
                title: 'Connect with Palisade',
                width: '420',
                height: '665'
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
                invalidTransactionHash: 'PAL.ERROR.107',
                invalidToken: 'PAL.ERROR.108',
                invalidTransactionDetails: 'PAL.ERROR.109'
            },
            errorMessages: {
                'PAL.ERROR.101':
                    'You need to connect before you can approve a transaction',
                'PAL.ERROR.102': 'No auth token set',
                'PAL.ERROR.103': 'Unable to get wallet information',
                'PAL.ERROR.104': 'Unable to sign transaction',
                'PAL.ERROR.105': 'Unable to submit transaction',
                'PAL.ERROR.106':
                    'JWT is not authenticated so the app has disconnected',
                'PAL.ERROR.107': 'Invalid transaction hash',
                'PAL.ERROR.108': 'The token provided on connection is invalid',
                'PAL.ERROR.109':
                    'Transaction details are not populated correctly'
            }
        };

        this.clientConfig = {
            ...clientConfig,
            ...{
                domain: window.location.origin,
                environment: !!clientConfig.environment
                    ? clientConfig.environment
                    : 'DEV'
            }
        };

        this.isConnected = this.#getIsConnected();
        this.wallet = null;
        this.transactionId = null;

        const publicEventNames = [
            'connected',
            'disconnected',
            'error',
            'transaction-approved',
            'transaction-rejected',
            'transaction-failed'
        ];

        this.publicEvents = new EventEmitter(publicEventNames);
        this.publicEventNames = publicEventNames;

        this.#initialiseMessageEventListener();

        const validationResponse = this.#validateClientConfig(clientConfig);

        if (!validationResponse.isValid) {
            this.#utils.onError(validationResponse.errorCode);
            return;
        }

        if (this.isConnected) {
            this.#loadWallet();
        }
    }

    // Private methods
    async #loadWallet() {
        const response = await this.#api.getWallet();

        if (!response) {
            this.#utils.onError(this.sdkConfig.errorCodes.unableToGetWallet);
            return;
        }

        if (!response.ok) {
            if (response.status === 401) {
                this.#utils.onError(
                    this.sdkConfig.errorCodes.jwtNotAuthenticated
                );
                this.disconnect();
                return;
            }

            this.#utils.onError(this.sdkConfig.errorCodes.unableToGetWallet);
            return;
        }

        const walletObj = await response.json();

        this.emit('connected', walletObj);
        this.isConnected = true;
        this.wallet = walletObj;
    }

    #api = {
        getWallet: async () => {
            const url = `${this.sdkConfig.apiUri}/v1/connection/wallets`;
            const requestConfig = this.#utils.withAuthToken({
                method: 'GET'
            });

            if (!requestConfig) {
                this.#utils.onError(this.sdkConfig.errorCodes.noAuthToken);
                this.disconnect();
                this.#utils.closeModal();
                return;
            }

            return fetch(url, requestConfig);
        },
        signTransaction: async (rawTransactionHash) => {
            const url = `${this.sdkConfig.apiUri}/v1/connection/transactions/raw`;
            const requestConfig = this.#utils.withAuthToken({
                body: JSON.stringify({
                    data: rawTransactionHash,
                    signOnly: true
                }),
                method: 'POST'
            });

            if (!requestConfig) {
                this.#utils.onError(this.sdkConfig.errorCodes.noAuthToken);
                this.disconnect();
                this.#utils.closeModal();
                return;
            }

            return fetch(url, requestConfig);
        },
        submitTransaction: async (rawTransactionHash) => {
            const url = `${this.sdkConfig.apiUri}/v1/connection/transactions/raw`;
            const requestConfig = this.#utils.withAuthToken({
                body: JSON.stringify({
                    data: rawTransactionHash,
                    signOnly: false
                }),
                method: 'POST'
            });

            if (!requestConfig) {
                this.#utils.onError(this.sdkConfig.errorCodes.noAuthToken);
                this.disconnect();
                this.#utils.closeModal();
                return;
            }

            return fetch(url, requestConfig);
        }
    };

    #getAuthCookie() {
        return this.#utils.getCookieValue(this.sdkConfig.authCookieName);
    }

    #getIsConnected() {
        return !!this.#getAuthCookie(this.sdkConfig.authCookieName);
    }

    #initialiseMessageEventListener() {
        window.addEventListener('message', (event) => {
            if (event.origin !== this.sdkConfig.domain) {
                return;
            }

            switch (event.data.type) {
                case 'ERROR': {
                    this.#utils.onError(
                        event.data.code,
                        event.data.messages.error
                    );
                    break;
                }
                case 'EVENT': {
                    this.#utils.onEvent(event);
                    break;
                }
                case 'LOG': {
                    this.#utils.onLog(event);
                    break;
                }
            }
        });
    }

    #utils = {
        closeModal: () => {
            if (!!PalisadeIdentitySDK.openedWindow) {
                setTimeout(() => {
                    PalisadeIdentitySDK.openedWindow.close();
                    PalisadeIdentitySDK.openedWindow = null;
                }, 500);
            }
        },

        convertJsonToBase64String: (data) => {
            const dataAsString = JSON.stringify(data);
            return btoa(dataAsString);
        },

        deleteCookie: (cname, cvalue, exdays) => {
            if (this.#utils.getCookieValue(cname)) {
                this.#utils.setCookie(cname, undefined, -10);
            }
        },

        getCookieValue: (cname) => {
            let name = cname + '=';
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
            return '';
        },

        getElement: (elementAttr) => {
            return document.body.querySelector(
                `#${this.clientConfig.placeholder.wallet} [data-palisade='${elementAttr}']`
            );
        },

        isValidString: (value) => {
            return typeof value === 'string';
        },

        onError: (errorCode, errorMessages) => {
            const serviceErrorMessage =
                !!errorMessages &&
                errorMessages.find(
                    (errorMessage) => errorMessage.code === errorCode
                );
            if (!!serviceErrorMessage) {
                this.emit('error', {
                    level: 'SERVICE',
                    ...serviceErrorMessage
                });
            } else if (!!this.sdkConfig.errorMessages[errorCode]) {
                this.emit('error', {
                    level: 'SDK',
                    code: errorCode,
                    description: this.sdkConfig.errorMessages[errorCode]
                });
            } else {
                this.emit('error', {
                    level: 'UNKNOWN',
                    errorCode
                });
            }
        },

        onEvent: (eventObj) => {
            // TODO: Validate eventCodes with returned event codes to flag in case any have changed
            const eventCodes = {
                connected: 'PAL.EVENT.001',
                transactionApproved: 'PAL.EVENT.002',
                transactionRejected: 'PAL.EVENT.003',
                loggedIn: 'PAL.EVENT.004',
                registered: 'PAL.EVENT.005',
                passkeyLoginCancelled: 'PAL.EVENT.006',
                passkeyRegistrationCancelled: 'PAL.EVENT.007',
                transactionFailed: 'PAL.EVENT.008'
            };

            switch (eventObj.data.code) {
                case eventCodes.connected: {
                    if (!eventObj.data || !eventObj.data.token) {
                        this.#utils.onError(
                            this.sdkConfig.errorCodes.invalidToken
                        );
                        return;
                    }

                    this.#utils.setCookie(
                        this.sdkConfig.authCookieName,
                        eventObj.data.token,
                        this.sdkConfig.cookieExpiryDays
                    );

                    this.#api
                        .getWallet()
                        .then(async (response) => {
                            const walletObj = await response.json();
                            this.emit('connected', walletObj);
                            this.isConnected = true;
                            PalisadeIdentitySDK.instance.wallet = walletObj;
                        })
                        .catch((error) => {
                            this.isConnected = false;
                            this.#utils.onError(
                                this.sdkConfig.errorCodes.unableToGetWallet
                            );
                        });

                    break;
                }

                case eventCodes.transactionApproved: {
                    // Tentative error surfacing
                    // TODO: Review whether these fields can actually be undefined
                    if (
                        !eventObj.data ||
                        !eventObj.data.encodedTransaction ||
                        !eventObj.data.signature ||
                        !eventObj.data.transactionId
                    ) {
                        this.#utils.onError(
                            this.sdkConfig.errorCodes.invalidTransactionDetails
                        );
                    }

                    this.emit('transaction-approved', {
                        canonicalSignature: eventObj.data.canonicalSignature,
                        encodedTransaction: eventObj.data.encodedTransaction,
                        signature: eventObj.data.signature,
                        signedTransaction: eventObj.data.signedTransaction,
                        transactionId: eventObj.data.transactionId
                    });

                    break;
                }

                case eventCodes.transactionRejected: {
                    this.emit('transaction-rejected');

                    break;
                }

                case eventCodes.transactionFailed: {
                    this.emit('transaction-failed', {
                        transactionId: eventObj.data.transactionId,
                        transactionStatus: eventObj.data.transactionStatus,
                        reasons: eventObj.data.reasons
                    });

                    break;
                }
            }
        },

        // TODO: Move to emit / subscribe model
        onLog: (logCode, logMessages) => {
            if (this.clientConfig.onLog) {
                this.clientConfig.onLog(logCode, logMessages);
            } else {
                console.log(logCode);
            }
        },

        openModal: (configEncoded) => {
            const halfOfModalWidth = parseInt(this.sdkConfig.modal.width) / 2;
            const left = screen.width / 2 - halfOfModalWidth;
            const url = `${this.sdkConfig.domain}?config=${configEncoded}`;

            if (
                !!PalisadeIdentitySDK.openedWindow &&
                !PalisadeIdentitySDK.openedWindow.closed
            ) {
                PalisadeIdentitySDK.openedWindow.location = url;
                PalisadeIdentitySDK.openedWindow.focus();
                return;
            }

            PalisadeIdentitySDK.openedWindow = window.open(
                `${this.sdkConfig.domain}?config=${configEncoded}`,
                this.sdkConfig.modal.title,
                `left=${left},top=${this.sdkConfig.modal.positionTop},width=${this.sdkConfig.modal.width},height=${this.sdkConfig.modal.height}`
            );
        },

        // To prevent popup blockers, we open a blank modal first, then set the URL post api call
        openModalPlaceholder: () => {
            const halfOfModalWidth = parseInt(this.sdkConfig.modal.width) / 2;
            const left = screen.width / 2 - halfOfModalWidth;

            PalisadeIdentitySDK.openedWindow = window.open(
                'about:blank',
                '_blank',
                `left=${left},top=${this.sdkConfig.modal.positionTop},width=${this.sdkConfig.modal.width},height=${this.sdkConfig.modal.height}`
            );
        },

        setCookie: (cname, cvalue, exdays) => {
            const d = new Date();
            d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
            let expires = 'expires=' + d.toUTCString();
            document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
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

        withAuthToken: (requestConfig) => {
            const authToken = this.#getAuthCookie();

            if (!authToken) {
                return null;
            }

            return {
                ...requestConfig,
                headers: {
                    ...requestConfig.headers,
                    Authorization: `Bearer ${authToken}`,
                    'X-Client-ID': this.clientConfig.clientId,
                    'X-Origin': window.location.origin
                }
            };
        }
    };

    #validateClientConfig(clientConfig) {
        if (!this.#utils.isValidString(clientConfig.clientId)) {
            return {
                isValid: false,
                errorCode: 'PAL.ERROR.003'
            };
        }

        return {
            isValid: true
        };
    }

    // Public methods
    /**
     * Triggers the Palisade connection flow
     * Requires a valid clientConfig to have been initialized
     */
    connect() {
        const clientConfigAsBase64 = this.#utils.convertJsonToBase64String(
            this.clientConfig
        );
        this.#utils.openModal(clientConfigAsBase64);
    }

    /**
     * Removes all event listeners on the publicEvents listener array.
     */
    destroy() {
        this.publicEvents.length = 0;
    }

    /**
     * Disconnects the palisade wallet, clearing the JWT token
     */
    disconnect() {
        this.#utils.deleteCookie(this.sdkConfig.authCookieName);
        this.isConnected = false;
        this.emit('disconnected', null);
    }

    /**
     * Emits an event on the publicEvents listener array.
     * @param {string} eventName
     * @param {any} data
     */
    emit(eventName, data) {
        this.publicEvents.emit(eventName, data);
    }

    /**
     * Clear a specific listener on the publicEvents listener array.
     * @param {string} eventName // Must exist in the publicEventNames array
     */
    off(eventName) {
        this.publicEvents.off(eventName);
    }

    /**
     * Adds an event listener to the publicEvents listener array.
     * @param {string} eventName // Must exist in the publicEventNames array
     * @param {function} callback
     */
    on(eventName, callback) {
        this.publicEvents.on(eventName, callback);
    }

    /**
     * Triggers the signing flow to submit / transfer a transaction via the Identity UI
     * @param {string} rawTransactionHash
     * @returns
     */
    async signTransaction(rawTransactionHash) {
        if (!this.isConnected) {
            this.#utils.onError(this.sdkConfig.errorCodes.notConnected);
            return;
        }

        if (!rawTransactionHash) {
            this.#utils.onError(
                this.sdkConfig.errorCodes.invalidTransactionHash
            );
            this.disconnect();
            return;
        }

        this.#utils.openModalPlaceholder();

        const response = await this.#api.signTransaction(rawTransactionHash);

        if (!response) {
            return;
        }

        if (!response.ok) {
            this.#utils.onError(
                this.sdkConfig.errorCodes.unableToSignTransaction
            );
            this.#utils.closeModal();
            return;
        }

        const data = await response.json();

        this.transactionId = data.ID;

        const clientConfig = {
            ...this.clientConfig,
            ...{ transactionId: this.transactionId },
            ...{ action: this.sdkConfig.actions.approveTransaction }
        };

        const clientConfigAsBase64 =
            this.#utils.convertJsonToBase64String(clientConfig);

        this.#utils.openModal(clientConfigAsBase64);
    }

    /**
     * Triggers the approval flow to submit / transfer a transaction via the Identity UI
     * @param {string} rawTransactionHash
     * @returns
     */
    async submitTransaction(rawTransactionHash) {
        if (!this.isConnected) {
            this.#utils.onError(this.sdkConfig.errorCodes.notConnected);
            return;
        }

        if (!rawTransactionHash) {
            this.#utils.onError(
                this.sdkConfig.errorCodes.invalidTransactionHash
            );
            return;
        }

        this.#utils.openModalPlaceholder();

        const response = await this.#api.submitTransaction(rawTransactionHash);

        if (!response) {
            return;
        }

        if (!response.ok) {
            this.#utils.onError(
                this.sdkConfig.errorCodes.unableToSubmitTransaction
            );
            this.#utils.closeModal();
            return;
        }

        const data = await response.json();

        this.transactionId = data.ID;

        const clientConfig = {
            ...this.clientConfig,
            ...{ transactionId: this.transactionId },
            ...{ action: this.sdkConfig.actions.approveTransaction }
        };

        const clientConfigAsBase64 =
            this.#utils.convertJsonToBase64String(clientConfig);
        this.#utils.openModal(clientConfigAsBase64);
    }

    /**
     * Publicly expose any util functions that might be useful
     */
    utils = {
        truncateWithCenterEllipsis: this.#utils.truncateWithCenterEllipsis
    };
}

export const Environment = {
    DEVELOPMENT: 'DEVELOPMENT',
    SANDBOX: 'SANDBOX',
    PRODUCTION: 'PRODUCTION'
};

export const ErrorCode = {
    // Service-level errors (001-099)
    NO_CLIENT_CONFIG: 'PAL.ERROR.001',
    LOGIN_ERROR: 'PAL.ERROR.002',
    BROWSER_NOT_SUPPORTED: 'PAL.ERROR.003',
    REGISTRATION_ERROR: 'PAL.ERROR.004',
    UNABLE_TO_GET_USER_CONNECTION: 'PAL.ERROR.005',
    UNAUTHORIZED: 'PAL.ERROR.006',
    UNABLE_TO_FETCH_CLIENT_DETAILS: 'PAL.ERROR.007',
    WALLET_POLLING_ERROR: 'PAL.ERROR.008',
    UNABLE_TO_PROVISION_WALLET: 'PAL.ERROR.009',
    UNABLE_TO_CREATE_CREDENTIAL: 'PAL.ERROR.010',
    UNABLE_TO_AUTHORIZE_APPROVE_CONNECTION: 'PAL.ERROR.011',
    UNABLE_TO_GET_WALLET_SERVICE: 'PAL.ERROR.012',
    ACTION_NOT_DEFINED: 'PAL.ERROR.013',
    TRANSACTION_ID_NOT_DEFINED: 'PAL.ERROR.014',
    UNABLE_TO_DECODE_RAW_TRANSACTION: 'PAL.ERROR.015',
    UNABLE_TO_GET_APPROVAL_CREDENTIAL_OPTIONS: 'PAL.ERROR.016',
    UNABLE_TO_AUTHORIZE_APPROVE_TRANSACTION: 'PAL.ERROR.017',
    NO_APPROVAL_SUMMARY_FOR_TRANSACTION_ID: 'PAL.ERROR.018',
    UNABLE_TO_APPROVE_TRANSACTION: 'PAL.ERROR.019',
    UNABLE_TO_FETCH_SIGNATURE: 'PAL.ERROR.020',
    UNABLE_TO_FETCH_TRANSACTION: 'PAL.ERROR.021',
    TRANSACTION_FAILED: 'PAL.ERROR.022',
    CLIENT_CONFIG_OPTIONS_INVALID: 'PAL.ERROR.023',
    TRANSLATION_ERROR: 'PAL.ERROR.024',
    WALLET_NOT_PROVISIONED: 'PAL.ERROR.025',
    UNABLE_TO_UPDATE_PASSKEY_NAME: 'PAL.ERROR.026',

    // SDK-level errors (101-199)
    NOT_CONNECTED: 'PAL.ERROR.101',
    NO_AUTH_TOKEN: 'PAL.ERROR.102',
    UNABLE_TO_GET_WALLET: 'PAL.ERROR.103',
    UNABLE_TO_SIGN_TRANSACTION: 'PAL.ERROR.104',
    UNABLE_TO_SUBMIT_TRANSACTION: 'PAL.ERROR.105',
    JWT_NOT_AUTHENTICATED: 'PAL.ERROR.106',
    INVALID_TRANSACTION_HASH: 'PAL.ERROR.107',
    INVALID_TOKEN: 'PAL.ERROR.108',
    INVALID_TRANSACTION_DETAILS: 'PAL.ERROR.109'
};

export const ErrorLevel = {
    SDK: 'SDK',
    SERVICE: 'SERVICE',
    UNKNOWN: 'UNKNOWN'
};
