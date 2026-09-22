import { useEffect } from "react";
import { Info, CircleAlert, CircleX, CircleCheck } from "lucide-react";

const icons = {
    info: <Info className="size-5 text-blue-500" aria-hidden="true" />,
    success: <CircleCheck className="size-5 text-green-500" aria-hidden="true" />,
    warning: <CircleAlert className="size-5 text-amber-500" aria-hidden="true" />,
    error: <CircleX className="size-5 text-red-500" aria-hidden="true" />
};

export type NotificationProps = {
    notification: {
        id: string;
        type: keyof typeof icons;
        title: string;
        message?: string;
    };
    onDismiss: (id: string) => void;
};

export const Notification = ({
    notification: { id, type, title, message },
    onDismiss,
}: NotificationProps) => {
    // Auto-dismiss sau 5 giây để tránh tích lũy notifications
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(id), 5000);
        return () => clearTimeout(timer);
    }, [id, onDismiss]);

    return (
        <div className="flex w-full flex-col items-center sm:items-end">
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/10 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-3.5 sm:p-4" role="alert" aria-label={title}>
                    <div className="flex items-start">
                        <div className="shrink-0 mt-0.5">{icons[type]}</div>
                        <div className="ml-3 w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 leading-snug">{title}</p>
                            {message && (
                                <p className="mt-1 text-xs text-gray-600 leading-relaxed break-words">{message}</p>
                            )}
                        </div>
                        <div className="ml-3 flex shrink-0">
                            <button
                                type="button"
                                className="inline-flex rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors cursor-pointer"
                                onClick={() => onDismiss(id)}
                            >
                                <span className="sr-only">Close</span>
                                <CircleX className="size-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};