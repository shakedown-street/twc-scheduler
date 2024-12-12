import { UseFormReturn } from 'react-hook-form';

/**
 * Provide a callback for if the error response has a detail field
 */
export function handleDetailError(errorResponse: any, callback: (detail: string) => void) {
  const { detail } = errorResponse.response.data;

  if (detail) {
    callback(detail);
  }
}

/**
 * Provide a callback for if the error response has non_field_errors
 */
export function handleNonFieldErrors(errorResponse: any, callback: (nonFieldErrors: string[]) => void) {
  const { non_field_errors } = errorResponse.response.data;

  if (non_field_errors) {
    callback(non_field_errors);
  }
}

/**
 * Provide a callback for if the error response has field errors
 */
export function handleFieldErrors(
  errorResponse: any,
  callback: (fieldErrors: Record<string, string | string[]>) => void
) {
  const { detail, non_field_errors, ...rest } = errorResponse.response.data;

  if (rest) {
    callback(rest);
  }
}

/**
 * Handle setting form errors from an error response
 */
export function handleFormErrors(form: UseFormReturn<any, any, any>, errorResponse: any) {
  // Short circuit if the error response is not as expected
  if (!errorResponse.response || !errorResponse.response.data || typeof errorResponse.response.data === 'string') {
    form.setError('root', { message: 'An unexpected error occurred' });
    return;
  }

  handleDetailError(errorResponse, (detail) => form.setError('root', { message: detail }));
  handleNonFieldErrors(errorResponse, (nonFieldErrors) => form.setError('root', { message: nonFieldErrors[0] }));
  handleFieldErrors(errorResponse, (fieldErrors) => {
    Object.keys(fieldErrors).forEach((key) => {
      if (Array.isArray(fieldErrors[key])) {
        form.setError(key, { message: fieldErrors[key][0] });
      } else {
        form.setError(key, { message: fieldErrors[key] });
      }
    });
  });
}
