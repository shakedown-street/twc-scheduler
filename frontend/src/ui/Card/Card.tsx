import clsx from 'clsx';
import React from 'react';
import { RADIUS_SIZES, SHADOW_SIZES } from '../types';
import './Card.scss';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  fluid?: boolean;
  interactive?: boolean;
  radius?: RADIUS_SIZES;
  shadow?: SHADOW_SIZES;
};

export const Card = ({ className, fluid, interactive = false, radius = 'md', shadow = 'md', ...rest }: CardProps) => {
  return (
    <div
      className={clsx(
        'Card',
        {
          'Card--fluid': fluid,
          'Card--interactive': interactive,
          [`radius-${radius}`]: radius,
          [`shadow-${shadow}`]: shadow,
        },
        className
      )}
      {...rest}
    />
  );
};
