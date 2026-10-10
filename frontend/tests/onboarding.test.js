import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateRandomCredentials, buildDcloginUri } from '../src/utils/dclogin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, '..');

test('instant account pipeline executes synchronously without network', () => {
  const creds = generateRandomCredentials('chatchi.org');
  const uri = buildDcloginUri({
    email: creds.email,
    password: creds.password,
    imapHost: 'mail.chatchi.org',
    smtpHost: 'mail.chatchi.org',
  });

  assert.ok(uri.startsWith('dclogin:'));
  assert.ok(uri.includes(creds.username));
  assert.ok(uri.includes('ih=mail.chatchi.org'));
  assert.ok(uri.includes('sh=mail.chatchi.org'));
});

test('ManualInstructions component file exists and enforces bdi isolation for iOS path', () => {
  const filePath = path.resolve(frontendDir, 'src/components/onboarding/ManualInstructions.jsx');
  assert.ok(fs.existsSync(filePath), 'ManualInstructions.jsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.match(content, /export function ManualInstructions/, 'Must export ManualInstructions component');
  assert.match(content, /useI18n/, 'Must use useI18n hook');
  assert.match(content, /<bdi[^>]*dir=["']ltr["'][^>]*>\{t\(['"]index_ios_path['"]\)\}<\/bdi>/, 'Must wrap iOS path in <bdi dir="ltr">');
  assert.match(content, /index_manual_title/, 'Must display manual title');
});

test('InstantQrCard component file enforces zero-CLS locked dimensions and bdi isolation', () => {
  const filePath = path.resolve(frontendDir, 'src/components/onboarding/InstantQrCard.jsx');
  assert.ok(fs.existsSync(filePath), 'InstantQrCard.jsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.match(content, /export function InstantQrCard/, 'Must export InstantQrCard component');
  assert.match(content, /w-56\s+h-56/, 'Must enforce locked dimension QR container (w-56 h-56 / 224px) for zero CLS');
  assert.match(content, /width=["']200["']/, 'Must explicitly set width=200 on QR image');
  assert.match(content, /height=["']200["']/, 'Must explicitly set height=200 on QR image');
  assert.match(content, /<bdi[^>]*dir=["']ltr["'][^>]*>\{account\.email\}<\/bdi>/, 'Must wrap email in <bdi dir="ltr">');
  assert.match(content, /openDeltaChatUri/, 'Must invoke openDeltaChatUri on open action');
  assert.match(content, /index_dc_not_installed/, 'Must display fallback alert when not installed');
  assert.match(content, /navigator\.clipboard\.writeText/, 'Must copy dclogin link to clipboard');
});

test('CustomWizard component enforces 3-step wizard, locked height, Altcha indicator and credential hygiene', () => {
  const filePath = path.resolve(frontendDir, 'src/components/onboarding/CustomWizard.jsx');
  assert.ok(fs.existsSync(filePath), 'CustomWizard.jsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.match(content, /export function CustomWizard/, 'Must export CustomWizard component');
  assert.match(content, /min-h-\[360px\]/, 'Must enforce locked container height (min-h-[360px]) for zero CLS');
  assert.match(content, /steps\s+steps-horizontal/, 'Must render DaisyUI steps');
  assert.match(content, /step_1_identity/, 'Must render Step 1 Identity');
  assert.match(content, /step_2_security/, 'Must render Step 2 Security');
  assert.match(content, /step_3_ready/, 'Must render Step 3 Ready');
  assert.match(content, /Altcha/i, 'Must display Altcha security indicator');
  assert.match(content, /service\.createCustomAccount/, 'Must call service.createCustomAccount');
  assert.match(content, /setPassword\(['"]['"]\)/, 'Must zero out password in state after account creation');
  assert.match(content, /<bdi[^>]*dir=["']ltr["'][^>]*>@chatchi\.org<\/bdi>/, 'Must wrap domain badge in <bdi dir="ltr">');
  assert.match(content, /<bdi[^>]*dir=["']ltr["'][^>]*>\{result\.email\}<\/bdi>/, 'Must wrap result email in <bdi dir="ltr">');
});

test('OnboardingRoute component renders tab switcher with locked container height', () => {
  const filePath = path.resolve(frontendDir, 'src/routes/OnboardingRoute.jsx');
  assert.ok(fs.existsSync(filePath), 'OnboardingRoute.jsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.match(content, /export function OnboardingRoute/, 'Must export OnboardingRoute component');
  assert.match(content, /role=["']tablist["']/, 'Must render tab list with role="tablist"');
  assert.match(content, /tabs-boxed/, 'Must use DaisyUI tabs-boxed styling');
  assert.match(content, /min-h-\[380px\]/, 'Must enforce locked tab body container height (min-h-[380px])');
  assert.match(content, /<InstantQrCard\s*\/>/, 'Must render InstantQrCard');
  assert.match(content, /<CustomWizard\s*\/>/, 'Must render CustomWizard');
});
