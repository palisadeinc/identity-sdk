'use strict';

const sdk = require('@palisadeinc/embedded-wallets-sdk');

let warned = false;
function warnDeprecated() {
    if (warned) return;
    warned = true;
    if (typeof console !== 'undefined' && console.warn) {
        console.warn(
            '[@palisadeinc/identity-sdk] This package has been renamed to @palisadeinc/embedded-wallets-sdk. ' +
                'Please update your dependency and imports. ' +
                'The class PalisadeIdentitySDK has been renamed to PalisadeSDK.'
        );
    }
}
warnDeprecated();

module.exports = {
    ...sdk,
    PalisadeIdentitySDK: sdk.PalisadeSDK
};
