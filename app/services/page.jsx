import LegacyPage from '../components/LegacyPage';
import { legacyMetadata, legacyPages, legacyScripts } from '../legacyContent';

export const metadata = legacyMetadata.services;

export default function Page() {
  return <LegacyPage html={legacyPages.services} scripts={legacyScripts.services} />;
}
