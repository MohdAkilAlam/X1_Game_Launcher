import React from 'react';
interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDanger?: boolean;
}
export declare const ConfirmDialog: React.FC<ConfirmDialogProps>;
export {};
