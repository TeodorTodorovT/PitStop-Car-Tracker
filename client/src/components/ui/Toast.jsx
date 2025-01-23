import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import PropTypes from 'prop-types';

const Toast = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg ${
              toast.variant === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {toast.variant === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <p>{toast.description}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto rounded-full p-1 hover:bg-white/20"
              aria-label="Close toast"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

Toast.propTypes = {
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      variant: PropTypes.oneOf(['success', 'error']).isRequired
    })
  ).isRequired,
  removeToast: PropTypes.func.isRequired
};

export default Toast; 