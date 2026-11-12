import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { confirmPayment, createPaymentIntent, getBooking } from '../../../shared/config/api';
import { formatLkr, formatPrice, formatUsd } from '../../../shared/data/destinations';
import { useAuth } from '../../../shared/context/AuthContext';

const stripeCache = {};

function stripePromiseFor(key) {
  if (!key || !key.startsWith('pk_')) return null;
  if (!stripeCache[key]) stripeCache[key] = loadStripe(key);
  return stripeCache[key];
}

const PayForm = ({ booking, token, onPaid }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pay = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError('');
    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required'
    });
    if (result.error) {
      setError(result.error.message || 'Payment failed');
      setSubmitting(false);
      return;
    }
    try {
      await confirmPayment({
        bookingId: booking.id,
        paymentIntentId: result.paymentIntent.id
      }, token);
      onPaid();
    } catch (err) {
      setError(err.message || 'Payment succeeded, but the booking could not be confirmed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={pay} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={!stripe || submitting}>
        {submitting ? 'Paying…' : `Pay ${formatPrice(booking.totalAmount)}`}
      </button>
    </form>
  );
};

const Checkout = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [booking, setBooking] = useState(null);
  const [intent, setIntent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      sessionStorage.setItem('postLoginPath', `/checkout/${bookingId}`);
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate, bookingId]);

  useEffect(() => {
    if (!token || !bookingId) return;
    let cancelled = false;
    setLoading(true);
    getBooking(bookingId, token)
      .then(async (data) => {
        if (cancelled) return;
        setBooking(data);
        if (data.paymentStatus === 'PAID' || data.status === 'CONFIRMED') {
          setPaid(true);
          return;
        }
        const payment = await createPaymentIntent(data.id, token);
        if (!cancelled) setIntent(payment);
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not start checkout'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, bookingId]);

  if (loading) {
    return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error || 'Booking not found'}</p>
        <Link to="/tours" className="btn-primary">Browse experiences</Link>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">You’re booked</h1>
        <p className="text-gray-600 mb-6">{booking.tourTitle} on {booking.bookingDate} is confirmed.</p>
        <Link to="/profile" className="btn-primary">See my trips</Link>
      </div>
    );
  }

  const stripePromise = stripePromiseFor(intent?.publishableKey);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 card-modern p-6">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {intent?.clientSecret && stripePromise ? (
          <Elements stripe={stripePromise} options={{ clientSecret: intent.clientSecret }}>
            <PayForm booking={booking} token={token} onPaid={() => setPaid(true)} />
          </Elements>
        ) : (
          <p className="text-gray-600">Add a Stripe test publishable key and secret key to finish card payment. The booking stays pending until then.</p>
        )}
      </div>
      <aside className="lg:col-span-2 card-modern p-6 h-fit">
        <h2 className="font-semibold text-lg">{booking.tourTitle}</h2>
        <p className="text-sm text-gray-600 mt-2">{booking.destination}</p>
        <p className="text-sm text-gray-600">{booking.bookingDate} · {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'person' : 'people'}</p>
        <p className="text-xl font-bold mt-4">{formatLkr(booking.totalAmount)}</p>
        <p className="text-sm text-gray-500 mt-1">{formatUsd(booking.totalAmount)}. Card payment is charged in USD.</p>
      </aside>
    </div>
  );
};

export default Checkout;
