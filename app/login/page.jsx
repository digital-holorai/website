import LegacyPage from '../components/LegacyPage';
import { legacyMetadata, legacyPages, legacyScripts } from '../legacyContent';

export const metadata = legacyMetadata.login;

export default function Page() {
  return <LegacyPage html={legacyPages.login} scripts={legacyScripts.login} />;
}
