import { cn } from '@/lib/utils';
import React from 'react';

/**
 * A simple component to conditionally display form error messages.
 */
export const ErrorMessage = ({ children, className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <>
      {children && (
        <div className={cn('form-error', className)} {...props}>
          {children}
        </div>
      )}
    </>
  );
};
