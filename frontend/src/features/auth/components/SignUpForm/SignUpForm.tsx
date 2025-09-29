import { UserModel } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setFormErrors } from '@/utils/errors';
import React from 'react';
import { useForm } from 'react-hook-form';

export type SignUpFormData = {
  email: string;
  password1: string;
  password2: string;
};

export const SignUpForm = () => {
  const [submitted, setSubmitted] = React.useState<boolean>(false);

  const form = useForm<SignUpFormData>();

  const { errors } = form.formState;

  function onSubmit(data: SignUpFormData) {
    UserModel.create(data)
      .then(() => {
        setSubmitted(true);
      })
      .catch((err) => {
        form.resetField('password1');
        form.resetField('password2');
        setFormErrors(form, err);
      });
  }

  if (submitted) {
    return (
      <>
        <h2 className="mb-4 text-center text-lg font-bold">Almost there!</h2>
        <div className="text-center">Please check your email to verify your account.</div>
      </>
    );
  }

  return (
    <form className="form" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="form-group">
        <Label htmlFor="email">Email</Label>
        <Input autoFocus id="email" placeholder="Email" type="email" {...form.register('email', { required: true })} />
        {errors.email && <div className="form-error">{errors.email.message}</div>}
      </div>
      <div className="form-group">
        <Label htmlFor="password1">Password</Label>
        <Input
          id="password1"
          placeholder="Password"
          type="password"
          {...form.register('password1', { required: true })}
        />
        {errors.password1 && <div className="form-error">{errors.password1.message}</div>}
      </div>
      <div className="form-group">
        <Label htmlFor="password2">Password (Again)</Label>
        <Input
          id="password2"
          placeholder="Password (Again)"
          type="password"
          {...form.register('password2', { required: true })}
        />
        <div className="text-muted-foreground text-xs">
          Passwords must be at least 8 characters, with at least one number and one letter.
        </div>
        {errors.password2 && <div className="form-error">{errors.password2.message}</div>}
      </div>
      {errors.root && <div className="form-error">{errors.root.message}</div>}
      <Button disabled={!form.formState.isValid} type="submit">
        Sign Up
      </Button>
    </form>
  );
};
