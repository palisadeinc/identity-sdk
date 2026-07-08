import * as sdk from '@palisadeinc/embedded-wallets-sdk';

if (typeof console !== 'undefined' && console.warn) {
    console.warn(
        '[@palisadeinc/identity-sdk] This package has been renamed to @palisadeinc/embedded-wallets-sdk. ' +
            'Please update your dependency and imports. ' +
            'The class PalisadeIdentitySDK has been renamed to PalisadeSDK.'
    );
}

export * from '@palisadeinc/embedded-wallets-sdk';
export const PalisadeIdentitySDK = sdk.PalisadeSDK;
