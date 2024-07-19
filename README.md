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
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)
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

## Quick Start

Here's a simple example to get you started with the Palisade Identity SDK:

```javascript
import PalisadeIdentitySDK from "@palisadeinc/identity-sdk";

// Initialize the SDK
const palisade = new PalisadeIdentitySDK({
  clientId: "YOUR_CLIENT_ID",
  iconUrl: "YOUR_ICON_URL_40x40",
});

// Example: Connect
palisade.connect();
```

## Usage

### Initializing the SDK

Before using any SDK functions, you must initialize it with your configuration:

```javascript
import PalisadeIdentitySDK from "@palisadeinc/identity-sdk";

function onEvent(eventData) {
  const eventCodes = palisade.getEvents();

  switch (eventData.code) {
    // Wallet connected / reconnected
    case eventCodes.connectSuccess:
    case eventCodes.dappReconnectedSuccessfully: {
      // Wallet info:
      console.log(eventData.wallet);
      break;
    }

    // Transaction approved
    case eventCodes.transactionApprovedSuccessfully: {
      // Do something...
      break;
    }

    // Transaction rejected
    case eventCodes.transactionRejectedSuccessfully: {
      // Do something...
      break;
    }
  }
}

const palisade = new PalisadeIdentitySDK({
  clientId: "YOUR_CLIENT_ID",
  iconUrl: "YOUR_ICON_URL_40x40",
  onEvent,
});
```

### Authentication

#### Connect

```javascript
palisade.connect()

...
onEvent (eventData) {

  const eventCodes = palisade.getEvents();

  switch (eventData.code) {

    // Connected successfully
    case eventCodes.connectSuccess: {
        console.log(eventData.wallet);
        break;
    }
  }
}
...
```

#### Disconnect

```javascript
palisade.disconnect();
```

### Transaction approval

#### Sign

```javascript
palisade.signTransaction(encodedTransaction);

...
onEvent (eventData) {
  switch (eventData.code) {

    // Transaction approved
    case events.transactionApprovedSuccessfully: {
        // Do something...
        break;
    }

    // Transaction rejected
    case events.transactionRejectedSuccessfully: {
        // Do something...
        break;
    }
  }
}
...
```

#### Submit / Transfer

```javascript
palisade.submitTransaction(encodedTransaction);

...
onEvent (eventData) {
  switch (eventData.code) {

    // Transaction approved
    case events.transactionApprovedSuccessfully: {
        // Do something...
        break;
    }

    // Transaction rejected
    case events.transactionRejectedSuccessfully: {
        // Do something...
        break;
    }
  }
}
...
```

## Contact

If you have any questions, issues, or feedback, please open an issue on this repository or contact us at support@palisade.co
