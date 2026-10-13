import { ShareCard } from '../components/share/ShareCard.tsx';

// ponytail: single-card wrapper route; upgrade to layout container if multi-section share hub needed
export function ShareRoute() {
  return (
    <div className="py-4">
      <ShareCard />
    </div>
  );
}
