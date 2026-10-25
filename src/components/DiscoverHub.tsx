import type { View } from '../types';
import { useReaderCatalog } from '../data/reader-catalog';
import { buildBountyBoard } from '../data/bounty-board';
import { buildMysteries } from '../data/mysteries';
import { useReadingHorizon } from '../reading-horizon';
import { FeatureCards } from './FeatureCards';
import { focusReadingProgress } from './ReadingControls';

/** The Discover tab's front door: one card per tool, with live counts at the reader's progress. */
export default function DiscoverHub({ onNavigate }: { onNavigate: (view: View) => void }) {
  const through = useReadingHorizon();
  const { characters, devilFruits } = useReaderCatalog();
  const counts: Partial<Record<View, string>> = {
    bounties: `${buildBountyBoard(characters).length} posters`,
    'devil-fruits': `${devilFruits.length} fruits`,
    trails: `${characters.length} trails`,
    mysteries: `${buildMysteries(through).length} questions`,
  };
  return <section className="discovery-view discover-hub" aria-labelledby="discover-title">
    <header className="discovery-hero">
      <div><span className="micro">DISCOVER · TOOLS FOR THE VOYAGE</span><h1 id="discover-title">Everything beyond<br /><i>the voyage map.</i></h1><p>Pick up where you left off, look up a bounty or a Devil Fruit, follow a character, or make your own wanted poster. Everything respects your reading progress.</p></div>
    </header>
    {through === 0 ? <div className="discover-hub-empty"><p>You haven’t set where you are in the story yet, so these tools have nothing to show. Choose your last completed arc to fill them.</p><button className="button" type="button" onClick={focusReadingProgress}>Set reading progress</button></div> : null}
    <FeatureCards onNavigate={onNavigate} counts={counts} />
  </section>;
}
