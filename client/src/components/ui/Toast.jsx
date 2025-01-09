import React from 'react';
import PropTypes from 'prop-types';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-4 right-4 z-[100] flex max-h-screen w-full flex-col gap-2 md:max-w-[420px]',
      className
    )}
    {...props}
  />
));

ToastViewport.displayName = 'ToastViewport';
ToastViewport.propTypes = {
  className: PropTypes.string,
};

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        'group pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden rounded-lg p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
        variant === 'success' && 'bg-green-500 text-white',
        variant === 'error' && 'bg-red-500 text-white',
        variant === 'default' && 'bg-white dark:bg-gray-800',
        className
      )}
      {...props}
    >
      {variant === 'success' && <CheckCircle2 className="h-5 w-5 flex-shrink-0" />}
      {variant === 'error' && <AlertCircle className="h-5 w-5 flex-shrink-0" />}
      <div className="flex-1">
        {props.children}
      </div>
    </ToastPrimitives.Root>
  );
});

Toast.displayName = 'Toast';
Toast.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'success', 'error']),
  children: PropTypes.node,
};

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-white/50 opacity-0 transition-opacity hover:text-white focus:opacity-100 focus:outline-none group-hover:opacity-100',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));

ToastClose.displayName = 'ToastClose';
ToastClose.propTypes = {
  className: PropTypes.string,
};

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));

ToastDescription.displayName = 'ToastDescription';
ToastDescription.propTypes = {
  className: PropTypes.string,
};

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastDescription,
  ToastClose,
}; 