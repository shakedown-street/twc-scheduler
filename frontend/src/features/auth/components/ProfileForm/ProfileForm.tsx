import { UserModel } from '@/api';
import GenericPlaceholder from '@/assets/generic-placeholder.svg';
import { ErrorMessage } from '@/components/ErrorMessage/ErrorMessage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { setFormErrors, toastError } from '@/utils/errors';
import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

export type ProfileFormData = {
  first_name: string;
  last_name: string;
  phone: string;
};

export const ProfileForm = () => {
  const [imageDragActive, setImageDragActive] = React.useState(false);

  const { user, setUser } = useAuth();
  const form = useForm<ProfileFormData>({
    defaultValues: {
      first_name: user ? user.first_name : '',
      last_name: user ? user.last_name : '',
      phone: user ? user.phone : '',
    },
  });

  const { errors } = form.formState;

  function handleImageClick() {
    document.getElementById('image-input')?.click();
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    uploadImage(e.target.files[0]);
  }

  function handleImageDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setImageDragActive(true);
  }

  function handleImageDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setImageDragActive(false);
  }

  function handleImageDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setImageDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadImage(e.dataTransfer.files[0]);
    }
  }

  async function uploadImage(file: File) {
    if (!user) {
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await UserModel.update(user.id, formData);
      setUser(res.data);
      toast.success('Your image has been uploaded');
    } catch (err) {
      toastError(err);
    }
  }

  async function removeImage() {
    if (!user) {
      return;
    }

    try {
      const res = await UserModel.update(user.id, { image: null });
      setUser(res.data);
      toast.success('Your image has been removed');
    } catch (err) {
      toastError(err);
    }
  }

  async function onSubmit(data: ProfileFormData) {
    if (!user) {
      return;
    }

    try {
      const res = await UserModel.update(user.id, data);
      setUser(res.data);
      toast.success('Your profile has been updated');
    } catch (err) {
      setFormErrors(form, err);
    }
  }

  return (
    <>
      <form className="form" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="form-group self-center">
          <input accept="image/*" className="hidden" id="image-input" onChange={handleImageChange} type="file" />
          <img
            alt="Profile image"
            className={cn('h-40 w-40 cursor-pointer rounded-full object-cover', {
              'ring-ring/50 ring-[3px]': imageDragActive,
            })}
            onClick={handleImageClick}
            onDragLeave={handleImageDragLeave}
            onDragOver={handleImageDragOver}
            onDrop={handleImageDrop}
            src={user?.image || GenericPlaceholder}
          />
          {user?.image && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" type="button" variant="link">
                  Remove Image
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Image</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove your image? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={removeImage}>Remove</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="form-group">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" readOnly value={user?.email} />
        </div>
        <div className="form-group">
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" {...form.register('first_name')} />
          <ErrorMessage>{errors.first_name?.message}</ErrorMessage>
        </div>
        <div className="form-group">
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" {...form.register('last_name')} />
          <ErrorMessage>{errors.last_name?.message}</ErrorMessage>
        </div>
        <div className="form-group">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...form.register('phone')} />
          <ErrorMessage>{errors.phone?.message}</ErrorMessage>
        </div>
        <ErrorMessage>{errors.root?.message}</ErrorMessage>
        <Button disabled={!form.formState.isValid} type="submit">
          Save
        </Button>
      </form>
    </>
  );
};
