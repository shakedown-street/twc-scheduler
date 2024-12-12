import { useNavigate } from 'react-router-dom';
import { http } from '~/http';
import { Button, Card, useToast } from '~/ui';
import { useAuth } from '../../contexts/AuthContext';
import './ImpersonationWarning.scss';

export const ImpersonationWarning = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const impersonate = localStorage.getItem('impersonate');

  function clickStop() {
    http
      .post('/api/token-auth/logout/')
      .catch((err) => toast.errorResponse(err))
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
      <Card className="ImpersonationWarning">
        <div className="ImpersonationWarning__content">
          <p>
            You are currently impersonating <b>{user.email}</b>.
            <br />
            Please remember to disable impersonation when you are done.
          </p>
          <Button color="primary" onClick={clickStop} size="xs" variant="ghost">
            Stop
          </Button>
        </div>
      </Card>
    </>
  );
};
