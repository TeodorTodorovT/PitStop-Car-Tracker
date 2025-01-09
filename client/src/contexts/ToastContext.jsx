import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastDescription,
  ToastClose,
} from '../components/ui/Toast';

const ToastContext = createContext({});
const MAX_TOASTS = 3;

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastContextProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(
    ({ description, variant = 'default' }) => {
      const id = Math.random().toString(36).slice(2);
      
      setToasts((prev) => {
        // If we already have MAX_TOASTS, remove the oldest one
        const newToasts = prev.length >= MAX_TOASTS 
          ? prev.slice(1) 
          : prev;
        
        return [...newToasts, { id, description, variant }];
      });

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    },
    []
  );

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, dismissToast }}>
      <ToastProvider>
        {children}
        <ToastViewport>
          {toasts.map(({ id, description, variant }) => (
            <Toast key={id} variant={variant}>
              <ToastDescription>{description}</ToastDescription>
              <ToastClose onClick={() => dismissToast(id)} />
            </Toast>
          ))}
        </ToastViewport>
      </ToastProvider>
    </ToastContext.Provider>
  );
};

ToastContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ToastContext; 