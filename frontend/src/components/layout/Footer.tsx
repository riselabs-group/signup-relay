import { useI18n } from '../../i18n/index.tsx';
import type { RouteKey } from './Navbar.tsx';

export interface FooterProps {
  onNavigate?: (route: RouteKey) => void;
}

export function Footer(_props?: FooterProps) {
  const { t } = useI18n();

  return (
    <footer className="border-t border-base-300 py-2.5 bg-base-200/40 text-[11px] sm:text-xs text-base-content/70">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-x-2.5 gap-y-1 text-center">
        <span>{t('footer_fs_statement')}</span>
        <span className="hidden sm:inline opacity-40">•</span>
        <span>{t('footer_powered_by')}</span>
        <span className="hidden sm:inline opacity-40">•</span>
        <span className="badge badge-ghost badge-xs">{t('footer_version')}</span>
      </div>
    </footer>
  );
}
