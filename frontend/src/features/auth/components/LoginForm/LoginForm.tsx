import { ErrorMessage } from '@/components/ErrorMessage/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { http } from '@/lib/http';
import { handleDetailError, setFormErrors } from '@/utils/errors';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleSSOButton } from '../GoogleSSOButton/GoogleSSOButton';
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

  async function onSubmit(data: LoginFormData) {
    try {
      const res = await http.post('/api/token-auth/', data);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/');
    } catch (err) {
      form.resetField('password');
      handleDetailError(err, (detail) => {
        if (detail.includes('verification')) {
          setResendVerifyOpen(true);
        }
      });
      setFormErrors(form, err);
    }
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
          <ErrorMessage>{errors.username?.message}</ErrorMessage>
        </div>
        <div className="form-group">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {/* <Link to="/password-reset" className="text-primary text-sm leading-none hover:underline">
              Forgot your password?
            </Link> */}
          </div>
          <Input
            id="password"
            placeholder="Password"
            type="password"
            {...form.register('password', { required: true })}
          />
          <ErrorMessage>{errors.password?.message}</ErrorMessage>
        </div>
        <ErrorMessage>{errors.root?.message}</ErrorMessage>
        <Button disabled={!form.formState.isValid} type="submit">
          Login
        </Button>
        {import.meta.env.VITE_GOOGLE_OAUTH2_CLIENT_ID && <GoogleSSOButton />}
      </form>
      <Dialog open={resendVerifyOpen} onOpenChange={setResendVerifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Verification Required</DialogTitle>
            <DialogDescription>Please verify your email address before logging in.</DialogDescription>
          </DialogHeader>
          <ResendVerifyEmail email={form.getValues('username')} onSuccess={() => setResendVerifyOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
