import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51NhCv2SDvLUZq2h78g1MrUsLp0DzlAWKoJ4ppcrbJ2jftU1fI2kSiHOB7dkbQu8EQZf1bxt1czV4Ah6AnFIqoa1900hMbHY8zF',
  );

  try {
    // 1) Get checkout session from API
    const session = await axios(
      `${window.location.origin}/api/v1/booking/checkout-session/${tourId}`,
    );

    console.log(session);

    // 2) Create checkout form and charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
