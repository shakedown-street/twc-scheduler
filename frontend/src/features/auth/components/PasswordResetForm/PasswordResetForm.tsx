import { ErrorMessage } from '@/components/ErrorMessage/ErrorMessage';
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
  const [submitted, setSubmitted] = React.useState(false);

  const form = useForm<PasswordResetFormData>();

  const { errors } = form.formState;

  async function onSubmit(data: PasswordResetFormData) {
    try {
      await http.post('/api/password-reset/', data);
      setSubmitted(true);
    } catch (err) {
      setFormErrors(form, err);
    }
  }

  if (submitted) {
    return <div className="text-center">Please check your email for a password reset link.</div>;
  }

  return (
    <form className="form" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="form-group">
        <Label htmlFor="email">Email</Label>
        <Input autoFocus id="email" placeholder="Email" type="email" {...form.register('email', { required: true })} />
        <ErrorMessage>{errors.email?.message}</ErrorMessage>
      </div>
      <ErrorMessage>{errors.root?.message}</ErrorMessage>
      <Button className="w-full" disabled={!form.formState.isValid} type="submit">
        Send Recovery Link
      </Button>
    </form>
  );
};
