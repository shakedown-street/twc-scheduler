import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'react-router';
import { PasswordResetConfirmForm } from '../../components/PasswordResetConfirmForm/PasswordResetConfirmForm';

export const PasswordResetConfirm = () => {
  const { uid, token } = useParams();

  return (
    <>
      <title>Password Reset | PROJECT_NAME</title>
      <div className="mx-auto my-12 w-full max-w-sm px-4">
        <Card>
          <CardHeader>
            <CardTitle>Password Reset</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordResetConfirmForm uid={uid} token={token} />
          </CardContent>
        </Card>
      </div>
    </>
  );
};
