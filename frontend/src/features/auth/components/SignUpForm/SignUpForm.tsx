import { UserModel } from '@/api';
import { ErrorMessage } from '@/components/ErrorMessage/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setFormErrors } from '@/utils/errors';
import React from 'react';
import { useForm } from 'react-hook-form';
import { GoogleSSOButton } from '../GoogleSSOButton/GoogleSSOButton';
import { PasswordHint } from '../PasswordHint/PasswordHint';

export type SignUpFormData = {
  email: string;
  password1: string;
  password2: string;
};

export const SignUpForm = () => {
  const [submitted, setSubmitted] = React.useState<boolean>(false);

  const form = useForm<SignUpFormData>();

  const { errors } = form.formState;

  async function onSubmit(data: SignUpFormData) {
    try {
      await UserModel.create(data);
      setSubmitted(true);
    } catch (err) {
      form.resetField('password1');
      form.resetField('password2');
      setFormErrors(form, err);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-2 text-center">
        <h2 className="text-lg font-bold">Almost there!</h2>
        <div>Please check your email to verify your account.</div>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="form-group">
        <Label htmlFor="email">Email</Label>
        <Input autoFocus id="email" placeholder="Email" type="email" {...form.register('email', { required: true })} />
        <ErrorMessage>{errors.email?.message}</ErrorMessage>
      </div>
      <div className="form-group">
        <Label htmlFor="password1">Password</Label>
        <Input
          id="password1"
          placeholder="Password"
          type="password"
          {...form.register('password1', { required: true })}
        />
        <PasswordHint />
        <ErrorMessage>{errors.password1?.message}</ErrorMessage>
      </div>
      <div className="form-group">
        <Label htmlFor="password2">Password (Again)</Label>
        <Input
          id="password2"
          placeholder="Password (Again)"
          type="password"
          {...form.register('password2', { required: true })}
        />
        <ErrorMessage>{errors.password2?.message}</ErrorMessage>
      </div>
      <ErrorMessage>{errors.root?.message}</ErrorMessage>
      <Button disabled={!form.formState.isValid} type="submit">
        Sign Up
      </Button>
      {import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID && <GoogleSSOButton />}
    </form>
  );
};
