import { Button } from '@/components/ui/button';
import { http } from '@/lib/http';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import GoogleSSOLogo from './GoogleSSOLogo.svg';

export type GoogleSSOButtonProps = React.ComponentProps<'button'> & {
  label?: string;
};

export const GoogleSSOButton = ({ children = 'Login with Google', ...props }: GoogleSSOButtonProps) => {
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
    <Button onClick={() => googleLogin()} type="button" variant="outline" {...props}>
      <img className="size-4" src={GoogleSSOLogo} />
      {children}
    </Button>
  );
};
