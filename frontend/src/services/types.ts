export interface MailEndpoint {
  host: string;
  port: number;
  security: 'ssl' | 'starttls' | string;
}

export interface EndpointsConfig {
  imap: MailEndpoint;
  smtp: MailEndpoint;
}

export interface AltchaConfig {
  required: boolean;
  max_number: number;
}

export interface ServerConfig {
  domain: string;
  registration_open: boolean;
  instant_accounts_enabled?: boolean;
  password_hash_algorithm: string;
  certificate_checks: string;
  endpoints: EndpointsConfig;
  altcha?: AltchaConfig;
}

export interface AltchaChallenge {
  algorithm: string;
  challenge: string;
  salt: string;
  signature: string;
  max_number?: number;
}

export interface InstantAccountPayload {
  username: string;
  password_hash: string;
  altcha_payload?: string;
}

export interface CustomAccountPayload {
  username: string;
  password_hash: string;
  altcha_payload?: string;
}

export interface InstantAccountResult {
  account_id?: string;
  email: string;
  account_type: 'instant';
}

export interface CustomAccountResult {
  account_id?: string;
  email: string;
  account_type: 'custom';
}

export interface WebxdcApp {
  app_id: string;
  name: string;
  version: string;
  description: string;
  size: number;
  download_url: string;
  icon_url: string;
  source_url?: string;
}

export interface WebxdcCatalog {
  apps: WebxdcApp[];
}

export interface IService {
  getConfig(): Promise<ServerConfig>;
  getAltchaChallenge(): Promise<AltchaChallenge>;
  createInstantAccount(payload: InstantAccountPayload): Promise<InstantAccountResult>;
  createCustomAccount(payload: CustomAccountPayload): Promise<CustomAccountResult>;
  getApps(): Promise<WebxdcCatalog>;
}
