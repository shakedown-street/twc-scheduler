import { UserModel } from '@/api';
import { Button, Input } from '@/ui';
import { handleFormErrors } from '@/utils/errors';
import React from 'react';
import { useForm } from 'react-hook-form';
import './SignUpForm.scss';

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
        handleFormErrors(form, err);
      });
  }

  if (submitted) {
    return (
      <>
        <h2 className="text-center mb-4">Almost there!</h2>
        <p className="text-center">Please check your email to verify your account.</p>
      </>
    );
  }

  return (
    <form className="SignUpForm" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="SignUpForm__field">
        <Input
          autoFocus
          fluid
          id="email"
          label="Email"
          placeholder="Email"
          type="email"
          {...form.register('email', { required: true })}
        />
        {errors.email && <p className="error mt-2">{errors.email.message}</p>}
      </div>
      <div className="SignUpForm__field">
        <Input
          fluid
          id="password1"
          label="Password"
          placeholder="Password"
          type="password"
          {...form.register('password1', { required: true })}
        />
        {errors.password1 && <p className="error mt-2">{errors.password1.message}</p>}
      </div>
      <div className="SignUpForm__field">
        <Input
          fluid
          id="password2"
          label="Password (Again)"
          placeholder="Password (Again)"
          type="password"
          {...form.register('password2', { required: true })}
        />
        <p className="hint">Passwords must be at least 8 characters, with at least one number and one letter.</p>
        {errors.password2 && <p className="error mt-2">{errors.password2.message}</p>}
      </div>
      {errors.root && <p className="error">{errors.root.message}</p>}
      <div className="SignUpForm__actions">
        <Button color="primary" disabled={!form.formState.isValid} fluid type="submit" variant="raised">
          Sign Up
        </Button>
      </div>
    </form>
  );
};
