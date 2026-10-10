import React from 'react';
import { ShareCard } from '../components/share/ShareCard.jsx';

// ponytail: single-card wrapper route; upgrade to layout container if multi-section share hub needed
export function ShareRoute() {
  return (
    <div className="py-4">
      <ShareCard />
    </div>
  );
}
