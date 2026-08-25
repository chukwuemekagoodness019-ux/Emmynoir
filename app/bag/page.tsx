import { getSettingsAsync } from '@/lib/data/site-settings';
import { BagContent } from './bag-content';

export const dynamic = 'force-dynamic';

export default async function BagPage() {
  const settings = await getSettingsAsync();
  return <BagContent settings={settings} />;
}
