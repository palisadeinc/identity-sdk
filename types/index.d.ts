export declare class PalisadeIdentitySDK {
  constructor(config: Config);

  connect(): void;
  disconnect(): void;
  destroy(): void;
  signTransaction(rawTransactionHash: string): Promise<void>;
  submitTransaction(rawTransactionHash: string): Promise<void>;

  on(
    event: 'connected',
    callback: (wallet: PalisadeIdentitySDK.Wallet) => void
  ): void;
  on(event: 'disconnected', callback: () => void): void;
  on(
    event: 'error',
    callback: (error: PalisadeIdentitySDK.Error) => void
  ): void;
  on(
    event: 'transaction-approved',
    callback: (data: PalisadeIdentitySDK.TransactionApprovedData) => void
  ): void;
  on(event: 'transaction-rejected', callback: () => void): void;
  on(
    event: 'transaction-failed',
    callback: (data: PalisadeIdentitySDK.TransactionFailedData) => void
  ): void;

  off(eventName: string): void;
  emit(eventName: string, data?: any): void;
}

export enum Environment {
  DEVELOPMENT = 'DEVELOPMENT',
  SANDBOX = 'SANDBOX',
  PRODUCTION = 'PRODUCTION'
}

export enum ErrorLevel {
  SDK = 'SDK',
  SERVICE = 'SERVICE',
  UNKNOWN = 'UNKNOWN'
}

export interface Config {
  clientId: string;
  environment?: Environment;
  iconUrl?: string;
  logoAlt?: string;
  logoUrl?: string;
  options?: {
    autoconnect?: boolean;
    isConnectEnabled?: boolean;
    isCreateEnabled?: boolean;
  };
  passkeyName?: string;
}

export interface Error {
  code: ErrorCode | string;
  description?: string;
  level: ErrorLevel;
}

export interface Wallet {
  Address: string;
  ID: string;
  PublicKey: string;
  Status: string;
}

export interface TransactionApprovedData {
  signature: string;
  id: string;
  encodedTransaction: string;
}

export interface TransactionFailedData {
  reasons: string[];
  transactionId: string;
  transactionStatus: string;
}

export interface ErrorInfo {
  code: ErrorCode;
  title: string;
  description: string;
  level: ErrorLevel;
}

export enum ErrorCode {
  // Service-level errors (001-099)
  NO_CLIENT_CONFIG = 'PAL.ERROR.001',
  LOGIN_ERROR = 'PAL.ERROR.002',
  BROWSER_NOT_SUPPORTED = 'PAL.ERROR.003',
  REGISTRATION_ERROR = 'PAL.ERROR.004',
  UNABLE_TO_GET_USER_CONNECTION = 'PAL.ERROR.005',
  UNAUTHORIZED = 'PAL.ERROR.006',
  UNABLE_TO_FETCH_CLIENT_DETAILS = 'PAL.ERROR.007',
  WALLET_POLLING_ERROR = 'PAL.ERROR.008',
  UNABLE_TO_PROVISION_WALLET = 'PAL.ERROR.009',
  UNABLE_TO_CREATE_CREDENTIAL = 'PAL.ERROR.010',
  UNABLE_TO_AUTHORIZE_APPROVE_CONNECTION = 'PAL.ERROR.011',
  UNABLE_TO_GET_WALLET_SERVICE = 'PAL.ERROR.012',
  ACTION_NOT_DEFINED = 'PAL.ERROR.013',
  TRANSACTION_ID_NOT_DEFINED = 'PAL.ERROR.014',
  UNABLE_TO_DECODE_RAW_TRANSACTION = 'PAL.ERROR.015',
  UNABLE_TO_GET_APPROVAL_CREDENTIAL_OPTIONS = 'PAL.ERROR.016',
  UNABLE_TO_AUTHORIZE_APPROVE_TRANSACTION = 'PAL.ERROR.017',
  NO_APPROVAL_SUMMARY_FOR_TRANSACTION_ID = 'PAL.ERROR.018',
  UNABLE_TO_APPROVE_TRANSACTION = 'PAL.ERROR.019',
  UNABLE_TO_FETCH_SIGNATURE = 'PAL.ERROR.020',
  UNABLE_TO_FETCH_TRANSACTION = 'PAL.ERROR.021',
  TRANSACTION_FAILED = 'PAL.ERROR.022',
  CLIENT_CONFIG_OPTIONS_INVALID = 'PAL.ERROR.023',
  TRANSLATION_ERROR = 'PAL.ERROR.024',
  WALLET_NOT_PROVISIONED = 'PAL.ERROR.025',
  UNABLE_TO_UPDATE_PASSKEY_NAME = 'PAL.ERROR.026',

  // SDK-level errors (101-199)
  NOT_CONNECTED = 'PAL.ERROR.101',
  NO_AUTH_TOKEN = 'PAL.ERROR.102',
  UNABLE_TO_GET_WALLET = 'PAL.ERROR.103',
  UNABLE_TO_SIGN_TRANSACTION = 'PAL.ERROR.104',
  UNABLE_TO_SUBMIT_TRANSACTION = 'PAL.ERROR.105',
  JWT_NOT_AUTHENTICATED = 'PAL.ERROR.106',
  INVALID_TRANSACTION_HASH = 'PAL.ERROR.107',
  INVALID_TOKEN = 'PAL.ERROR.108',
  INVALID_TRANSACTION_DETAILS = 'PAL.ERROR.109'
}

export const ERROR_INFO: Record<ErrorCode, ErrorInfo>;

export enum PalisadeErrorCode {
  // Service-level errors (001-099)
  NO_CLIENT_CONFIG = 'PAL.ERROR.001',
  LOGIN_ERROR = 'PAL.ERROR.002',
  BROWSER_NOT_SUPPORTED = 'PAL.ERROR.003',
  REGISTRATION_ERROR = 'PAL.ERROR.004',
  UNABLE_TO_GET_USER_CONNECTION = 'PAL.ERROR.005',
  UNAUTHORIZED = 'PAL.ERROR.006',
  UNABLE_TO_FETCH_CLIENT_DETAILS = 'PAL.ERROR.007',
  WALLET_POLLING_ERROR = 'PAL.ERROR.008',
  UNABLE_TO_PROVISION_WALLET = 'PAL.ERROR.009',
  UNABLE_TO_CREATE_CREDENTIAL = 'PAL.ERROR.010',
  UNABLE_TO_AUTHORIZE_APPROVE_CONNECTION = 'PAL.ERROR.011',
  UNABLE_TO_GET_WALLET_SERVICE = 'PAL.ERROR.012',
  ACTION_NOT_DEFINED = 'PAL.ERROR.013',
  TRANSACTION_ID_NOT_DEFINED = 'PAL.ERROR.014',
  UNABLE_TO_DECODE_RAW_TRANSACTION = 'PAL.ERROR.015',
  UNABLE_TO_GET_APPROVAL_CREDENTIAL_OPTIONS = 'PAL.ERROR.016',
  UNABLE_TO_AUTHORIZE_APPROVE_TRANSACTION = 'PAL.ERROR.017',
  NO_APPROVAL_SUMMARY_FOR_TRANSACTION_ID = 'PAL.ERROR.018',
  UNABLE_TO_APPROVE_TRANSACTION = 'PAL.ERROR.019',
  UNABLE_TO_FETCH_SIGNATURE = 'PAL.ERROR.020',
  UNABLE_TO_FETCH_TRANSACTION = 'PAL.ERROR.021',
  TRANSACTION_FAILED = 'PAL.ERROR.022',
  CLIENT_CONFIG_OPTIONS_INVALID = 'PAL.ERROR.023',
  TRANSLATION_ERROR = 'PAL.ERROR.024',
  WALLET_NOT_PROVISIONED = 'PAL.ERROR.025',
  UNABLE_TO_UPDATE_PASSKEY_NAME = 'PAL.ERROR.026',

  // SDK-level errors (101-199)
  NOT_CONNECTED = 'PAL.ERROR.101',
  NO_AUTH_TOKEN = 'PAL.ERROR.102',
  UNABLE_TO_GET_WALLET = 'PAL.ERROR.103',
  UNABLE_TO_SIGN_TRANSACTION = 'PAL.ERROR.104',
  UNABLE_TO_SUBMIT_TRANSACTION = 'PAL.ERROR.105',
  JWT_NOT_AUTHENTICATED = 'PAL.ERROR.106',
  INVALID_TRANSACTION_HASH = 'PAL.ERROR.107',
  INVALID_TOKEN = 'PAL.ERROR.108',
  INVALID_TRANSACTION_DETAILS = 'PAL.ERROR.109'
}

export interface PalisadeErrorInfo {
  code: PalisadeErrorCode;
  title: string;
  description: string;
  level: 'SDK' | 'SERVICE';
}

export const ERROR_INFO: Record<PalisadeErrorCode, PalisadeErrorInfo>;
