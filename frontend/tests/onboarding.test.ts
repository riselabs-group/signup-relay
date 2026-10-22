import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateRandomCredentials, buildDcloginUri } from '../src/utils/dclogin.ts';
import { solveAltcha, sha256Hex } from '../src/utils/altcha.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, '..');
const findFile = (base: string, name: string) => {
  const tsx = path.resolve(base, `${name}.tsx`);
  const jsx = path.resolve(base, `${name}.jsx`);
  return fs.existsSync(tsx) ? tsx : jsx;
};

test('instant account pipeline executes synchronously without network', () => {
  const creds = generateRandomCredentials('chatchi.org');
  const uri = buildDcloginUri({
    email: creds.email,
    password: creds.password,
    imapHost: 'mail.chatchi.org',
    imapPort: 993,
    imapSecurity: 'ssl',
    smtpHost: 'mail.chatchi.org',
    smtpPort: 465,
    smtpSecurity: 'ssl',
    certificateChecks: '1',
  });

  assert.ok(uri.startsWith('dclogin:'));
  assert.ok(uri.includes(creds.username));
  assert.ok(uri.includes('ih=mail.chatchi.org'));
  assert.ok(uri.includes('sh=mail.chatchi.org'));
});

test('solveAltcha solves mock and real SHA-256 challenges', async () => {
  const mockChallenge = {
    algorithm: 'SHA-256',
    challenge: 'mock_challenge_abc',
    salt: 'salt123',
    signature: 'sig123',
  };
  const mockPayload = await solveAltcha(mockChallenge);
  assert.ok(mockPayload);
  const decodedMock = JSON.parse(Buffer.from(mockPayload, 'base64').toString('utf8'));
  assert.equal(decodedMock.challenge, 'mock_challenge_abc');

  const salt = 'testsalt_';
  const targetNumber = 42;
  const hash = await sha256Hex(`${salt}${targetNumber}`);
  const realChallenge = {
    algorithm: 'SHA-256',
    challenge: hash,
    salt,
    signature: 'sig_real',
    max_number: 100,
  };
  const realPayload = await solveAltcha(realChallenge);
  assert.ok(realPayload);
  const decodedReal = JSON.parse(Buffer.from(realPayload, 'base64').toString('utf8'));
  assert.equal(decodedReal.number, targetNumber);
  assert.equal(decodedReal.challenge, hash);
});

test('ManualInstructions component file exists and enforces bdi isolation for iOS path', () => {
  const filePath = findFile(path.resolve(frontendDir, 'src/components/onboarding'), 'ManualInstructions');
  assert.ok(fs.existsSync(filePath), 'ManualInstructions.tsx or ManualInstructions.jsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.match(content, /export function ManualInstructions/, 'Must export ManualInstructions component');
  assert.match(content, /useI18n/, 'Must use useI18n hook');
  assert.match(content, /<bdi[^>]*dir=["']ltr["'][^>]*>\{t\(['"]index_ios_path['"]\)\}<\/bdi>/, 'Must wrap iOS path in <bdi dir="ltr">');
  assert.match(content, /index_manual_title/, 'Must display manual title');
  assert.match(content, /dcloginLink/, 'Must receive dcloginLink');
  assert.match(content, /select-all/, 'Must render selectable code box for manual copy');
});

test('InstantQrCard component file enforces zero-CLS locked dimensions and bdi isolation', () => {
  const filePath = findFile(path.resolve(frontendDir, 'src/components/onboarding'), 'InstantQrCard');
  assert.ok(fs.existsSync(filePath), 'InstantQrCard.tsx or InstantQrCard.jsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.match(content, /export function InstantQrCard/, 'Must export InstantQrCard component');
  assert.match(content, /w-56\s+h-56/, 'Must enforce locked dimension QR container (w-56 h-56 / 224px) for zero CLS');
  assert.match(content, /width=["']200["']/, 'Must explicitly set width=200 on QR image');
  assert.match(content, /height=["']200["']/, 'Must explicitly set height=200 on QR image');
  assert.match(content, /generateQrSvgDataUri\(account\.dclogin_link,\s*200\)/, 'Must use client-side in-memory QR generator');
  assert.ok(!content.includes('api.qrserver.com'), 'Must not send credentials to third-party QR API');
  assert.match(content, /<bdi[^>]*dir=["']ltr["'][^>]*>\{account\.email\}<\/bdi>/, 'Must wrap email in <bdi dir="ltr">');
  assert.match(content, /openDeltaChatUri/, 'Must invoke openDeltaChatUri on open action');
  assert.match(content, /index_dc_not_installed/, 'Must display fallback alert when not installed');
  assert.match(content, /navigator\.clipboard\.writeText\([^)]+\)\.catch/, 'Must guard clipboard writeText with catch');
  assert.match(content, /AltchaWidget/, 'Must embed AltchaWidget when altcha.required');
  assert.match(content, /needAltcha/, 'Must gate Altcha on config.altcha.required');
  assert.match(content, /service\.createInstantAccount/, 'Must call service.createInstantAccount');
  assert.match(content, /createAccountWithQr/);
  assert.match(content, /apiErrorKey/);
  assert.match(content, /generateInstantUsername\(config\)/, 'Must pass config to generateInstantUsername');
  assert.doesNotMatch(content, /service\.getConfig/);
  assert.doesNotMatch(content, /result\.dclogin_link/);
});

test('AltchaWidget component exists and handles verification challenge', () => {
  const filePath = findFile(path.resolve(frontendDir, 'src/components/onboarding'), 'AltchaWidget');
  assert.ok(fs.existsSync(filePath), 'AltchaWidget.tsx or AltchaWidget.jsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.match(content, /export function AltchaWidget/, 'Must export AltchaWidget component');
  assert.match(content, /service\.getAltchaChallenge/, 'Must fetch Altcha challenge');
  assert.match(content, /solveAltcha/, 'Must invoke solveAltcha');
  assert.match(content, /altcha_click_to_verify/, 'Must provide click to verify text');
  assert.match(content, /altcha_verifying/, 'Must display verifying state');
  assert.match(content, /altcha_verified/, 'Must display verified state');
});

test('CustomWizard component enforces 2-step wizard, locked height, AltchaWidget and credential hygiene', () => {
  const filePath = findFile(path.resolve(frontendDir, 'src/components/onboarding'), 'CustomWizard');
  assert.ok(fs.existsSync(filePath), 'CustomWizard.tsx or CustomWizard.jsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.match(content, /export function CustomWizard/, 'Must export CustomWizard component');
  assert.match(content, /min-h-\[360px\]/, 'Must enforce locked container height (min-h-[360px]) for zero CLS');
  assert.match(content, /steps\s+steps-horizontal/, 'Must render DaisyUI steps');
  assert.match(content, /step_1_personalize/, 'Must render Step 1 Personalization');
  assert.match(content, /step_2_activate/, 'Must render Step 2 Activation');
  assert.match(content, /AltchaWidget/, 'Must embed AltchaWidget in step 1 when required');
  assert.match(content, /needAltcha/, 'Must gate Altcha on config.altcha.required');
  assert.match(content, /service\.createCustomAccount/, 'Must call service.createCustomAccount');
  assert.match(content, /createAccountWithQr/);
  assert.match(content, /apiErrorKey/);
  assert.match(content, /validateCustomUsername/);
  assert.match(content, /generateQrSvgDataUri\(account\.dclogin_link,\s*200\)/, 'Must render in-memory QR code for completed custom account');
  assert.match(content, /openDeltaChatUri/, 'Must provide openDeltaChatUri action on custom completion');
  assert.match(content, /ManualInstructions/, 'Must render ManualInstructions on custom completion');
  assert.match(content, /navigator\.clipboard\.writeText\([^)]+\)\.catch/, 'Must guard clipboard writeText on custom completion');
  assert.doesNotMatch(content, /service\.getConfig/);
  assert.match(content, /dir=["']ltr["']/, 'Must pin username+domain join to LTR');
  assert.match(content, /validateCustomPassword/);
  assert.match(content, /wizard_password_optional/);
  assert.match(content, /EyeOff/);
  assert.match(content, /<bdi[^>]*dir=["']ltr["'][^>]*>@\{(?:domain|SERVICE_CONFIG\.DOMAIN)\}<\/bdi>/, 'Must wrap domain badge in <bdi dir="ltr">');
  assert.match(content, /hasCustomPrefix/, 'Must support dynamic custom prefix badge');
  assert.match(content, /custom_accounts_enabled/, 'Must gate on custom_accounts_enabled');
  assert.match(content, /<bdi[^>]*dir=["']ltr["'][^>]*>\{account\.email\}<\/bdi>/, 'Must wrap result email in <bdi dir="ltr">');
  assert.doesNotMatch(content, /result\.dclogin_link/);
});

test('OnboardingRoute component renders hero with CTA, feature cards, and bottom account setup with online/offline badge', () => {
  const filePath = findFile(path.resolve(frontendDir, 'src/routes'), 'OnboardingRoute');
  assert.ok(fs.existsSync(filePath), 'OnboardingRoute.tsx or OnboardingRoute.jsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.match(content, /export function OnboardingRoute/, 'Must export OnboardingRoute component');
  assert.match(content, /hero\s+min-h-/, 'Must use DaisyUI hero component');
  assert.match(content, /hero-content/, 'Must use DaisyUI hero-content');
  assert.match(content, /hero_headline/, 'Must render hero headline');
  assert.match(content, /hero_subheadline/, 'Must render hero subheadline');
  assert.match(content, /hero_cta_create_account/, 'Must render hero CTA button');
  assert.match(content, /card_calls_title/, 'Must render platform feature cards');
  assert.match(content, /account-setup/, 'Must anchor account setup container at bottom');
  assert.match(content, /status_online/, 'Must render status_online badge indicator');
  assert.match(content, /status_offline/, 'Must render status_offline badge indicator');
  assert.match(content, /role=["']tablist["']/, 'Must render tab list with role="tablist"');
  assert.match(content, /tabs-boxed/, 'Must use DaisyUI tabs-boxed styling');
  assert.match(content, /min-h-\[380px\]/, 'Must enforce locked tab body container height (min-h-[380px])');
  assert.match(content, /service\.getConfig/, 'Must fetch config once at the route');
  assert.match(content, /<InstantQrCard\s+config=\{config\}/, 'Must pass config into InstantQrCard');
  assert.match(content, /<CustomWizard\s+config=\{config\}/, 'Must pass config into CustomWizard');
});
