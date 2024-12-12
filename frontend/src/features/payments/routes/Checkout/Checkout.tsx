import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react';
import { CheckoutSessionModel } from '~/api';
import { Container, useToast } from '~/ui';

export const Checkout = () => {
  const stripePromise = React.useMemo(() => loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY), []);
  const toast = useToast();

  const fetchClientSecret = React.useCallback(() => {
    return CheckoutSessionModel.create({})
      .then((session) => session.data.client_secret)
      .catch((err) => toast.errorResponse(err));
  }, []);

  const options = { fetchClientSecret };

  return (
    <>
      <Container>
        <div className="my-8">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </Container>
    </>
  );
};
