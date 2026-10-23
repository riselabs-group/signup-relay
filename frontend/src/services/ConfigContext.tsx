import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { service } from './index.ts';
import type { ServerConfig } from './types.ts';

const ConfigContext = createContext<ServerConfig | null>(null);

// ponytail: single application-wide config provider; upgrade to SWR / React Query if config polling needed
export function ConfigProvider({
  children,
  initialConfig = null,
}: {
  children: ReactNode;
  initialConfig?: ServerConfig | null;
}) {
  const [config, setConfig] = useState<ServerConfig | null>(initialConfig);

  useEffect(() => {
    let mounted = true;
    service
      .getConfig()
      .then((cfg) => {
        if (mounted && cfg) setConfig(cfg);
      })
      .catch(() => {
        // Safe fallback
      });
    return () => {
      mounted = false;
    };
  }, []);

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useServerConfig(): ServerConfig | null {
  return useContext(ConfigContext);
}
