import { http } from '@/http';
import { Button, useToast } from '@/ui';
import './ResendVerifyEmail.scss';

export type ResendVerifyEmailProps = {
  email: string;
  onSuccess: () => void;
};

export const ResendVerifyEmail = ({ email, onSuccess }: ResendVerifyEmailProps) => {
  const toast = useToast();

  function clickResendVerifyEmail() {
    http
      .post('/api/resend-verify-email/', {
        email,
      })
      .then(() => {
        onSuccess?.();
      })
      .catch((err) => {
        toast.errorResponse(err);
      });
  }

  return (
    <>
      <div className="ResendVerifyEmail">
        <h2 className="text-center">Email Verification Required</h2>
        <p className="mb-4 text-center">
          Please check <strong>{email}</strong>
          <br />
          for a verification email from us.
        </p>
        <Button color="primary" fluid onClick={clickResendVerifyEmail} variant="raised">
          Resend Verification Email
        </Button>
      </div>
    </>
  );
};
