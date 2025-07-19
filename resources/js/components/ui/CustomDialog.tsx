import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { ReactNode } from 'react';

export default function CustomDialog({ open, onClose, title, children }: {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    {title && <DialogTitle>{title}</DialogTitle>}
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}
