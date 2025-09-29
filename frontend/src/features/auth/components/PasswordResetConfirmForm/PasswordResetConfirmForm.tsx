import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { http } from '@/lib/http';
import { setFormErrors } from '@/utils/errors';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

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

  function onSubmit(data: PasswordResetConfirmFormData) {
    http
      .post('/api/password-reset-confirm/', {
        uid: props.uid,
        token: props.token,
        ...data,
      })
      .then(() => {
        navigate('/login');
      })
      .catch((err) => {
        setFormErrors(form, err);
      });
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
        {errors.new_password1 && <div className="form-error">{errors.new_password1.message}</div>}
      </div>
      <div className="form-group">
        <Label htmlFor="new_password2">New Password (Again)</Label>
        <Input
          id="new_password2"
          placeholder="New password (Again)"
          type="password"
          {...form.register('new_password2', { required: true })}
        />
        <div className="text-muted-foreground text-xs">
          Passwords must be at least 8 characters, with at least one number and one letter.
        </div>
        {errors.new_password2 && <div className="form-error">{errors.new_password2.message}</div>}
      </div>
      {errors.root && <div className="form-error">{errors.root.message}</div>}
      <Button disabled={!form.formState.isValid} type="submit">
        Update Password
      </Button>
    </form>
  );
};
