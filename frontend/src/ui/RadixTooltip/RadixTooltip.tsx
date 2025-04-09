import * as Tooltip from '@radix-ui/react-tooltip';
import clsx from 'clsx';
import './RadixTooltip.scss';

export type RadixTooltipProps = {
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
  arrow?: boolean;
  children?: React.ReactNode;
  className?: string;
  delayDuration?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  portal?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  trigger?: React.ReactNode;
  triggerAsChild?: boolean;
};

export const RadixTooltip = ({
  align = 'center',
  alignOffset = 0,
  arrow = false,
  className,
  children,
  delayDuration = 200,
  open,
  onOpenChange,
  portal = false,
  side = 'bottom',
  sideOffset = 0,
  trigger,
  triggerAsChild = true,
}: RadixTooltipProps) => {
  const tooltipContent = (
    <>
      <Tooltip.Content
        align={align}
        alignOffset={alignOffset}
        className={clsx('RadixTooltip__content', className)}
        side={side}
        sideOffset={sideOffset}
      >
        {arrow && <Tooltip.Arrow className="RadixTooltip__arrow" />}
        {children}
      </Tooltip.Content>
    </>
  );

  return (
    <Tooltip.Root delayDuration={delayDuration} open={open} onOpenChange={onOpenChange}>
      {trigger && <Tooltip.Trigger asChild={triggerAsChild}>{trigger}</Tooltip.Trigger>}
      {portal ? <Tooltip.Portal>{tooltipContent}</Tooltip.Portal> : tooltipContent}
    </Tooltip.Root>
  );
};
