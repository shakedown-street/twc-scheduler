import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { http } from '@/lib/http';
import { setFormErrors } from '@/utils/errors';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export type PasswordChangeFormData = {
  old_password: string;
  new_password1: string;
  new_password2: string;
};

export const PasswordChangeForm = () => {
  const form = useForm<PasswordChangeFormData>();

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
        setFormErrors(form, err);
      });
  }

  return (
    <>
      <form className="form" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="form-group">
          <Label htmlFor="old_password">Current Password</Label>
          <Input autoFocus id="old_password" type="password" {...form.register('old_password', { required: true })} />
          {errors.old_password && <div className="form-error">{errors.old_password.message}</div>}
        </div>
        <div className="form-group">
          <Label htmlFor="new_password1">New Password</Label>
          <Input id="new_password1" type="password" {...form.register('new_password1', { required: true })} />
          {errors.new_password1 && <div className="form-error">{errors.new_password1.message}</div>}
        </div>
        <div className="form-group">
          <Label htmlFor="new_password2">New Password (Again)</Label>
          <Input id="new_password2" type="password" {...form.register('new_password2', { required: true })} />
          {errors.new_password2 && <div className="form-error">{errors.new_password2.message}</div>}
        </div>
        {errors.root && <div className="form-error">{errors.root.message}</div>}
        <Button disabled={!form.formState.isValid} type="submit">
          Change Password
        </Button>
      </form>
    </>
  );
};
