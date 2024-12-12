import clsx from 'clsx';
import { IconButton } from '../IconButton/IconButton';
import { useToast } from './ToastContext';
import './Toaster.scss';

export const Toaster = () => {
  const { toasts, clickToast } = useToast();

  if (toasts.length < 1) {
    return null;
  }

  return (
    <div className="Toaster">
      {toasts.map((toast, index) => {
        return (
          <div
            className={clsx('Toaster__toast', `Toaster__toast--${toast.type}`)}
            key={toast.id}
            onClick={() => {
              clickToast(index);
            }}
          >
            {toast.message}
            <IconButton size="xs">
              <span className="material-symbols-outlined">close</span>
            </IconButton>
          </div>
        );
      })}
    </div>
  );
};
