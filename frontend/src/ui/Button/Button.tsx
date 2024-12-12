import clsx from 'clsx';
import React from 'react';
import { Link, To } from 'react-router-dom';
import { COLORS, RADIUS_SIZES, SIZES } from '../types';
import './Button.scss';

export type ButtonVariant = 'default' | 'raised' | 'outlined' | 'ghost';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement | HTMLAnchorElement> & {
  color?: COLORS;
  fluid?: boolean;
  iconLeading?: string;
  iconTrailing?: string;
  navigateTo?: To;
  radius?: RADIUS_SIZES;
  size?: SIZES;
  small?: boolean;
  variant?: ButtonVariant;
};

export const Button = React.forwardRef(
  (
    {
      className,
      children,
      color,
      fluid,
      iconLeading,
      iconTrailing,
      navigateTo,
      radius = 'md',
      size = 'md',
      type = 'button',
      variant = 'default',
      ...rest
    }: ButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement> | React.ForwardedRef<HTMLAnchorElement>
  ) => {
    const buttonClass = clsx(
      {
        'Button--fluid': fluid,
        'Button--iconLeading': iconLeading,
        'Button--iconTrailing': iconTrailing,
        [`Button--color--${color}`]: color,
        [`Button--size--${size}`]: size,
        [`Button--variant--${variant}`]: variant,
        [`radius-${radius}`]: radius,
      },
      className
    );

    if (navigateTo) {
      return (
        <Link className={buttonClass} to={navigateTo} ref={ref as React.ForwardedRef<HTMLAnchorElement>} {...rest}>
          {iconLeading && <span className="iconLeading material-symbols-outlined">{iconLeading}</span>}
          {children}
          {iconTrailing && <span className="iconTrailing material-symbols-outlined">{iconTrailing}</span>}
        </Link>
      );
    }

    return (
      <button className={buttonClass} ref={ref as React.ForwardedRef<HTMLButtonElement>} type={type} {...rest}>
        {iconLeading && <span className="iconLeading material-symbols-outlined">{iconLeading}</span>}
        {children}
        {iconTrailing && <span className="iconTrailing material-symbols-outlined">{iconTrailing}</span>}
      </button>
    );
  }
);
