import { useState, useCallback, useRef } from 'react';
import { useLocaleState } from 'react-admin';
import { usePsychedSchemaContext } from '@psychedcms/admin-core';

export interface SearchResult {
    text: string;
    slug: string;
    contentType: string;
    id: number;
    score: number;
}

function authHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export function useGlobalSearch() {
    const { entrypoint } = usePsychedSchemaContext();
    const [locale] = useLocaleState();
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const search = useCallback(
        (query: string) => {
            if (timerRef.current) clearTimeout(timerRef.current);

            if (!query.trim() || query.trim().length < 2) {
                setResults([]);
                return;
            }

            timerRef.current = setTimeout(async () => {
                if (!entrypoint) return;
                setLoading(true);
                try {
                    const response = await fetch(
                        `${entrypoint}/search/autocomplete?q=${encodeURIComponent(query)}&locale=${locale}`,
                        { headers: authHeaders() },
                    );
                    if (response.ok) {
                        const data: SearchResult[] = await response.json();
                        setResults(data);
                    }
                } catch {
                    // ignore
                } finally {
                    setLoading(false);
                }
            }, 300);
        },
        [entrypoint, locale],
    );

    const clear = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setResults([]);
    }, []);

    return { results, loading, search, clear };
}
