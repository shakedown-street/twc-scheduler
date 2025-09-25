import { http } from '@/http';
import { Button, Input } from '@/ui';
import { handleFormErrors } from '@/utils/errors';
import React from 'react';
import { useForm } from 'react-hook-form';
import './PasswordResetForm.scss';

export type PasswordResetFormData = {
  email: string;
};

export const PasswordResetForm = () => {
  const [submitted, setSubmitted] = React.useState<boolean>(false);

  const form = useForm<PasswordResetFormData>();

  const { errors } = form.formState;

  function onSubmit(data: PasswordResetFormData) {
    http
      .post('/api/password-reset/', data)
      .then(() => {
        setSubmitted(true);
      })
      .catch((err) => {
        handleFormErrors(form, err);
      });
  }

  if (submitted) {
    return <p className="text-center">Please check your email for a password reset link.</p>;
  }

  return (
    <form className="PasswordResetForm" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="PasswordResetForm__field">
        <Input
          autoFocus
          fluid
          label="Email"
          placeholder="Email"
          type="email"
          {...form.register('email', { required: true })}
        />
        {errors.email && <p className="form-error mt-2">{errors.email.message}</p>}
      </div>
      {errors.root && <p className="form-error">{errors.root.message}</p>}
      <div className="PasswordResetForm__actions">
        <Button color="primary" disabled={!form.formState.isValid} fluid type="submit" variant="raised">
          Send Recovery Link
        </Button>
      </div>
    </form>
  );
};
