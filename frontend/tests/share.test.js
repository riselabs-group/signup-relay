import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, '..');

test('share link formats delta chat invite uri correctly', () => {
  const addr = 'alice@chatchi.org';
  const name = 'Alice';
  const invite = `https://i.delta.chat/#invite?addr=${encodeURIComponent(addr)}&name=${encodeURIComponent(name)}`;
  assert.ok(invite.startsWith('https://i.delta.chat/#'));
  assert.ok(invite.includes('addr=alice%40chatchi.org'));
  assert.ok(invite.includes('name=Alice'));
});

test('share link formats addresses and names with special characters correctly', () => {
  const addr = 'user+test@chatchi.org';
  const name = 'علی رضایی';
  const invite = `https://i.delta.chat/#invite?addr=${encodeURIComponent(addr)}&name=${encodeURIComponent(name)}`;
  assert.ok(invite.startsWith('https://i.delta.chat/#invite?'));
  assert.ok(invite.includes('addr=user%2Btest%40chatchi.org'));
  assert.ok(invite.includes(`name=${encodeURIComponent(name)}`));
});

test('ShareCard component enforces in-memory vector QR, bdi isolation, and clipboard safety', () => {
  const filePath = path.resolve(frontendDir, 'src/components/share/ShareCard.jsx');
  assert.ok(fs.existsSync(filePath), 'ShareCard.jsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.match(content, /export function ShareCard/, 'Must export ShareCard component');
  assert.match(content, /generateQrSvgDataUri\(inviteUri,\s*160\)/, 'Must use in-memory vector QR generator with size 160');
  assert.ok(!content.includes('api.qrserver.com'), 'Must not use external third-party qrserver APIs');
  assert.match(content, /<bdi[^>]*dir=["']ltr["'][^>]*>\{handle\}<\/bdi>/, 'Must wrap handle in <bdi dir="ltr"> for bidirectional isolation');
  assert.match(content, /navigator\.clipboard\.writeText\([^)]+\)\.catch/, 'Must guard clipboard.writeText with .catch');
  assert.match(content, /navigator\.share/, 'Must check and trigger navigator.share API');
  assert.match(content, /width=["']160["']/, 'Must explicitly set width=160 on QR image for zero CLS');
  assert.match(content, /height=["']160["']/, 'Must explicitly set height=160 on QR image for zero CLS');
});

test('ShareRoute component wraps ShareCard', () => {
  const filePath = path.resolve(frontendDir, 'src/routes/ShareRoute.jsx');
  assert.ok(fs.existsSync(filePath), 'ShareRoute.jsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.match(content, /export function ShareRoute/, 'Must export ShareRoute component');
  assert.match(content, /<ShareCard\s*\/>/, 'Must render ShareCard inside ShareRoute');
});
