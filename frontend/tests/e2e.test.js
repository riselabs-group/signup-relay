import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, '..');
const appPath = path.resolve(frontendDir, 'src/App.jsx');
const mainPath = path.resolve(frontendDir, 'src/main.jsx');
const navbarPath = path.resolve(frontendDir, 'src/components/layout/Navbar.jsx');
const footerPath = path.resolve(frontendDir, 'src/components/layout/Footer.jsx');
const shellPath = path.resolve(frontendDir, 'src/components/layout/Shell.jsx');

test('main App assembly imports all four primary routes', () => {
  assert.ok(fs.existsSync(appPath), 'App.jsx must exist');

  const content = fs.readFileSync(appPath, 'utf8');
  assert.match(content, /OnboardingRoute/, 'Must import OnboardingRoute');
  assert.match(content, /ShareRoute/, 'Must import ShareRoute');
  assert.match(content, /AppsRoute/, 'Must import AppsRoute');
  assert.match(content, /DocsRoute/, 'Must import DocsRoute');
  assert.match(content, /I18nProvider/, 'Must wrap with I18nProvider');
  assert.match(content, /Shell/, 'Must wrap with Shell');
});

test('Navbar component renders brand, routes, and toggles', () => {
  assert.ok(fs.existsSync(navbarPath), 'Navbar.jsx must exist');
  const content = fs.readFileSync(navbarPath, 'utf8');
  assert.match(content, /export function Navbar/);
  assert.match(content, /Chatchi/);
  assert.match(content, /Relay/);
  assert.match(content, /nav_home/);
  assert.match(content, /nav_share/);
  assert.match(content, /nav_apps/);
  assert.match(content, /nav_docs/);
  assert.match(content, /toggleLang/);
});

test('Footer component renders free software statement and philosophy link', () => {
  assert.ok(fs.existsSync(footerPath), 'Footer.jsx must exist');
  const content = fs.readFileSync(footerPath, 'utf8');
  assert.match(content, /export function Footer/);
  assert.match(content, /footer_fs_statement/);
  assert.match(content, /footer_fs_what/);
  assert.match(content, /DeltaChat/);
  assert.match(content, /AGPL-3\.0/);
});

test('Shell component synchronizes theme and direction', () => {
  assert.ok(fs.existsSync(shellPath), 'Shell.jsx must exist');
  const content = fs.readFileSync(shellPath, 'utf8');
  assert.match(content, /export function Shell/);
  assert.match(content, /useI18n/);
  assert.match(content, /data-theme/);
  assert.match(content, /chatchi-dark/);
  assert.match(content, /chatchi-light/);
  assert.match(content, /dir=\{dir\}/);
});

test('main.jsx mounts App and imports index.css', () => {
  assert.ok(fs.existsSync(mainPath), 'main.jsx must exist');
  const content = fs.readFileSync(mainPath, 'utf8');
  assert.match(content, /import App from '\.\/App\.jsx'/);
  assert.match(content, /import '\.\/index\.css'/);
  assert.match(content, /createRoot/);
});
