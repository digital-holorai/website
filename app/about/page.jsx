import LegacyPage from '../components/LegacyPage';
import { legacyMetadata, legacyPages, legacyScripts } from '../legacyContent';

export const metadata = legacyMetadata.about;

export default function Page() {
  return <LegacyPage html={legacyPages.about} scripts={legacyScripts.about} />;
}
