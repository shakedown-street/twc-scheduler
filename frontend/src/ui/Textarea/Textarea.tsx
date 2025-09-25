import clsx from 'clsx';
import React from 'react';
import { InputVariant } from '../Input/Input';
import '../Input/Input.scss';
import { RADIUS_SIZES, SIZES } from '../types';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  fluid?: boolean;
  iconLeading?: string;
  iconTrailing?: string;
  inputSize?: SIZES;
  label?: React.ReactNode;
  radius?: RADIUS_SIZES;
  variant?: InputVariant;
};

export const Textarea = React.forwardRef(
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
    }: TextareaProps,
    ref: React.ForwardedRef<HTMLTextAreaElement>,
  ) => {
    return (
      <div
        className={clsx('Input__container', {
          'Input__container--fluid': fluid,
        })}
      >
        {label && <label htmlFor={id}>{label}</label>}
        <div className="Input__inner">
          {iconLeading && (
            <span className="iconLeading iconLeading--textarea material-symbols-outlined">{iconLeading}</span>
          )}
          {iconTrailing && (
            <span className="iconTrailing iconTrailing--textarea material-symbols-outlined">{iconTrailing}</span>
          )}
          <textarea
            className={clsx(
              {
                'Input--fluid': fluid,
                'Input--iconLeading': iconLeading,
                'Input--iconTrailing': iconTrailing,
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
    );
  },
);
