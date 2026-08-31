import LegacyPage from '../components/LegacyPage';
import { legacyMetadata, legacyPages, legacyScripts } from '../legacyContent';

export const metadata = legacyMetadata.portfolio;

export default function Page() {
  return <LegacyPage html={legacyPages.portfolio} scripts={legacyScripts.portfolio} />;
}
