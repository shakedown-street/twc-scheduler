import clsx from 'clsx';
import React from 'react';
import { COLORS, RADIUS_SIZES, SIZES } from '../types';
import './Badge.scss';

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  color?: COLORS;
  radius?: RADIUS_SIZES;
  size?: SIZES;
};

export const Badge = ({ className, color, radius = 'md', size = 'md', ...rest }: BadgeProps) => {
  return (
    <div
      className={clsx(
        'Badge',
        {
          [`Badge--color--${color}`]: color,
          [`Badge--size--${size}`]: size,
          [`radius-${radius}`]: radius,
        },
        className
      )}
      {...rest}
    />
  );
};
