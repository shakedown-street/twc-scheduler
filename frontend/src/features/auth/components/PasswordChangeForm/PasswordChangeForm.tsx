import { ErrorMessage } from '@/components/ErrorMessage/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { http } from '@/lib/http';
import { setFormErrors } from '@/utils/errors';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { PasswordHint } from '../PasswordHint/PasswordHint';

export type PasswordChangeFormData = {
  old_password: string;
  new_password1: string;
  new_password2: string;
};

export const PasswordChangeForm = () => {
  const form = useForm<PasswordChangeFormData>();

  const { errors } = form.formState;

  async function onSubmit(data: PasswordChangeFormData) {
    try {
      const token = await http.post('/api/password-change/', data);
      localStorage.setItem('token', token.data.token);
      form.reset();
      toast.success('Your password has been changed');
    } catch (err) {
      setFormErrors(form, err);
    }
  }

  return (
    <>
      <form className="form" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="form-group">
          <Label htmlFor="old_password">Current Password</Label>
          <Input
            id="old_password"
            placeholder="Current Password"
            type="password"
            {...form.register('old_password', { required: true })}
          />
          <ErrorMessage>{errors.old_password?.message}</ErrorMessage>
        </div>
        <div className="form-group">
          <Label htmlFor="new_password1">New Password</Label>
          <Input
            id="new_password1"
            placeholder="New Password"
            type="password"
            {...form.register('new_password1', { required: true })}
          />
          <PasswordHint />
          <ErrorMessage>{errors.new_password1?.message}</ErrorMessage>
        </div>
        <div className="form-group">
          <Label htmlFor="new_password2">New Password (Again)</Label>
          <Input
            id="new_password2"
            placeholder="New Password (Again)"
            type="password"
            {...form.register('new_password2', { required: true })}
          />
          <ErrorMessage>{errors.new_password2?.message}</ErrorMessage>
        </div>
        <ErrorMessage>{errors.root?.message}</ErrorMessage>
        <Button disabled={!form.formState.isValid} type="submit">
          Change Password
        </Button>
      </form>
    </>
  );
};
