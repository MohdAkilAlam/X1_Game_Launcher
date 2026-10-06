import React from 'react';
interface EmptyStateProps {
    onOpenAddModal: () => void;
    isSearchEmpty?: boolean;
    searchQuery?: string;
    onClearSearch?: () => void;
}
export declare const EmptyState: React.FC<EmptyStateProps>;
export {};
