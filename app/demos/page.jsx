import LegacyPage from '../components/LegacyPage';
import { legacyMetadata, legacyPages, legacyScripts } from '../legacyContent';

export const metadata = legacyMetadata.demos;

export default function Page() {
  return <LegacyPage html={legacyPages.demos} scripts={legacyScripts.demos} />;
}
