import { http } from '@/http';
import { Button, Input, useToast } from '@/ui';
import { handleFormErrors } from '@/utils/errors';
import { useForm } from 'react-hook-form';
import './PasswordChangeForm.scss';

export type PasswordChangeFormData = {
  old_password: string;
  new_password1: string;
  new_password2: string;
};

export const PasswordChangeForm = () => {
  const form = useForm<PasswordChangeFormData>();
  const toast = useToast();

  const { errors } = form.formState;

  function onSubmit(data: PasswordChangeFormData) {
    http
      .post('/api/password-change/', data)
      .then((token) => {
        localStorage.setItem('token', token.data.token);
        form.reset();
        toast.success('Your password has been changed');
      })
      .catch((err) => {
        handleFormErrors(form, err);
      });
  }

  return (
    <>
      <form className="PasswordChangeForm" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="PasswordChangeForm__field">
          <Input
            autoFocus
            fluid
            id="old_password"
            label="Current Password"
            type="password"
            {...form.register('old_password', { required: true })}
          />
          {errors.old_password && <p className="form-error mt-2">{errors.old_password.message}</p>}
        </div>
        <div className="PasswordChangeForm__field">
          <Input
            fluid
            id="new_password1"
            label="New Password"
            type="password"
            {...form.register('new_password1', { required: true })}
          />
          {errors.new_password1 && <p className="form-error mt-2">{errors.new_password1.message}</p>}
        </div>
        <div className="PasswordChangeForm__field">
          <Input
            fluid
            id="new_password2"
            label="New Password (Again)"
            type="password"
            {...form.register('new_password2', { required: true })}
          />
          {errors.new_password2 && <p className="form-error mt-2">{errors.new_password2.message}</p>}
        </div>
        {errors.root && <p className="form-error">{errors.root.message}</p>}
        <div className="PasswordChangeForm__actions">
          <Button color="primary" disabled={!form.formState.isValid} type="submit" variant="raised">
            Change Password
          </Button>
        </div>
      </form>
    </>
  );
};
