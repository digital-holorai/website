import LegacyPage from '../components/LegacyPage';
import { legacyMetadata, legacyPages, legacyScripts } from '../legacyContent';

export const metadata = legacyMetadata.case;

export default function Page() {
  return <LegacyPage html={legacyPages.case} scripts={legacyScripts.case} />;
}
