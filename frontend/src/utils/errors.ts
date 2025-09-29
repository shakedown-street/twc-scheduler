import { AxiosError } from 'axios';
import { type UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

/**
 * Provide a callback for if the error response has a detail field
 */
export function handleDetailError(err: unknown, callback: (detail: string) => void) {
  if (!(err instanceof AxiosError) || !err.response || !err.response.data) {
    return;
  }

  const { detail } = err.response.data;

  if (detail) {
    callback(detail);
  }
}

/**
 * Provide a callback for if the error response has non_field_errors
 */
export function handleNonFieldErrors(err: unknown, callback: (nonFieldErrors: string[]) => void) {
  if (!(err instanceof AxiosError) || !err.response || !err.response.data) {
    return;
  }

  const { non_field_errors } = err.response.data;

  if (non_field_errors) {
    callback(non_field_errors);
  }
}

/**
 * Provide a callback for if the error response has field errors
 */
export function handleFieldErrors(err: unknown, callback: (fieldErrors: Record<string, string | string[]>) => void) {
  if (!(err instanceof AxiosError) || !err.response || !err.response.data) {
    return;
  }

  const { detail, non_field_errors, ...rest } = err.response.data;

  if (rest) {
    callback(rest);
  }
}

/**
 * Extract a single user-friendly error message
 */
export function extractError(err: unknown): string {
  if (err instanceof AxiosError) {
    if (!err.response || !err.response.data || typeof err.response.data === 'string') {
      return 'An unexpected error occurred';
    }

    const { detail, non_field_errors, ...fieldErrors } = err.response.data;

    if (detail) {
      return detail;
    }
    if (non_field_errors && non_field_errors.length > 0) {
      return non_field_errors[0];
    }
    if (Object.keys(fieldErrors).length > 0) {
      const firstFieldError = Object.values<string | string[]>(fieldErrors)[0];
      if (Array.isArray(firstFieldError)) {
        return firstFieldError[0];
      }
      return firstFieldError;
    }

    return 'An unexpected error occurred';
  } else if (err instanceof Error) {
    return err.message;
  } else {
    return 'An unexpected error occurred';
  }
}

/**
 * Display an error message using Sonner's toast
 */
export function toastError(err: unknown) {
  if (err instanceof AxiosError) {
    if (!err.response || !err.response.data || typeof err.response.data === 'string') {
      toast.error('An unexpected error occurred');
      return;
    }

    handleDetailError(err, (detail) => toast.error(detail));
    handleNonFieldErrors(err, (nonFieldErrors) => toast.error(nonFieldErrors[0]));
    handleFieldErrors(err, (fieldErrors) => {
      Object.keys(fieldErrors).forEach((key) => {
        if (Array.isArray(fieldErrors[key])) {
          toast.error(fieldErrors[key][0]);
        } else {
          toast.error(fieldErrors[key]);
        }
      });
    });
    return;
  } else if (err instanceof Error) {
    toast.error(err.message);
  } else {
    toast.error('An unexpected error occurred');
  }
}

/**
 * Set errors in a react-hook-form form
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setFormErrors(form: UseFormReturn<any, any, any>, err: unknown) {
  if (err instanceof AxiosError) {
    if (!err.response || !err.response.data || typeof err.response.data === 'string') {
      form.setError('root', { message: 'An unexpected error occurred' });
      return;
    }

    handleDetailError(err, (detail) => form.setError('root', { message: detail }));
    handleNonFieldErrors(err, (nonFieldErrors) => form.setError('root', { message: nonFieldErrors[0] }));
    handleFieldErrors(err, (fieldErrors) => {
      Object.keys(fieldErrors).forEach((key) => {
        if (Array.isArray(fieldErrors[key])) {
          form.setError(key, { message: fieldErrors[key][0] });
        } else {
          form.setError(key, { message: fieldErrors[key] });
        }
      });
    });
  } else if (err instanceof Error) {
    toast.error(err.message);
  } else {
    toast.error('An unexpected error occurred');
  }
}
