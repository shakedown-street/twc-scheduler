import { ErrorMessage } from '@/components/ErrorMessage/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { http } from '@/lib/http';
import { setFormErrors } from '@/utils/errors';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { PasswordHint } from '../PasswordHint/PasswordHint';

export type PasswordResetConfirmFormProps = {
  uid: string | undefined;
  token: string | undefined;
};

export type PasswordResetConfirmFormData = {
  new_password1: string;
  new_password2: string;
};

export const PasswordResetConfirmForm = (props: PasswordResetConfirmFormProps) => {
  const form = useForm<PasswordResetConfirmFormData>();
  const navigate = useNavigate();

  const { errors } = form.formState;

  async function onSubmit(data: PasswordResetConfirmFormData) {
    try {
      await http.post('/api/password-reset-confirm/', {
        uid: props.uid,
        token: props.token,
        ...data,
      });
      navigate('/login');
    } catch (err) {
      setFormErrors(form, err);
    }
  }

  return (
    <form className="form" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="form-group">
        <Label htmlFor="new_password1">New Password</Label>
        <Input
          autoFocus
          id="new_password1"
          placeholder="New password"
          type="password"
          {...form.register('new_password1', { required: true })}
        />
        <PasswordHint />
        <ErrorMessage>{errors.new_password1?.message}</ErrorMessage>
      </div>
      <div className="form-group">
        <Label htmlFor="new_password2">New Password</Label>
        <Input
          id="new_password2"
          placeholder="New password (Again)"
          type="password"
          {...form.register('new_password2', { required: true })}
        />
        <ErrorMessage>{errors.new_password2?.message}</ErrorMessage>
      </div>
      <ErrorMessage>{errors.root?.message}</ErrorMessage>
      <Button disabled={!form.formState.isValid} type="submit">
        Update Password
      </Button>
    </form>
  );
};
