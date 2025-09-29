import { Button } from '@/components/ui/button';
import { http } from '@/lib/http';
import { toastError } from '@/utils/errors';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ImpersonationWarning = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const impersonate = localStorage.getItem('impersonate');

  function clickStop() {
    http
      .post('/api/token-auth/logout/')
      .catch((err) => toastError(err))
      .finally(() => {
        navigate('/');
        localStorage.removeItem('impersonate');
        window.location.reload();
      });
  }

  if (!user || !impersonate) {
    return null;
  }

  return (
    <>
      <div className="fixed right-4 bottom-4 w-80 rounded-md border bg-white p-2 shadow">
        <div className="flex items-center gap-2">
          <div className="text-muted-foreground text-xs">
            You are currently impersonating <b>{user.email}</b>.
            <br />
            Please remember to disable impersonation when you are done.
          </div>
          <Button onClick={clickStop} size="sm">
            Stop
          </Button>
        </div>
      </div>
    </>
  );
};
