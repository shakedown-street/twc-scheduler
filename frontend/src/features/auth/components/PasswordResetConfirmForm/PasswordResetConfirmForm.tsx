import { Button } from '@/components/ui/button';
import { http } from '@/http';
import { Input } from '@/ui';
import { handleFormErrors } from '@/utils/errors';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import './PasswordResetConfirmForm.scss';

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
        handleFormErrors(form, err);
      });
  }

  return (
    <form className="PasswordResetConfirmForm" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="PasswordResetConfirmForm__field">
        <Input
          autoFocus
          fluid
          id="new_password1"
          label="New Password"
          placeholder="New password"
          type="password"
          {...form.register('new_password1', { required: true })}
        />
        {errors.new_password1 && <p className="form-error mt-2">{errors.new_password1.message}</p>}
      </div>
      <div className="PasswordResetConfirmForm__field">
        <Input
          fluid
          id="new_password2"
          label="New Password (Again)"
          placeholder="New password (Again)"
          type="password"
          {...form.register('new_password2', { required: true })}
        />
        <p className="text-muted-foreground mt-2 text-xs">
          Passwords must be at least 8 characters, with at least one number and one letter.
        </p>
        {errors.new_password2 && <p className="form-error mt-2">{errors.new_password2.message}</p>}
      </div>
      {errors.root && <p className="form-error">{errors.root.message}</p>}
      <div className="PasswordResetConfirmForm__actions">
        <Button className="w-full" disabled={!form.formState.isValid} type="submit">
          Update Password
        </Button>
      </div>
    </form>
  );
};
