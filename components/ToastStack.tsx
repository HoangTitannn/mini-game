import { ToastItem } from "./types";

interface ToastStackProps {
    toasts: ToastItem[];
}

export function ToastStack({ toasts }: ToastStackProps) {
    return (
        <div className="toast-wrap">
            {toasts.map((t) => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                    <span className="toast-icon">
                        {t.type === "error" ? "✗" : t.type === "success" ? "✓" : "⚠"}
                    </span>
                    {t.message}
                </div>
            ))}
        </div>
    );
}
