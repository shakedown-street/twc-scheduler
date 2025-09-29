import { Button } from '@/components/ui/button';
import { http } from '@/lib/http';
import { toastError } from '@/utils/errors';

export type ResendVerifyEmailProps = {
  email: string;
  onSuccess: () => void;
};

export const ResendVerifyEmail = ({ email, onSuccess }: ResendVerifyEmailProps) => {
  function clickResendVerifyEmail() {
    http
      .post('/api/resend-verify-email/', {
        email,
      })
      .then(() => {
        onSuccess?.();
      })
      .catch((err) => {
        toastError(err);
      });
  }

  return (
    <>
      <div>
        <h2 className="text-center text-lg font-bold">Email Verification Required</h2>
        <p className="mb-4 text-center">
          Please check <strong>{email}</strong>
          <br />
          for a verification email from us.
        </p>
        <Button className="w-full" onClick={clickResendVerifyEmail}>
          Resend Verification Email
        </Button>
      </div>
    </>
  );
};
