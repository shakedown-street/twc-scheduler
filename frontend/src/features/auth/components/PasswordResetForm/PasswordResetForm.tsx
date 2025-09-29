import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { http } from '@/lib/http';
import { setFormErrors } from '@/utils/errors';
import React from 'react';
import { useForm } from 'react-hook-form';

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
        setFormErrors(form, err);
      });
  }

  if (submitted) {
    return <p className="text-center">Please check your email for a password reset link.</p>;
  }

  return (
    <form className="form" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="form-group">
        <Label htmlFor="email">Email</Label>
        <Input autoFocus placeholder="Email" type="email" {...form.register('email', { required: true })} />
        {errors.email && <div className="form-error">{errors.email.message}</div>}
      </div>
      {errors.root && <div className="form-error">{errors.root.message}</div>}
      <Button disabled={!form.formState.isValid} type="submit">
        Send Recovery Link
      </Button>
    </form>
  );
};
