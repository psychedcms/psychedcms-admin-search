import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    TextField,
    List,
    ListItemButton,
    ListItemText,
    Typography,
    InputAdornment,
    Box,
    CircularProgress,
    Chip,
    IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from 'react-admin';
import { useGlobalSearch, type SearchResult } from '../hooks/useGlobalSearch.ts';

const CONTENT_TYPE_RESOURCE_MAP: Record<string, string> = {
    band: 'bands',
    label: 'labels',
    venue: 'venues',
    festival: 'festivals',
    organization: 'organizations',
    event: 'events',
    release: 'releases',
    review: 'reviews',
    eventreport: 'event-reports',
    post: 'posts',
    tour: 'tours',
};

export function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const { results, loading, search, clear } = useGlobalSearch();
    const navigate = useNavigate();
    const translate = useTranslate();
    const inputRef = useRef<HTMLInputElement>(null);

    // Resolve ES content type to localized display name via React Admin i18n
    const getContentTypeLabel = useCallback(
        (contentType: string): string => {
            const resource = CONTENT_TYPE_RESOURCE_MAP[contentType];
            if (resource) {
                return translate(`resources.${resource}.name`, { _: contentType });
            }
            return contentType;
        },
        [translate],
    );

    const handleOpen = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
        setQuery('');
        clear();
    }, [clear]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setQuery(value);
            search(value);
        },
        [search],
    );

    const handleSelect = useCallback(
        (result: SearchResult) => {
            const resource = CONTENT_TYPE_RESOURCE_MAP[result.contentType];
            if (resource) {
                navigate(`/${resource}/${result.id}`);
            }
            handleClose();
        },
        [navigate, handleClose],
    );

    // Ctrl/Cmd+K shortcut to open search overlay
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(true);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // Group results by content type
    const grouped = results.reduce<Record<string, SearchResult[]>>((acc, result) => {
        const key = result.contentType;
        if (!acc[key]) acc[key] = [];
        acc[key].push(result);
        return acc;
    }, {});

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleOpen}
                aria-label={translate('search.placeholder', { _: 'Search... (Ctrl+K)' })}
                sx={{ mr: 1 }}
            >
                <SearchIcon />
            </IconButton>

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            position: 'fixed',
                            top: '15%',
                            m: 0,
                            maxHeight: '70vh',
                            borderRadius: 2,
                        },
                    },
                }}
                // Auto-focus the input when the dialog opens
                TransitionProps={{
                    onEntered: () => {
                        inputRef.current?.focus();
                    },
                }}
            >
                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2, pb: 1 }}>
                        <TextField
                            inputRef={inputRef}
                            fullWidth
                            size="small"
                            placeholder={translate('search.placeholder', { _: 'Search... (Ctrl+K)' })}
                            value={query}
                            onChange={handleChange}
                            autoComplete="off"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            {loading ? (
                                                <CircularProgress size={20} />
                                            ) : (
                                                <SearchIcon fontSize="small" color="action" />
                                            )}
                                        </InputAdornment>
                                    ),
                                    endAdornment: query ? (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setQuery('');
                                                    clear();
                                                    inputRef.current?.focus();
                                                }}
                                                aria-label="Clear search"
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ) : null,
                                },
                            }}
                        />
                    </Box>

                    {results.length > 0 && (
                        <List dense disablePadding sx={{ maxHeight: 'calc(70vh - 80px)', overflow: 'auto' }}>
                            {Object.entries(grouped).map(([contentType, items]) => (
                                <React.Fragment key={contentType}>
                                    <Box sx={{ px: 2, py: 0.5, backgroundColor: 'action.hover' }}>
                                        <Chip
                                            label={getContentTypeLabel(contentType)}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem', height: 20 }}
                                        />
                                    </Box>
                                    {items.map((result, idx) => (
                                        <ListItemButton
                                            key={`${result.contentType}-${result.id}-${idx}`}
                                            onClick={() => handleSelect(result)}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body2" noWrap>
                                                        {result.text}
                                                    </Typography>
                                                }
                                            />
                                        </ListItemButton>
                                    ))}
                                </React.Fragment>
                            ))}
                        </List>
                    )}

                    {query.length >= 2 && !loading && results.length === 0 && (
                        <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                No results found
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
