import clsx from 'clsx';
import React from 'react';
import { InputVariant } from '../Input/Input';
import '../Input/Input.scss';
import { RADIUS_SIZES, SIZES } from '../types';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  fluid?: boolean;
  iconLeading?: string;
  inputSize?: SIZES;
  label?: React.ReactNode;
  radius?: RADIUS_SIZES;
  variant?: InputVariant;
};

export const Select = React.forwardRef(
  (
    {
      className,
      fluid,
      iconLeading,
      id,
      inputSize = 'md',
      label,
      radius = 'md',
      variant = 'default',
      ...rest
    }: SelectProps,
    ref: React.ForwardedRef<HTMLSelectElement>,
  ) => {
    return (
      <>
        <div
          className={clsx('Input__container', {
            'Input__container--fluid': fluid,
          })}
        >
          {label && <label htmlFor={id}>{label}</label>}
          <div className="Input__inner">
            {iconLeading && <span className="iconLeading material-symbols-outlined">{iconLeading}</span>}
            <select
              className={clsx(
                {
                  'Input--fluid': fluid,
                  'Input--iconLeading': iconLeading,
                  [`Input--size--${inputSize}`]: inputSize,
                  [`Input--variant--${variant}`]: variant,
                  [`rounded-${radius}`]: radius,
                },
                className,
              )}
              id={id}
              ref={ref}
              {...rest}
            />
          </div>
        </div>
      </>
    );
  },
);
