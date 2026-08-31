import LegacyPage from '../components/LegacyPage';
import { legacyMetadata, legacyPages, legacyScripts } from '../legacyContent';

export const metadata = legacyMetadata.blog;

export default function Page() {
  return <LegacyPage html={legacyPages.blog} scripts={legacyScripts.blog} />;
}
