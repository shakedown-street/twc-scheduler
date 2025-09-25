import { UserModel } from '@/api';
import { BasicImageUpload, Button, Input, useToast } from '@/ui';
import { convertToFormData } from '@/utils/formData';
import { Controller, useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import './ProfileForm.scss';

export type ProfileFormData = {
  image: File | null;
  first_name: string;
  last_name: string;
  phone: string;
};

export const ProfileForm = () => {
  const { user, setUser } = useAuth();
  const form = useForm<ProfileFormData>({
    defaultValues: {
      first_name: user ? user.first_name : '',
      last_name: user ? user.last_name : '',
      phone: user ? user.phone : '',
    },
  });
  const toast = useToast();

  const { errors } = form.formState;

  function onSubmit(data: ProfileFormData) {
    if (!user) {
      return;
    }

    const formData = convertToFormData(data);

    UserModel.update(user.id, formData)
      .then((res) => {
        setUser(res.data);
        toast.success('Your profile has been updated');
      })
      .catch((err) => {
        toast.errorResponse(err);
      });
  }

  function removeImage() {
    if (!user) {
      return;
    }

    UserModel.update(user.id, {
      image: null,
    })
      .then((res) => {
        setUser(res.data);
        toast.success('Your profile image has been removed');
      })
      .catch((err) => {
        toast.errorResponse(err);
      });
  }

  return (
    <>
      <form className="ProfileForm" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="ProfileForm__field ProfileForm__field--center">
          <Controller
            control={form.control}
            name="image"
            render={({ field: { onChange } }) => (
              <BasicImageUpload initialSrc={user?.image || undefined} onRemove={removeImage} onChange={onChange} />
            )}
          />
          {errors.image && <p className="form-error mt-2">{errors.image.message}</p>}
        </div>
        <div className="ProfileForm__field">
          <Input fluid id="email" label="Email" readOnly value={user?.email} />
        </div>
        <div className="ProfileForm__field">
          <Input fluid id="first_name" label="First Name" {...form.register('first_name')} />
          {errors.first_name && <p className="form-error mt-2">{errors.first_name.message}</p>}
        </div>
        <div className="ProfileForm__field">
          <Input fluid id="last_name" label="Last Name" {...form.register('last_name')} />
          {errors.last_name && <p className="form-error mt-2">{errors.last_name.message}</p>}
        </div>
        <div className="ProfileForm__field">
          <Input fluid id="phone" label="Phone" {...form.register('phone')} />
          {errors.phone && <p className="form-error mt-2">{errors.phone.message}</p>}
        </div>
        {errors.root && <p className="form-error">{errors.root.message}</p>}
        <div className="ProfileForm__actions">
          <Button color="primary" disabled={!form.formState.isValid} type="submit" variant="raised">
            Save
          </Button>
        </div>
      </form>
    </>
  );
};
