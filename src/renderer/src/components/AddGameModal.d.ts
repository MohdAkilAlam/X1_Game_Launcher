import React from 'react';
interface AddGameModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGameAdded: (game: any) => void;
}
export declare const AddGameModal: React.FC<AddGameModalProps>;
export {};
