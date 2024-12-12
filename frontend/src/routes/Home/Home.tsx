import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '~/features/auth/contexts/AuthContext';
import { Container } from '~/ui';

export const Home = () => {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Home | Schedule Builder</title>
      </Helmet>
      <Container>
        <div className="mt-12 text-center">
          <h1 className="mb-4">Welcome to Schedule Builder!</h1>
          {user && <p className="mb-4">{user.email}</p>}
          <p>
            <Link to="/style-guide">Click here</Link> to view the style guide
          </p>
        </div>
      </Container>
    </>
  );
};
