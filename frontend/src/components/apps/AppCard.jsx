import React from 'react';
import { sendXdcToChat } from '../../utils/webxdc.js';

// ponytail: emoji icon placeholder; upgrade to dynamic icon loader if remote icon assets provided
export function AppCard({ app, onSelect }) {
  return (
    <div className="card bg-base-200 border border-base-300 hover:border-primary/50 transition-colors p-4 flex flex-col justify-between">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-base-300 flex-shrink-0 flex items-center justify-center font-bold text-sm text-base-content/80">
          📱
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-sm font-semibold truncate">{app.name}</h4>
            <span className="badge badge-xs badge-outline">{app.version}</span>
          </div>
          <p className="text-xs text-base-content/70 line-clamp-2 mt-1">{app.description}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-base-300 flex items-center justify-between text-xs">
        <button onClick={() => onSelect(app)} className="btn btn-ghost btn-xs">
          جزئیات
        </button>
        <button
          onClick={(e) => sendXdcToChat(e, app.download_url)}
          className="btn btn-primary btn-xs"
        >
          افزودن به چت
        </button>
      </div>
    </div>
  );
}
