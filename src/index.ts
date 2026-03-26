import { registerPlugin } from '@psychedcms/admin-core';
import { GlobalSearch } from './components/GlobalSearch.tsx';
import { frMessages } from './i18n/fr.ts';
import { enMessages } from './i18n/en.ts';

registerPlugin({
    appBarItems: [{ component: GlobalSearch, position: 0 }],
    i18nMessages: { fr: frMessages, en: enMessages },
});

export { GlobalSearch } from './components/GlobalSearch.tsx';
export { useGlobalSearch } from './hooks/useGlobalSearch.ts';
export type { SearchResult } from './hooks/useGlobalSearch.ts';
