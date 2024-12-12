import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { CheckoutSessionModel } from '~/api';
import { Container, useToast } from '~/ui';

export const CheckoutSuccess = () => {
  const [session, setSession] = React.useState<any>();

  const [searchParams, _] = useSearchParams();
  const toast = useToast();

  React.useEffect(() => {
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return;
    }

    CheckoutSessionModel.get(session_id)
      .then((session) => {
        setSession(session.data);
      })
      .catch((err) => toast.errorResponse(err));
  }, [searchParams]);

  if (session && session.status === 'open') {
    return <Navigate to="/checkout" />;
  }

  if (session && session.status === 'complete') {
    return (
      <Container>
        <h1>Payment successful!</h1>
        <p>Thank you</p>
      </Container>
    );
  }

  return null;
};
