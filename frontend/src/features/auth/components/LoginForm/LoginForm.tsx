import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { http } from '@/lib/http';
import { setFormErrors } from '@/utils/errors';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ResendVerifyEmail } from '../ResendVerifyEmail/ResendVerifyEmail';

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
        setFormErrors(form, err);

        const { detail } = err.response.data;
        if (detail && detail.includes('verification')) {
          setResendVerifyOpen(true);
        }
      });
  }

  return (
    <>
      <form className="form" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="form-group">
          <Label htmlFor="username">Email</Label>
          <Input
            autoFocus
            id="username"
            placeholder="Email"
            type="email"
            {...form.register('username', { required: true })}
          />
          {errors.username && <div className="form-error">{errors.username.message}</div>}
        </div>
        <div className="form-group">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="Password"
            type="password"
            {...form.register('password', { required: true })}
          />
          {errors.password && <div className="form-error">{errors.password.message}</div>}
        </div>
        {errors.root && <div className="form-error">{errors.root.message}</div>}
        <Button disabled={!form.formState.isValid} type="submit">
          Login
        </Button>
      </form>
      <Dialog open={resendVerifyOpen} onOpenChange={setResendVerifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Verification Required</DialogTitle>
          </DialogHeader>
          <ResendVerifyEmail email={form.getValues('username')} onSuccess={() => setResendVerifyOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
