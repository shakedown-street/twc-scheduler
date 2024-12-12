import * as Popover from '@radix-ui/react-popover';
import clsx from 'clsx';
import { IconButton } from '../IconButton/IconButton';
import './RadixPopover.scss';

export type RadixPopoverProps = {
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  children?: React.ReactNode;
  className?: string;
  close?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  portal?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  trigger?: React.ReactNode;
  triggerAsChild?: boolean;
};

export const RadixPopover = ({
  align = 'center',
  alignOffset = 0,
  className,
  children,
  close = true,
  open,
  onOpenChange,
  portal = false,
  side = 'bottom',
  sideOffset = 0,
  trigger,
  triggerAsChild = true,
}: RadixPopoverProps) => {
  const popoverContent = (
    <>
      <Popover.Content
        align={align}
        alignOffset={alignOffset}
        className={clsx('RadixPopover__content', className)}
        side={side}
        sideOffset={sideOffset}
      >
        {close && (
          <Popover.Close className="RadixPopover__close" asChild>
            <IconButton size="xs">
              <span className="material-symbols-outlined">close</span>
            </IconButton>
          </Popover.Close>
        )}
        {children}
      </Popover.Content>
    </>
  );

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Popover.Trigger asChild={triggerAsChild}>{trigger}</Popover.Trigger>}
      {portal ? <Popover.Portal>{popoverContent}</Popover.Portal> : popoverContent}
    </Popover.Root>
  );
};
