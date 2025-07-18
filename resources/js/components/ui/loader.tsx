import { Loader } from 'lucide-react';

export default function LoaderOverlay() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70">
            <Loader className="animate-spin w-14 h-14 text-primary" />
        </div>
    );
}
