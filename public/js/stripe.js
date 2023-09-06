import axios from "axios";
import { showAlert } from "./alert";

export const bookTour = async tourId => {
    const stripe = Stripe("pk_test_51NhCv2SDvLUZq2h78g1MrUsLp0DzlAWKoJ4ppcrbJ2jftU1fI2kSiHOB7dkbQu8EQZf1bxt1czV4Ah6AnFIqoa1900hMbHY8zF");

    try {
        // 1) Get checkout session from API
        const session = await axios(`${req.protocol}://${req.get('host')}/booking/checkout-session/${tourId}`)

        // 2) Create checkout form and charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    }
    catch (err) {
        console.log(err);
        showAlert('error', err);
    }
}