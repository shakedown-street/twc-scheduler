import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { http } from '~/http';
import { Button, Input, RadixDialog } from '~/ui';
import { handleFormErrors } from '~/utils/errors';
import { useAuth } from '../../contexts/AuthContext';
import { ResendVerifyEmail } from '../ResendVerifyEmail/ResendVerifyEmail';
import './LoginForm.scss';

export type LoginFormData = {
  username: string;
  password: string;
};

export const LoginForm = () => {
  const [resendVerifyOpen, setResendVerifyOpen] = React.useState(false);

  const form = useForm<LoginFormData>();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const { errors } = form.formState;

  function onSubmit(data: LoginFormData) {
    http
      .post('/api/token-auth/', data)
      .then((res) => {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        navigate('/');
      })
      .catch((err) => {
        form.resetField('password');
        handleFormErrors(form, err);

        const { detail } = err.response.data;
        if (detail && detail.includes('verification')) {
          setResendVerifyOpen(true);
        }
      });
  }

  return (
    <>
      <form className="LoginForm" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="LoginForm__field">
          <Input
            autoFocus
            fluid
            id="username"
            label="Email"
            placeholder="Email"
            type="email"
            {...form.register('username', { required: true })}
          />
          {errors.username && <p className="error mt-2">{errors.username.message}</p>}
        </div>
        <div className="LoginForm__field">
          <Input
            fluid
            id="password"
            label="Password"
            placeholder="Password"
            type="password"
            {...form.register('password', { required: true })}
          />
          {errors.password && <p className="error mt-2">{errors.password.message}</p>}
        </div>
        {errors.root && <p className="error">{errors.root.message}</p>}
        <div className="LoginForm__actions">
          <Button color="primary" disabled={!form.formState.isValid} fluid type="submit" variant="raised">
            Login
          </Button>
        </div>
      </form>
      <RadixDialog
        className="p-6"
        open={resendVerifyOpen}
        onOpenChange={setResendVerifyOpen}
        title="Email Verification Required"
      >
        <ResendVerifyEmail email={form.getValues('username')} onSuccess={() => setResendVerifyOpen(false)} />
      </RadixDialog>
    </>
  );
};
