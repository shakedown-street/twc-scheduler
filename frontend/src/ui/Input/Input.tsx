import clsx from 'clsx';
import React from 'react';
import './Input.scss';
import { RADIUS_SIZES, SIZES } from '../types';

export type InputVariant = 'default' | 'underline' | 'filled';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  fluid?: boolean;
  iconLeading?: string;
  iconTrailing?: string;
  inputSize?: SIZES; // "size" conflicts with InputHTMLAttributes.size
  label?: React.ReactNode;
  radius?: RADIUS_SIZES;
  variant?: InputVariant;
};

export const Input = React.forwardRef(
  (
    {
      className,
      fluid,
      iconLeading,
      iconTrailing,
      id,
      inputSize = 'md',
      label,
      radius = 'md',
      variant = 'default',
      ...rest
    }: InputProps,
    ref: React.ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <div
        className={clsx('Input__container', {
          'Input__container--fluid': fluid,
          [`Input__container--size--${inputSize}`]: inputSize,
        })}
      >
        {label && <label htmlFor={id}>{label}</label>}
        <div className="Input__inner">
          {iconLeading && <span className="iconLeading material-symbols-outlined">{iconLeading}</span>}
          {iconTrailing && <span className="iconTrailing material-symbols-outlined">{iconTrailing}</span>}
          <input
            className={clsx(
              {
                'Input--fluid': fluid,
                'Input--iconLeading': iconLeading,
                'Input--iconTrailing': iconTrailing,
                [`Input--size--${inputSize}`]: inputSize,
                [`Input--variant--${variant}`]: variant,
                [`radius-${radius}`]: radius,
              },
              className
            )}
            id={id}
            ref={ref}
            {...rest}
          />
        </div>
      </div>
    );
  }
);
