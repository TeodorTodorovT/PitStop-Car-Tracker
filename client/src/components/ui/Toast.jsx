import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

export const Toast = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed z-50 flex flex-col gap-2 bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'min-w-[300px] p-4 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in',
            toast.variant === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          )}
        >
          {toast.variant === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <p className="flex-1">{toast.description}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast; 