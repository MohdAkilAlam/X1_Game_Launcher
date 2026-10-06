import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, FolderOpen, Image as ImageIcon, Terminal, Gamepad2, AlertCircle } from 'lucide-react';
import { launcherApi } from '../services/launcherApi';
export const AddGameModal = ({ isOpen, onClose, onGameAdded }) => {
    const [executablePath, setExecutablePath] = useState('');
    const [name, setName] = useState('');
    const [coverPath, setCoverPath] = useState('');
    const [launchArguments, setLaunchArguments] = useState('');
    const [platform, setPlatform] = useState('PC / Windows');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    if (!isOpen)
        return null;
    const handleSelectExecutable = async () => {
        try {
            setError(null);
            const selected = await launcherApi.selectExecutable();
            if (selected) {
                setExecutablePath(selected);
                // Automatically populate game name from filename if name is empty
                if (!name) {
                    const parts = selected.split(/[\/\\]/);
                    const filename = parts[parts.length - 1];
                    const cleanedName = filename.replace(/\.[^/.]+$/, '');
                    setName(cleanedName);
                }
            }
        }
        catch (err) {
            setError(err?.message || 'Failed to select executable');
        }
    };
    const handleSelectCover = async () => {
        try {
            setError(null);
            const selected = await launcherApi.selectCoverImage();
            if (selected) {
                setCoverPath(selected);
            }
        }
        catch (err) {
            setError(err?.message || 'Failed to select image');
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!executablePath) {
            setError('Please select a valid game executable.');
            return;
        }
        try {
            setIsSubmitting(true);
            setError(null);
            const payload = {
                name: name.trim() || undefined,
                executablePath: executablePath.trim(),
                coverPath: coverPath.trim() || undefined,
                launchArguments: launchArguments.trim() || undefined,
                platform
            };
            const createdGame = await launcherApi.addGame(payload);
            onGameAdded(createdGame);
            handleClose();
        }
        catch (err) {
            setError(err?.message || 'Failed to add game to library');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleClose = () => {
        setExecutablePath('');
        setName('');
        setCoverPath('');
        setLaunchArguments('');
        setError(null);
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm", children: _jsxs("div", { className: "w-full max-w-lg bg-surface-container border border-primary-container/30 rounded-2xl shadow-2xl overflow-hidden relative", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "p-6 pb-4 border-b border-outline-variant/40 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center", children: _jsx(Gamepad2, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-headline text-lg font-bold text-on-surface", children: "Add Local Game" }), _jsx("p", { className: "text-xs font-mono text-on-surface-variant", children: "Register executable to your X1 Library" })] })] }), _jsx("button", { onClick: handleClose, className: "p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [error && (_jsxs("div", { className: "flex items-start space-x-2.5 p-3 rounded-lg bg-status-error/15 border border-status-error/30 text-status-error text-xs", children: [_jsx(AlertCircle, { className: "w-4 h-4 shrink-0 mt-0.5" }), _jsx("span", { children: error })] })), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-semibold text-on-surface mb-1.5", children: ["Game Executable (.exe) ", _jsx("span", { className: "text-primary", children: "*" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "text", readOnly: true, value: executablePath, placeholder: "Select executable file...", className: "flex-1 bg-surface-container-low border border-outline-variant text-on-surface text-xs rounded-lg px-3 py-2 font-mono truncate focus:outline-none" }), _jsxs("button", { type: "button", onClick: handleSelectExecutable, className: "px-3.5 py-2 bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-semibold rounded-lg border border-outline-variant flex items-center space-x-1.5 shrink-0 transition-colors", children: [_jsx(FolderOpen, { className: "w-3.5 h-3.5 text-primary" }), _jsx("span", { children: "Browse" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-on-surface mb-1.5", children: "Game Title" }), _jsx("input", { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Cyberpunk 2077 or Hades", className: "w-full bg-surface-container-low border border-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container text-on-surface text-xs rounded-lg px-3 py-2 focus:outline-none transition-colors" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-semibold text-on-surface mb-1.5", children: ["Cover Image ", _jsx("span", { className: "text-on-surface-variant font-normal", children: "(Optional)" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "text", value: coverPath, onChange: (e) => setCoverPath(e.target.value), placeholder: "Image path or URL...", className: "flex-1 bg-surface-container-low border border-outline-variant focus:border-primary-container text-on-surface text-xs rounded-lg px-3 py-2 font-mono truncate focus:outline-none" }), _jsxs("button", { type: "button", onClick: handleSelectCover, className: "px-3.5 py-2 bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-semibold rounded-lg border border-outline-variant flex items-center space-x-1.5 shrink-0 transition-colors", children: [_jsx(ImageIcon, { className: "w-3.5 h-3.5 text-primary" }), _jsx("span", { children: "Choose" })] })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-semibold text-on-surface mb-1.5", children: ["Launch Arguments ", _jsx("span", { className: "text-on-surface-variant font-normal", children: "(Optional)" })] }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant", children: _jsx(Terminal, { className: "w-3.5 h-3.5 text-primary/70" }) }), _jsx("input", { type: "text", value: launchArguments, onChange: (e) => setLaunchArguments(e.target.value), placeholder: "-novid -high -fullscreen", className: "w-full bg-surface-container-low border border-outline-variant focus:border-primary-container text-on-surface text-xs rounded-lg pl-9 pr-3 py-2 font-mono focus:outline-none transition-colors" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-on-surface mb-1.5", children: "Platform Tag" }), _jsxs("select", { value: platform, onChange: (e) => setPlatform(e.target.value), className: "w-full bg-surface-container-low border border-outline-variant text-on-surface text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-primary-container", children: [_jsx("option", { value: "PC / Windows", children: "PC / Windows" }), _jsx("option", { value: "Steam Native", children: "Steam Native" }), _jsx("option", { value: "Epic Native", children: "Epic Native" }), _jsx("option", { value: "GOG Native", children: "GOG Native" }), _jsx("option", { value: "Indie / Custom", children: "Indie / Custom" })] })] }), _jsxs("div", { className: "flex items-center justify-end space-x-3 pt-4 border-t border-outline-variant/40", children: [_jsx("button", { type: "button", onClick: handleClose, className: "px-4 py-2 text-xs font-semibold rounded-lg bg-surface-container-high hover:bg-surface-variant text-on-surface transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", disabled: isSubmitting || !executablePath, className: "px-5 py-2 text-xs font-bold rounded-lg bg-primary-container hover:bg-primary text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-amber-glow", children: isSubmitting ? 'Adding...' : 'Save to Library' })] })] })] }) }));
};
