import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ description, variant = 'default', duration = 5000 }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, description, variant, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  useEffect(() => {
    const timeouts = toasts.map(toast => {
      return setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [toasts, removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 w-full max-w-sm">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              className={cn(
                "relative pointer-events-auto flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-6 pr-8 shadow-lg transition-all",
                toast.variant === 'default' && "bg-white border-gray-200",
                toast.variant === 'success' && "bg-emerald-100 border-emerald-300",
                toast.variant === 'error' && "bg-red-100 border-red-300"
              )}
            >
              <p className={cn(
                "text-sm font-medium",
                toast.variant === 'default' && "text-gray-900",
                toast.variant === 'success' && "text-emerald-700",
                toast.variant === 'error' && "text-red-700"
              )}>
                {toast.description}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className={cn(
                  "absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2",
                  toast.variant === 'default' && "hover:bg-gray-100 focus:ring-gray-400",
                  toast.variant === 'success' && "hover:bg-emerald-200 focus:ring-emerald-400",
                  toast.variant === 'error' && "hover:bg-red-200 focus:ring-red-400"
                )}
              >
                <X className={cn(
                  "h-4 w-4",
                  toast.variant === 'default' && "text-gray-500",
                  toast.variant === 'success' && "text-emerald-600",
                  toast.variant === 'error' && "text-red-600"
                )} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
}; 