# @palisadeinc/identity-sdk (deprecated)

**This package has been renamed to [@palisadeinc/embedded-wallets-sdk](https://www.npmjs.com/package/@palisadeinc/embedded-wallets-sdk).**

Versions `2.x` of this package are a thin re-export of the new package so existing code keeps working. New features and fixes are only published to the new name.

## Migration

1. Add the new package and remove this one:

    ```bash
    npm install @palisadeinc/embedded-wallets-sdk
    npm uninstall @palisadeinc/identity-sdk
    ```

2. Update imports:

    ```diff
    - import { PalisadeIdentitySDK } from '@palisadeinc/identity-sdk';
    + import { PalisadeSDK } from '@palisadeinc/embedded-wallets-sdk';
    ```

3. Rename the class in your code: `PalisadeIdentitySDK` → `PalisadeSDK`. All methods, events, config fields, and error codes are unchanged.

See the [new package's README](https://github.com/palisadeinc/embedded-wallets-sdk#readme) for full docs.
