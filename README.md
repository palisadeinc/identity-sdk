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
- [Methods](#methods)
  - [signTransaction](#signTransaction)
  - [submitTransaction](#submitTransaction)
- [Events](#events)
  - [connected](#connected)
  - [disconnected](#disconnected)
  - [tx-approved](#txApproved)
  - [tx-rejected](#txRejected)
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
import { PalisadeIdentitySDK } from "@palisadeinc/identity-sdk";

// Initialize the SDK
const palisade = new PalisadeIdentitySDK({
  clientId: "YOUR_CLIENT_ID",
  iconUrl: "https://placehold.co/40x40",
});

// Call the connect method to initiate the create wallet / login flow
palisade.connect();
```

## Usage

### Initializing the SDK

Before using any SDK functions, you must initialize it with your configuration:

```javascript
import { PalisadeIdentitySDK } from "@palisadeinc/identity-sdk";

const palisade = new PalisadeIdentitySDK({
  clientId: "YOUR_CLIENT_ID",
  iconUrl: "https://placehold.co/40x40",
});

// User creates or connects their Palisade wallet
palisade.on("connected", () => {});

// User disconnects their Palisade wallet
palisade.on("disconnected", () => {});

// User approves a transaction
palisade.on("tx-approved", (data) => {
  console.log(data.signature, data.id, data.encodedTx);
});

// User has disconnected their Palisade wallet
palisade.on("tx-approved", () => {});
```

# Methods

<a id="signTransaction"></a>

### Method: `palisade.signTransaction(encodedTransaction)`

This method is used to initiate the process of signing a transaction. It opens a window to allow the user to use their passkey to approve the transaction.

#### Parameters

- **encodedTransaction**: `string` - The encoded representation of the transaction that needs to be signed.

#### Description

When `palisade.signTransaction(encodedTransaction)` is called, a window is opened where the user can use their passkey to approve the transaction. This method initiates the user authentication and approval process, ensuring the transaction is signed securely.

#### Example

To sign a transaction, call the `palisade.signTransaction` method with the encoded transaction data as the parameter. Here's an example of how to do it:

```javascript
const encodedTransaction = "base64encodedtransactiondata";

palisade.signTransaction(encodedTransaction);
```

In this example, an encoded transaction is passed to the `signTransaction` method. The user is then prompted to use their passkey to approve the transaction, completing the signing process.

<a id="submitTransaction"></a>

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
const encodedTransaction = "base64encodedtransactiondata";

palisade.submitTransaction(encodedTransaction);
```

## Events

<a id="connected"></a>

### Event: `connected`

This event is triggered when the connection to the Palisade service is successfully established. It does not provide any additional data, as it simply indicates the successful connection.

#### Example

To handle the `connected` event, you need to subscribe to it using the `palisade.on` method. Here's an example of how to do it:

```javascript
palisade.on("connected", () => {
  console.log("Successfully connected to Palisade service.");
});
```

<a id="disconnected"></a>

### Event: `disconnected`

This event is triggered when the connection to the Palisade service is lost. It does not provide any additional data, as it simply indicates the disconnection.

#### Example

To handle the `disconnected` event, you need to subscribe to it using the `palisade.on` method. Here's an example of how to do it:

```javascript
palisade.on("disconnected", () => {
  console.log("Disconnected from Palisade service.");
});
```

<a id="txApproved"></a>

### Event: `tx-approved`

This event is triggered when a user approves a transaction. It provides detailed information about the approved transaction including the signature, transaction ID, and the encoded transaction data.

#### Event Data Structure

The event handler receives a `data` object with the following properties:

- **signature**: `string` - The cryptographic signature of the transaction.
- **id**: `string` - The unique identifier of the transaction.
- **encodedTx**: `string` - The encoded representation of the transaction.

#### Example

To handle the `tx-approved` event, you need to subscribe to it using the `palisade.on` method. Here's an example of how to do it:

```javascript
palisade.on("tx-approved", (data) => {
  console.log("Transaction Signature:", data.signature);
  console.log("Transaction ID:", data.id);
  console.log("Encoded Transaction:", data.encodedTx);
});
```

<a id="txRejected"></a>

### Event: `tx-rejected`

This event is triggered when a user rejects a transaction. It does not provide any additional data, as it simply indicates the rejection action.

#### Usage

To handle the `tx-rejected` event, you need to subscribe to it using the `palisade.on` method. Here's an example of how to do it:

```javascript
palisade.on("tx-rejected", () => {
  console.log("Transaction was rejected by the user.");
});
```

## Contact

If you have any questions, issues, or feedback, please open an issue on this repository or contact us at support@palisade.co
