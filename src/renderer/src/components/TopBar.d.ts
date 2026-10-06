import React from 'react';
interface TopBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeFilter: 'all' | 'installed' | 'favorites';
    onFilterChange: (filter: 'all' | 'installed' | 'favorites') => void;
    onOpenAddModal: () => void;
    showFilters?: boolean;
}
export declare const TopBar: React.FC<TopBarProps>;
export {};
