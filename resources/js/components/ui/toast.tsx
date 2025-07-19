import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

// Toast UI
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 2500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-5 right-5 z-50 w-full max-w-xs p-4 rounded-lg shadow-sm flex items-center gap-3 transition-all bg-black text-white" role="alert">
            <div className="flex-1 text-sm font-medium">{message}</div>
            <button
                type="button"
                className="ml-2 bg-transparent rounded-lg p-1.5 hover:bg-gray-800"
                onClick={onClose}
                aria-label="Close"
            >
                <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
            </button>
        </div>
    );
}

// Toast Context
interface ToastContextType {
    show: (message: string) => void;
}
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const show = useCallback((message: string) => {
        setToastMessage(message);
        setShowToast(true);
    }, []);

    const handleClose = useCallback(() => {
        setShowToast(false);
        setToastMessage('');
    }, []);

    return (
        <ToastContext.Provider value={{ show }}>
            {children}
            {showToast && <Toast message={toastMessage} onClose={handleClose} />}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export default Toast;
