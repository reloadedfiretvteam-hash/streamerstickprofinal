import { Toaster as HotToaster, toast } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info, ShoppingCart } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Toast Provider Component
 * Configures and renders the toast notification container
 */
export function ToastProvider() {
  return (
    <HotToaster
      position="bottom-right"
      reverseOrder={false}
      gutter={12}
      containerStyle={{
        bottom: 24,
        right: 24,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#f9fafb',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',
          maxWidth: '400px',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#f9fafb',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#f9fafb',
          },
        },
      }}
    />
  );
}

/**
 * Custom toast notification functions
 */
export const showToast = {
  /**
   * Show a success toast
   */
  success: (message: string, options?: { duration?: number }) => {
    toast.success(message, {
      duration: options?.duration ?? 3000,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
    });
  },

  /**
   * Show an error toast
   */
  error: (message: string, options?: { duration?: number }) => {
    toast.error(message, {
      duration: options?.duration ?? 5000,
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    });
  },

  /**
   * Show a warning toast
   */
  warning: (message: string, options?: { duration?: number }) => {
    toast(message, {
      duration: options?.duration ?? 4000,
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      style: {
        background: '#1f2937',
        color: '#f9fafb',
        border: '1px solid #f59e0b',
      },
    });
  },

  /**
   * Show an info toast
   */
  info: (message: string, options?: { duration?: number }) => {
    toast(message, {
      duration: options?.duration ?? 4000,
      icon: <Info className="w-5 h-5 text-blue-500" />,
    });
  },

  /**
   * Show a cart notification (product added)
   */
  cart: (productName: string) => {
    toast(`${productName} added to cart`, {
      duration: 2500,
      icon: <ShoppingCart className="w-5 h-5 text-orange-500" />,
      style: {
        background: 'linear-gradient(to right, #1f2937, #374151)',
        color: '#f9fafb',
        border: '1px solid #f97316',
      },
    });
  },

  /**
   * Show a loading toast (returns an ID to dismiss later)
   */
  loading: (message: string): string => {
    return toast.loading(message, {
      style: {
        background: '#1f2937',
        color: '#f9fafb',
      },
    });
  },

  /**
   * Dismiss a specific toast or all toasts
   */
  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  /**
   * Show a custom toast with JSX content
   */
  custom: (content: ReactNode, options?: { duration?: number }) => {
    toast.custom(
      () => (
        <div className="bg-gray-800 text-white p-4 rounded-xl shadow-lg border border-gray-700">
          {content}
        </div>
      ),
      {
        duration: options?.duration ?? 4000,
      }
    );
  },
};

export default ToastProvider;
