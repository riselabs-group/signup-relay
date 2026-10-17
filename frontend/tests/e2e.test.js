import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, '..');
const findFile = (base, name) => {
  const tsx = path.resolve(base, `${name}.tsx`);
  const jsx = path.resolve(base, `${name}.jsx`);
  return fs.existsSync(tsx) ? tsx : jsx;
};

const appPath = findFile(path.resolve(frontendDir, 'src'), 'App');
const mainPath = findFile(path.resolve(frontendDir, 'src'), 'main');
const navbarPath = findFile(path.resolve(frontendDir, 'src/components/layout'), 'Navbar');
const footerPath = findFile(path.resolve(frontendDir, 'src/components/layout'), 'Footer');
const shellPath = findFile(path.resolve(frontendDir, 'src/components/layout'), 'Shell');

test('main App assembly imports all four primary routes', () => {
  assert.ok(fs.existsSync(appPath), 'App.tsx or App.jsx must exist');

  const content = fs.readFileSync(appPath, 'utf8');
  assert.match(content, /OnboardingRoute/, 'Must import OnboardingRoute');
  assert.match(content, /ShareRoute/, 'Must import ShareRoute');
  assert.match(content, /AppsRoute/, 'Must import AppsRoute');
  assert.match(content, /DocsRoute/, 'Must import DocsRoute');
  assert.match(content, /I18nProvider/, 'Must wrap with I18nProvider');
  assert.match(content, /Shell/, 'Must wrap with Shell');
});

test('Navbar component renders brand, routes, and toggles', () => {
  assert.ok(fs.existsSync(navbarPath), 'Navbar must exist');
  const content = fs.readFileSync(navbarPath, 'utf8');
  assert.match(content, /export function Navbar/);
  assert.match(content, /app_title|MailiaM/);
  assert.ok(!content.includes('badge-neutral'), 'Must remove Relay badge');
  assert.match(content, /logo\.svg/, 'Must render logo image');
  assert.match(content, /nav_home/);
  assert.match(content, /nav_apps/);
  assert.match(content, /nav_docs/);
  assert.match(content, /toggleLang/);
});

test('Footer component renders minimal statement, powered-by, and version', () => {
  assert.ok(fs.existsSync(footerPath), 'Footer must exist');
  const content = fs.readFileSync(footerPath, 'utf8');
  assert.match(content, /export function Footer/);
  assert.match(content, /footer_fs_statement/);
  assert.match(content, /footer_powered_by/);
  assert.match(content, /footer_version/);
  assert.ok(!content.includes('footer_fs_what'), 'Must not render philosophy link in footer');
  assert.ok(!content.includes('DeltaChat'), 'Must not render redundant DeltaChat link in footer');
  assert.ok(!content.includes('AGPL-3.0'), 'Must not render license link in footer');
});

test('Shell component synchronizes theme and direction', () => {
  assert.ok(fs.existsSync(shellPath), 'Shell must exist');
  const content = fs.readFileSync(shellPath, 'utf8');
  assert.match(content, /export function Shell/);
  assert.match(content, /useI18n/);
  assert.match(content, /data-theme/);
  assert.match(content, /chatchi-dark/);
  assert.match(content, /chatchi-light/);
  assert.match(content, /dir=\{dir\}/);
});

test('main.tsx mounts App and imports index.css', () => {
  assert.ok(fs.existsSync(mainPath), 'main must exist');
  const content = fs.readFileSync(mainPath, 'utf8');
  assert.match(content, /import App from '\.\/App(\.tsx|\.jsx)?'/);
  assert.match(content, /import '\.\/index\.css'/);
  assert.match(content, /createRoot/);
});

test('multi-route architecture provides HTML entrypoints and path resolution', async () => {
  const { getRouteFromPath, getPathForRoute } = await import('../src/utils/router.ts');

  assert.equal(getRouteFromPath('/'), 'home');
  assert.equal(getRouteFromPath('/share'), 'share');
  assert.equal(getRouteFromPath('/share.html'), 'share');
  assert.equal(getRouteFromPath('/apps'), 'apps');
  assert.equal(getRouteFromPath('/apps.html'), 'apps');
  assert.equal(getRouteFromPath('/docs'), 'docs');
  assert.equal(getRouteFromPath('/docs/deploy'), 'docs');
  assert.equal(getRouteFromPath('/docs.html'), 'docs');
  assert.equal(getRouteFromPath('/unknown', '#/share'), 'share');

  assert.equal(getPathForRoute('home'), '/');
  assert.equal(getPathForRoute('share'), '/share');
  assert.equal(getPathForRoute('apps'), '/apps');
  assert.equal(getPathForRoute('docs'), '/docs');

  // Verify all 4 HTML entry points exist
  assert.ok(fs.existsSync(path.resolve(frontendDir, 'index.html')), 'index.html must exist');
  assert.ok(fs.existsSync(path.resolve(frontendDir, 'share.html')), 'share.html must exist');
  assert.ok(fs.existsSync(path.resolve(frontendDir, 'apps.html')), 'apps.html must exist');
  assert.ok(fs.existsSync(path.resolve(frontendDir, 'docs.html')), 'docs.html must exist');

  // Verify vite.config.ts multi-page configuration
  const viteConfigPath = path.resolve(frontendDir, 'vite.config.ts');
  assert.ok(fs.existsSync(viteConfigPath), 'vite.config.ts must exist');
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  assert.match(viteConfig, /share\.html/, 'Must register share.html input in vite rollupOptions');
  assert.match(viteConfig, /apps\.html/, 'Must register apps.html input in vite rollupOptions');
  assert.match(viteConfig, /docs\.html/, 'Must register docs.html input in vite rollupOptions');
});
