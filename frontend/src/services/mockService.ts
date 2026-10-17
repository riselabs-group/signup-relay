import { SERVICE_CONFIG } from './config.ts';
import type {
  IService,
  ServerConfig,
  AltchaChallenge,
  InstantAccountPayload,
  InstantAccountResult,
  CustomAccountPayload,
  CustomAccountResult,
  WebxdcCatalog,
} from './types.ts';

export const mockService: IService = {
  async getConfig(): Promise<ServerConfig> {
    return {
      domain: SERVICE_CONFIG.DOMAIN,
      registration_open: true,
      instant_accounts_enabled: true,
      custom_accounts_enabled: true,
      instant_prefix_enabled: true,
      instant_prefix: 'dc_',
      custom_prefix_enabled: false,
      custom_prefix: '',
      password_hash_algorithm: 'argon2id',
      certificate_checks: '1',
      endpoints: {
        imap: { host: `mail.${SERVICE_CONFIG.DOMAIN}`, port: 993, security: 'ssl' },
        smtp: { host: `mail.${SERVICE_CONFIG.DOMAIN}`, port: 465, security: 'ssl' },
      },
      altcha: { required: true, max_number: 10000 },
    };
  },

  async getAltchaChallenge(): Promise<AltchaChallenge> {
    return {
      algorithm: 'SHA-256',
      challenge: 'mock_challenge_' + Math.random().toString(36).substring(2),
      salt: Date.now() + ':mock_salt',
      signature: 'mock_signature',
      max_number: 10000,
    };
  },

  async createInstantAccount(payload: InstantAccountPayload): Promise<InstantAccountResult> {
    const username = payload?.username;
    const email = `${username}@${SERVICE_CONFIG.DOMAIN}`;
    return {
      account_id: `mock_inst_${username}`,
      email,
      account_type: 'instant',
    };
  },

  async createCustomAccount(payload: CustomAccountPayload): Promise<CustomAccountResult> {
    const { username } = payload;
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    return {
      account_id: `mock_cust_${username}`,
      email: `${username}@${SERVICE_CONFIG.DOMAIN}`,
      account_type: 'custom',
    };
  },

  async getApps(): Promise<WebxdcCatalog> {
    return {
      apps: [
        {
          app_id: 'chat.delta.webxdc.chess',
          name: 'Chess WebXDC',
          version: '1.4.2',
          description: 'Play chess with your contacts directly inside DeltaChat.',
          size: 420000,
          download_url: '/apps/xdcstore/packages/chess.xdc',
          icon_url: '/apps/xdcstore/icons/chess.png',
        },
      ],
    };
  },
};
