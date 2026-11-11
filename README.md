# identity-sdk

JavaScript SDK for the Palisade Identity app integration, including a demo company integration

<a id="readme-top"></a>

# Palisade Identity JavaScript SDK

Welcome to the **Palisade Identity JavaScript SDK** repository. This SDK enables developers to easily integrate Palisade Identity's authentication and identity management services into their JavaScript applications.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Theming](#theming)
- [Methods](#methods)
  - [signTransaction](#sign-transaction)
  - [submitTransaction](#submit-transaction)
- [Events](#events)
  - [connected](#connected)
  - [disconnected](#disconnected)
  - [error](#error)
  - [transaction-approved](#transaction-approved)
  - [transaction-rejected](#transaction-rejected)
  - [transaction-failed](#transaction-failed)
- [Contact](#contact)

## Introduction

The **Palisade Identity JavaScript SDK** provides a set of tools and methods to streamline the implementation of authentication, secure wallet creation (via MPC), transaction signing, transaction submission and passkey secured approval in your JavaScript applications.

## Browser Requirements

The **Palisade Identity JavaScript SDK** makes use of modern browser API's including:

- [Credential API](https://caniuse.com/mdn-api_credential)
- [Window API](https://caniuse.com/mdn-api_window_open)

## Features

- User authentication (login, logout, session management)
- User registration and wallet creation using MPC
- Secure API requests with token-based authentication
- Easy integration with JavaScript/TypeScript applications

## Installation

Install the SDK via npm:

```bash
npm install @palisadeinc/identity-sdk
```

or via yarn:

```bash
yarn add @palisadeinc/identity-sdk
```

### Module Support

The SDK supports both CommonJS and ES Module formats:

**ES Modules (ESM):**

```javascript
import { PalisadeIdentitySDK } from '@palisadeinc/identity-sdk';
```

**CommonJS (CJS):**

```javascript
const { PalisadeIdentitySDK } = require('@palisadeinc/identity-sdk');
```

## Quick Start

Here's a simple example to get you started with the Palisade Identity SDK:

```javascript
import { PalisadeIdentitySDK } from '@palisadeinc/identity-sdk';

// Initialize the SDK
const palisade = new PalisadeIdentitySDK({
  clientId: 'YOUR_CLIENT_ID',
  iconUrl: 'https://placehold.co/40x40'
});

// Call the connect method to initiate the create wallet / login flow
palisade.connect();
```

## Usage

### Initializing the SDK

Before using any SDK functions, you must initialize it with your configuration:

```javascript
import { PalisadeIdentitySDK } from '@palisadeinc/identity-sdk';

const palisade = new PalisadeIdentitySDK({
  clientId: 'YOUR_CLIENT_ID',
  iconUrl: 'https://placehold.co/40x40'
});

// User creates or connects their Palisade wallet
palisade.on('connected', () => {});

// User disconnects their Palisade wallet
palisade.on('disconnected', () => {});

// Error handling for both SDK level errors and service errors
palisade.on('error', (errorObj) => {
  console.log(errorObj.level, errorObj.code, errorObj.description);
});

// User approves a transaction
palisade.on('transaction-approved', (data) => {
  console.log(data.signature, data.id, data.encodedTransaction);
});

// User rejects a transaction
palisade.on('transaction-rejected', () => {});

// Transaction fails due to technical issues
palisade.on('transaction-failed', (data) => {
  console.log(
    `Transaction failed: ${data.transactionId}, Status: ${data.transactionStatus}`
  );
  console.log(`Reasons: ${data.reasons.join(', ')}`);
});
```

## Client Configuration Options

| Field              | Type    | Required | Default                    | Description                                                           |
| ------------------ | ------- | -------- | -------------------------- | --------------------------------------------------------------------- |
| clientId           | string  | ✅       | –                          | Your Palisade Client ID                                               |
| environment        | string  | ❌       | SANDBOX                    | Environment to use: SANDBOX or PRODUCTION                             |
| iconUrl            | string  | ❌       | https://placehold.co/40x40 | Optional URL to your brand icon shown in the UI (40px x 40px)         |
| logoUrl            | string  | ❌       | -                          | Optional Logo URL to replace the Logo in the UI (400px x 50px limit)  |
| logoAlt            | string  | ❌       | -                          | Optional Logo Alt text. Should be supplied if the logoUrl is supplied |
| options            | object  | ❌       | –                          | Optional configuration for enabling/disabling UI flows                |
| └ autoconnect      | boolean | ❌       | false                      | Skips the connection step within the create wallet flow               |
| └ isConnectEnabled | boolean | ❌       | true                       | Enables the "Connect" flow for returning users                        |
| └ isCreateEnabled  | boolean | ❌       | true                       | Enables the "Create" flow for new user registration                   |
| passkeyName        | string  | ❌       | –                          | Optional pre-defined passkey name in account creation                 |
| theme              | object  | ❌       | –                          | Optional visual theming — see [Theming](#theming) for the full shape  |

- If both `isConnectEnabled` and `isCreateEnabled` are set to `false`, an error will be thrown.
- If omitted, both options default to `true`.

**Example:**

```javascript
const palisade = new PalisadeIdentitySDK({
  clientId: 'YOUR_CLIENT_ID',
  iconUrl: 'https://placehold.co/40x40',
  logoAlt: 'Example Logo',
  logoUrl: 'https://placehold.co/400x40',
  options: {
    isConnectEnabled: false,
    isCreateEnabled: true
  },
  passkeyName: 'YOUR_APP_NAME'
});
```

<a id="theming"></a>

## Theming

The `theme` field on the client config lets you override the page background, the Connect / Create buttons, and the corner radii used across the Identity UI. Values are deep-merged over the default theme, so you only need to specify what you want to change.

### Fields

| Field                              | Type   | Description                                                                |
| ---------------------------------- | ------ | -------------------------------------------------------------------------- |
| backgroundColor                    | string | Any CSS color — page background fill                                       |
| backgroundImageUrl                 | string | Absolute URL to a background image layered over `backgroundColor`          |
| buttons.borderRadius               | string | CSS length applied to every button (e.g. `'3px'`, `'999px'`)               |
| buttons.primary.backgroundColor    | string | Fill color of the primary action button (e.g. "Connect a wallet")          |
| buttons.primary.border             | string | CSS `border` shorthand for the primary button (e.g. `'1px solid #FBFCFD'`) |
| buttons.primary.color              | string | Text color on the primary button                                           |
| buttons.secondary.backgroundColor  | string | Fill color of the secondary button                                         |
| buttons.secondary.border           | string | CSS `border` shorthand for the secondary button                            |
| buttons.secondary.color            | string | Text color on the secondary button                                         |
| contentBlock.borderRadius          | string | CSS length applied to content cards / panels                               |
| inputs.borderRadius                | string | CSS length applied to text inputs                                          |

- `backgroundImageUrl` must be an absolute URL reachable from the user's browser; relative paths will 404 because the Identity UI serves the config from its own origin, not yours.
- Text colors elsewhere on the page (headings, body copy, footer) are not themeable today and remain locked to the default palette — pick a `backgroundColor` with enough contrast against mid-gray text.
- Nested objects are deep-merged, so `theme: { buttons: { primary: { backgroundColor: '#000' } } }` keeps every other button field at its default.

### Example

```javascript
const palisade = new PalisadeIdentitySDK({
  clientId: 'YOUR_CLIENT_ID',
  theme: {
    backgroundColor: '#0E1A2B',
    buttons: {
      borderRadius: '6px',
      primary: {
        backgroundColor: '#8BE05F',
        border: '1px solid #8BE05F',
        color: '#001B2E'
      },
      secondary: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        color: '#FFFFFF'
      }
    }
  }
});
```

### Restoring the pre-rebrand palette

The Identity UI used to ship a dark-surface theme by default. That surface was replaced with a light Ripple Custody look in a recent Identity UI rebrand; the SDK surface is unchanged, but the visual default integrators see in the browser is now the new palette. To restore the previous dark look, pass:

```json
{
  "theme": {
    "backgroundColor": "#183142",
    "buttons": {
      "borderRadius": "3px",
      "primary": {
        "backgroundColor": "#FFFFFF",
        "border": "1px solid #FBFCFD",
        "color": "#183142"
      },
      "secondary": {
        "backgroundColor": "rgba(255, 255, 255, 0.05)",
        "border": "none",
        "color": "#FFFFFF"
      }
    },
    "contentBlock": { "borderRadius": "6px" },
    "inputs": { "borderRadius": "3px" }
  }
}
```

The original dark surface was an SVG pattern (`backgroundImageUrl: './images/background-pattern.svg'`) bundled inside the Identity UI; that asset was removed in the rebrand, so the snippet above substitutes the matching flat `backgroundColor` (`#183142`, the old `gray800` token). If you want the exact pattern back, host the SVG at a public URL and set `backgroundImageUrl` to that absolute URL instead.

# Methods

<a id="sign-transaction"></a>

### Method: `palisade.signTransaction(encodedTransaction)`

This method is used to initiate the process of signing a transaction. It opens a window to allow the user to use their passkey to approve the transaction.

#### Parameters

- **encodedTransaction**: `string` - The encoded representation of the transaction that needs to be signed.

#### Description

When `palisade.signTransaction(encodedTransaction)` is called, a window is opened where the user can use their passkey to approve the transaction. This method initiates the user authentication and approval process, ensuring the transaction is signed securely.

#### Example

To sign a transaction, call the `palisade.signTransaction` method with the encoded transaction data as the parameter. Here's an example of how to do it:

```javascript
const encodedTransaction = 'base64encodedtransactiondata';

palisade.signTransaction(encodedTransaction);
```

In this example, an encoded transaction is passed to the `signTransaction` method. The user is then prompted to use their passkey to approve the transaction, completing the signing process.

<a id="submit-transaction"></a>

### Method: `palisade.submitTransaction(encodedTransaction)`

This method is used to submit a transaction to the network. It takes the encoded transaction data as a parameter and sends it for processing.

#### Usage

To submit a transaction, call the `palisade.submitTransaction` method with the encoded transaction data as the parameter. Here's an example of how to do it:

```javascript
palisade.submitTransaction(encodedTransaction);
```

#### Parameters

- **encodedTransaction**: `string` - The encoded representation of the transaction that needs to be submitted.

#### Description

When `palisade.submitTransaction(encodedTransaction)` is called, the provided encoded transaction data is submitted to the network for processing. This method handles the necessary steps to ensure the transaction is correctly sent and processed by the network.

#### Example

To submit a transaction, call the `palisade.submitTransaction` method with the encoded transaction data as the parameter. Here's an example of how to do it:

```javascript
const encodedTransaction = 'base64encodedtransactiondata';

palisade.submitTransaction(encodedTransaction);
```

## Events

<a id="connected"></a>

### Event: `connected`

This event is triggered when the connection to the Palisade service is successfully established. It does not provide any additional data, as it simply indicates the successful connection.

#### Example

To handle the `connected` event, you need to subscribe to it using the `palisade.on` method. Here's an example of how to do it:

```javascript
palisade.on('connected', () => {
  console.log('Successfully connected to Palisade service.');
});
```

<a id="disconnected"></a>

### Event: `disconnected`

This event is triggered when the connection to the Palisade service is lost. It does not provide any additional data, as it simply indicates the disconnection.

#### Example

To handle the `disconnected` event, you need to subscribe to it using the `palisade.on` method. Here's an example of how to do it:

```javascript
palisade.on('disconnected', () => {
  console.log('Disconnected from Palisade service.');
});
```

<a id="transaction-approved"></a>

### Event: `transaction-approved`

This event is triggered when a user approves a transaction. It provides detailed information about the approved transaction including the signature, transaction ID, and the encoded transaction data.

#### Event Data Structure

The event handler receives a `data` object with the following properties:

- **signature**: `string` - The cryptographic signature of the transaction.
- **id**: `string` - The unique identifier of the transaction.
- **encodedTransaction**: `string` - The encoded representation of the transaction.

#### Example

To handle the `transaction-approved` event, you need to subscribe to it using the `palisade.on` method. Here's an example of how to do it:

```javascript
palisade.on('transaction-approved', (data) => {
  console.log('Transaction Signature:', data.signature);
  console.log('Transaction ID:', data.id);
  console.log('Encoded Transaction:', data.encodedTransaction);
});
```

<a id="transaction-rejected"></a>

### Event: `transaction-rejected`

This event is triggered when a user rejects a transaction. It does not provide any additional data, as it simply indicates the rejection action.

#### Usage

To handle the `transaction-rejected` event, you need to subscribe to it using the `palisade.on` method. Here's an example of how to do it:

```javascript
palisade.on('transaction-rejected', () => {
  console.log('Transaction was rejected by the user.');
});
```

<a id="transaction-failed"></a>

### Event: `transaction-failed`

This event is triggered when a transaction fails. It provides detailed error information to help developers diagnose and handle the failure appropriately.

#### Event Data Structure

The event handler receives a data object with the following properties:

- **reasons**: `array` - An array of failure reasons or error messages explaining what went wrong.
- **transactionId**: `string` - The unique identifier of the transaction that failed.
- **transactionStatus**: `string` - The status of the transaction at the time of failure.

#### Example

To handle the `transaction-failed` event, you need to subscribe to it using the `palisade.on` method. Here's an example of how to do it:

```javascript
palisade.on('transaction-failed', (data) => {
  console.log('Transaction ID:', data.transactionId);
  console.log('Failure Reasons:', data.reasons);
});
```

## Error Codes

The SDK may emit various error codes through the `error` event. These are categorized into SDK-level errors and Service-level errors.

### SDK-Level Error Codes

These errors are generated by the SDK itself:

| Error Code    | Title                        | Description                                              |
| ------------- | ---------------------------- | -------------------------------------------------------- |
| PAL.ERROR.101 | Connection Required          | You need to connect before you can approve a transaction |
| PAL.ERROR.102 | No Auth Token                | No auth token set                                        |
| PAL.ERROR.103 | Unable to Get Wallet         | Unable to get wallet information                         |
| PAL.ERROR.104 | Unable to Sign Transaction   | Unable to sign transaction                               |
| PAL.ERROR.105 | Unable to Submit Transaction | Unable to submit transaction                             |
| PAL.ERROR.106 | JWT Not Authenticated        | JWT is not authenticated so the app has disconnected     |
| PAL.ERROR.107 | Invalid Transaction Hash     | Invalid transaction hash                                 |
| PAL.ERROR.108 | Invalid Token                | The token provided on connection is invalid              |
| PAL.ERROR.109 | Invalid Transaction Details  | Transaction details are not populated correctly          |

### Service-Level Error Codes

These errors are returned by the Palisade Identity service:

| Error Code    | Title                                     | Description                                                                                                 |
| ------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| PAL.ERROR.001 | Configuration not provided                | A configuration object must be provided to connect a wallet                                                 |
| PAL.ERROR.002 | Unable to login                           | There was a problem logging in to Palisade. Please try again or contact Palisade support                    |
| PAL.ERROR.003 | Unsupported browser                       | Web authentication is not supported in this browser                                                         |
| PAL.ERROR.004 | Unable to register                        | There was a problem registering your wallet. Please try again or contact Palisade support                   |
| PAL.ERROR.005 | Unable to authenticate user               | There was a problem fetching user connection options. Please try again or contact Palisade support          |
| PAL.ERROR.006 | Unauthorized                              | There was a problem authenticating with Palisade. Please try again or contact Palisade support              |
| PAL.ERROR.007 | Unable to fetch client details            | There was a problem fetching client details. Please try again or contact Palisade support                   |
| PAL.ERROR.008 | Unable to poll for wallet information     | There was a problem polling for wallet information. Please try again or contact Palisade support            |
| PAL.ERROR.009 | Unable to provision wallet                | There was a problem provisioning your wallet. Please try again or contact Palisade support                  |
| PAL.ERROR.010 | Unable to create passkey credential       | There was a problem creating your passkey credential. Please try again or contact Palisade support          |
| PAL.ERROR.011 | Unauthorized to approve connection        | You are not authorized to approve this connection. Please try again or contact Palisade support             |
| PAL.ERROR.012 | Unable to get wallet information          | There was a problem retrieving wallet information. Please try again or contact Palisade support             |
| PAL.ERROR.013 | Invalid action                            | The provided action does not exist. Available actions are: APPROVE_TRANSACTION                              |
| PAL.ERROR.014 | Transaction ID not defined                | The transaction ID must be defined to proceed                                                               |
| PAL.ERROR.015 | Unable to decode raw transaction          | There was a problem decoding the raw transaction. Please try again or contact Palisade support              |
| PAL.ERROR.016 | Unable to get approval credential options | There was a problem fetching approval credential options. Please try again or contact Palisade support      |
| PAL.ERROR.017 | Unauthorized to approve transaction       | You are not authorized to approve this transaction. Please try again or contact Palisade support            |
| PAL.ERROR.018 | No approval summary found                 | No approval summary was found for the provided transaction ID. Please try again or contact Palisade support |
| PAL.ERROR.019 | Unable to approve transaction             | There was a problem approving the transaction. Please try again or contact Palisade support                 |
| PAL.ERROR.020 | Unable to fetch signature                 | There was a problem fetching the transaction signature. Please try again or contact Palisade support        |
| PAL.ERROR.021 | Unable to fetch transaction               | There was a problem fetching the transaction details. Please try again or contact Palisade support          |
| PAL.ERROR.022 | Transaction failed                        | The transaction has failed. Please try again or contact Palisade support                                    |
| PAL.ERROR.023 | No client config options enabled          | At least one client config option must be enabled to proceed. Please check your configuration               |
| PAL.ERROR.024 | Translation error                         | There was an error while applying translations. Please try again or contact Palisade support                |
| PAL.ERROR.025 | Wallet not provisioned                    | The wallet has not been provisioned. Please try again or contact Palisade support                           |
| PAL.ERROR.026 | Unable to update passkey name             | There was a problem updating the passkey name. Please try again or contact Palisade support                 |

### Error Handling Example

```javascript
import { ErrorInfo } from '@palisadeinc/identity-sdk';

palisade.on('error', (errorObj: ErrorInfo) => {
  console.log(`Error Level: ${errorObj.level}`);
  console.log(`Error Code: ${errorObj.code}`);
  console.log(`Description: ${errorObj.description}`);

  // Handle specific errors
  switch (errorObj.code) {
    case 'PAL.ERROR.101':
      // User needs to connect first
      palisade.connect();
      break;
    case 'PAL.ERROR.106':
      // Session expired, reconnect
      palisade.connect();
      break;
    // Handle other errors as needed
  }
});
```

### TypeScript Support

For TypeScript users, error codes are available as an enum with comprehensive error information:

```typescript
// ESM
import {
  PalisadeIdentitySDK,
  ErrorCode,
  ErrorInfo,
  ERROR_INFO
} from '@palisadeinc/identity-sdk';

// Or CJS
// const {
//   PalisadeIdentitySDK,
//   ErrorCode,
//   ErrorInfo,
//   ERROR_INFO
// } = require('@palisadeinc/identity-sdk');

const palisade = new PalisadeIdentitySDK({
  clientId: 'YOUR_CLIENT_ID'
});

palisade.on('error', (errorObj: ErrorInfo) => {
  // Access error information programmatically
  const errorInfo = ERROR_INFO[errorObj.code as ErrorCode];

  if (errorInfo) {
    console.log(`Title: ${errorInfo.title}`);
    console.log(`Description: ${errorInfo.description}`);
    console.log(`Level: ${errorInfo.level}`);
  }

  // Handle specific errors with enum values
  switch (errorObj.code) {
    case ErrorCode.NOT_CONNECTED:
      palisade.connect();
      break;
    case ErrorCode.JWT_NOT_AUTHENTICATED:
      palisade.connect();
      break;
    case ErrorCode.BROWSER_NOT_SUPPORTED:
      alert('Please use a supported browser');
      break;
  }
});
```

## Contact

If you have any questions, issues, or feedback, please open an issue on this repository or contact us at support@palisade.co
