import LegacyPage from '../components/LegacyPage';
import { legacyMetadata, legacyPages, legacyScripts } from '../legacyContent';

export const metadata = legacyMetadata.pricing;

export default function Page() {
  return <LegacyPage html={legacyPages.pricing} scripts={legacyScripts.pricing} />;
}
