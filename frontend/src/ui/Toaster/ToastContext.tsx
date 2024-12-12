import React from 'react';
import { handleDetailError, handleFieldErrors, handleNonFieldErrors } from '~/utils/errors';

export type Toast = {
  id: number;
  message: string;
  type: string;
};

export type ToastContextType = {
  toasts: Toast[];
  clickToast: (index: number) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  success: (message: string) => void;
  warning: (message: string) => void;
  errorResponse: (errorResponse: any) => void;
};

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export type ToastProviderProps = {
  children: React.ReactNode;
};

export const ToastProvider = (props: ToastProviderProps) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const toastsRef = React.useRef(toasts);
  toastsRef.current = toasts;

  const toast = (type: string) => {
    return (message: string) => {
      const toastId = Date.now();
      setToasts((previousToasts: Toast[]) => [
        ...previousToasts,
        {
          type,
          message,
          id: toastId,
        },
      ]);
      setTimeout(() => {
        removeToast(toastId);
      }, 10000);
    };
  };

  const removeToast = (id: number) => {
    setToasts(
      toastsRef.current.filter((toast) => {
        return toast.id !== id;
      })
    );
  };

  const clickToast = (index: number) => {
    const newArr = [...toasts];
    newArr.splice(index, 1);
    setToasts(newArr);
  };

  const errorResponse = (errorResponse: any) => {
    // Short circuit if the error response is not as expected
    if (!errorResponse.response || !errorResponse.response.data || typeof errorResponse.response.data === 'string') {
      toast('error')('An unexpected error occurred');
      return;
    }

    handleDetailError(errorResponse, (detail) => toast('error')(detail));
    handleNonFieldErrors(errorResponse, (non_field_errors) => toast('error')(non_field_errors[0]));
    handleFieldErrors(errorResponse, (fieldErrors) => {
      Object.keys(fieldErrors).forEach((key) => {
        if (Array.isArray(fieldErrors[key])) {
          fieldErrors[key].forEach((error: string) => {
            toast('error')(`${key}: ${error}`);
          });
        } else {
          toast('error')(`${key}: ${fieldErrors[key]}`);
        }
      });
    });
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        clickToast,
        error: toast('error'),
        info: toast('info'),
        success: toast('success'),
        warning: toast('warning'),
        errorResponse,
      }}
    >
      {props.children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};
