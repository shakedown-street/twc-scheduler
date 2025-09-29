import { Button } from '@/components/ui/button';
import { http } from '@/lib/http';
import { toastError } from '@/utils/errors';

export type ResendVerifyEmailProps = {
  email: string;
  onSuccess: () => void;
};

export const ResendVerifyEmail = ({ email, onSuccess }: ResendVerifyEmailProps) => {
  async function clickResendVerifyEmail() {
    try {
      http.post('/api/resend-verify-email/', {
        email,
      });
      onSuccess?.();
    } catch (err) {
      toastError(err);
    }
  }

  return (
    <>
      <Button className="w-full" onClick={clickResendVerifyEmail}>
        Resend Verification Email
      </Button>
    </>
  );
};
