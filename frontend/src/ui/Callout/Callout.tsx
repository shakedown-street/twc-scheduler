import clsx from 'clsx';
import React from 'react';
import { COLORS, RADIUS_SIZES, SHADOW_SIZES } from '../types';
import './Callout.scss';

export type CalloutProps = React.HTMLAttributes<HTMLDivElement> & {
  color?: COLORS;
  fluid?: boolean;
  header?: React.ReactNode;
  icon?: string;
  onDismiss?: () => void;
  radius?: RADIUS_SIZES;
  shadow?: SHADOW_SIZES;
};

export const Callout = ({
  children,
  className,
  color,
  header,
  icon,
  onDismiss,
  radius = 'md',
  shadow,
  ...rest
}: CalloutProps) => {
  return (
    <div
      className={clsx(
        'Callout',
        {
          [`Callout--color--${color}`]: color,
          'Callout--withIcon': icon,
          [`radius-${radius}`]: radius,
          [`shadow-${shadow}`]: shadow,
        },
        className
      )}
      {...rest}
    >
      {icon && <span className="Callout__icon material-symbols-outlined">{icon}</span>}
      {onDismiss && (
        <span
          className="Callout__icon Callout__icon--close material-symbols-outlined"
          onClick={() => {
            onDismiss();
          }}
        >
          close
        </span>
      )}
      {header && <div className="Callout__header">{header}</div>}
      <div className="Callout__content">{children}</div>
    </div>
  );
};
