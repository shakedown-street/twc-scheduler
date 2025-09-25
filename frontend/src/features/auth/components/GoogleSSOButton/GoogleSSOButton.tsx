import { http } from '@/http';
import { Button } from '@/ui';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GoogleSSOLogo from './GoogleSSOLogo.svg';

export type GoogleSSOButtonProps = {
  label?: string;
};

export const GoogleSSOButton = ({ label = 'Sign in with Google' }: GoogleSSOButtonProps) => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const googleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      const res = await http.post('/api/social-auth/google-oauth2/', {
        access_token: credentialResponse.access_token,
      });

      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      navigate('/');
    },
  });

  return (
    <Button fluid onClick={() => googleLogin()} variant="outlined">
      <div className="flex align-center justify-center gap-2">
        <img src={GoogleSSOLogo} style={{ height: '18px', width: '18px' }} />
        {label}
      </div>
    </Button>
  );
};
