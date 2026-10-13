import { SERVICE_CONFIG } from './config.ts';
import type {
  IService,
  ServerConfig,
  AltchaChallenge,
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

  async createInstantAccount(): Promise<InstantAccountResult> {
    const randomHex = Math.random().toString(36).substring(2, 14);
    const passHex = Math.random().toString(36).substring(2, 18) + 'Aa1!';
    const email = `dc_${randomHex}@${SERVICE_CONFIG.DOMAIN}`;
    const host = `mail.${SERVICE_CONFIG.DOMAIN}`;
    const dclogin_link = `dclogin:${email}/?p=${encodeURIComponent(passHex)}&v=1&ih=${host}&ip=993&is=ssl&sh=${host}&sp=465&ss=ssl&ic=3`;

    return {
      account_id: `mock_inst_${randomHex}`,
      email,
      password: passHex,
      dclogin_link,
      account_type: 'instant',
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    };
  },

  async createCustomAccount(payload: CustomAccountPayload = {} as CustomAccountPayload): Promise<CustomAccountResult> {
    const { username, password } = payload || ({} as CustomAccountPayload);
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const email = `${username}@${SERVICE_CONFIG.DOMAIN}`;
    const host = `mail.${SERVICE_CONFIG.DOMAIN}`;
    const dclogin_link = `dclogin:${email}/?p=${encodeURIComponent(password)}&v=1&ih=${host}&ip=993&is=ssl&sh=${host}&sp=465&ss=ssl&ic=3`;

    return {
      account_id: `mock_cust_${username}`,
      email,
      dclogin_link,
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
