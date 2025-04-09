import * as HoverCard from '@radix-ui/react-hover-card';
import clsx from 'clsx';
import './RadixHoverCard.scss';

export type RadixHoverCardProps = {
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  arrow?: boolean;
  children?: React.ReactNode;
  className?: string;
  closeDelay?: number;
  openDelay?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  portal?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  trigger?: React.ReactNode;
  triggerAsChild?: boolean;
};

export const RadixHoverCard = ({
  align = 'center',
  alignOffset = 0,
  arrow = true,
  className,
  children,
  closeDelay = 100,
  openDelay = 200,
  open,
  onOpenChange,
  portal = false,
  side = 'bottom',
  sideOffset = 0,
  trigger,
  triggerAsChild = true,
}: RadixHoverCardProps) => {
  const tooltipContent = (
    <>
      <HoverCard.Content
        align={align}
        alignOffset={alignOffset}
        className={clsx('RadixHoverCard__content', className)}
        side={side}
        sideOffset={sideOffset}
      >
        {arrow && <HoverCard.Arrow className="RadixHoverCard__arrow" />}
        {children}
      </HoverCard.Content>
    </>
  );

  return (
    <HoverCard.Root closeDelay={closeDelay} openDelay={openDelay} open={open} onOpenChange={onOpenChange}>
      {trigger && <HoverCard.Trigger asChild={triggerAsChild}>{trigger}</HoverCard.Trigger>}
      {portal ? <HoverCard.Portal>{tooltipContent}</HoverCard.Portal> : tooltipContent}
    </HoverCard.Root>
  );
};
