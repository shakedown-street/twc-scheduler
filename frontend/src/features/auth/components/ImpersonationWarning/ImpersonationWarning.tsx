import { Button } from '@/components/ui/button';
import { http } from '@/lib/http';
import { toastError } from '@/utils/errors';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

export const ImpersonationWarning = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const impersonate = localStorage.getItem('impersonate');

  async function clickStop() {
    try {
      await http.post('/api/token-auth/logout/');
      navigate('/');
      localStorage.removeItem('impersonate');
      window.location.reload();
    } catch (err) {
      toastError(err);
    }
  }

  if (!user || !impersonate) {
    return null;
  }

  return (
    <>
      <div className="fixed right-4 bottom-4 flex w-70 items-center gap-2 rounded border p-2 shadow">
        <div className="text-muted-foreground text-xs">
          You are currently impersonating <b>{user.email}</b>.
          <br />
          Please remember to disable impersonation when you are done.
        </div>
        <Button onClick={clickStop} size="sm">
          Stop
        </Button>
      </div>
    </>
  );
};
