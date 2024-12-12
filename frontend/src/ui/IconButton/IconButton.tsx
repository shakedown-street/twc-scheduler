import clsx from 'clsx';
import React from 'react';
import { Link, To } from 'react-router-dom';
import { COLORS, RADIUS_SIZES, SIZES } from '../types';
import './IconButton.scss';

export type IconButtonVariant = 'default' | 'raised' | 'outlined' | 'ghost';

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement | HTMLAnchorElement> & {
  color?: COLORS;
  navigateTo?: To;
  radius?: RADIUS_SIZES;
  size?: SIZES;
  variant?: IconButtonVariant;
};

export const IconButton = React.forwardRef(
  (
    {
      className,
      color,
      navigateTo,
      radius = 'md',
      size = 'md',
      type = 'button',
      variant = 'default',
      ...rest
    }: IconButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement> | React.ForwardedRef<HTMLAnchorElement>
  ) => {
    const iconButtonClass = clsx(
      {
        [`IconButton--color--${color}`]: color,
        [`IconButton--size--${size}`]: size,
        [`IconButton--variant--${variant}`]: variant,
        [`radius-${radius}`]: radius,
      },
      className
    );

    if (navigateTo) {
      return (
        <Link
          className={iconButtonClass}
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          to={navigateTo}
          type={type}
          {...rest}
        ></Link>
      );
    }

    return (
      <button
        className={iconButtonClass}
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        type={type}
        {...rest}
      ></button>
    );
  }
);
