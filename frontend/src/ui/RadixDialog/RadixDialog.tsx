import * as Dialog from '@radix-ui/react-dialog';
import clsx from 'clsx';
import { IconButton } from '../IconButton/IconButton';
import './RadixDialog.scss';

export type RadixDialogProps = {
  asDrawer?: boolean;
  children?: React.ReactNode;
  className?: string;
  close?: boolean;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  overlay?: boolean;
  portal?: boolean;
  title: string;
  trigger?: React.ReactNode;
  triggerAsChild?: boolean;
};

export const RadixDialog = ({
  asDrawer,
  className,
  children,
  close = true,
  description,
  open,
  onOpenChange,
  overlay = true,
  portal = true,
  title,
  trigger,
  triggerAsChild = true,
}: RadixDialogProps) => {
  const dialogContent = (
    <>
      {overlay && (
        <Dialog.Overlay
          className={clsx({
            RadixDialog__overlay: !asDrawer,
            RadixDrawer__overlay: asDrawer,
          })}
        />
      )}
      <Dialog.Content
        className={clsx(
          {
            RadixDialog__content: !asDrawer,
            RadixDrawer__content: asDrawer,
          },
          className,
        )}
      >
        {close && (
          <Dialog.Close
            asChild
            className={clsx({
              RadixDialog__close: !asDrawer,
              RadixDrawer__close: asDrawer,
            })}
          >
            <IconButton size="sm">
              <span className="material-symbols-outlined">close</span>
            </IconButton>
          </Dialog.Close>
        )}
        <Dialog.DialogTitle hidden>{title}</Dialog.DialogTitle>
        {description && <Dialog.DialogDescription hidden>{description}</Dialog.DialogDescription>}
        {children}
      </Dialog.Content>
    </>
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild={triggerAsChild}>{trigger}</Dialog.Trigger>}
      {portal ? <Dialog.Portal>{dialogContent}</Dialog.Portal> : dialogContent}
    </Dialog.Root>
  );
};
