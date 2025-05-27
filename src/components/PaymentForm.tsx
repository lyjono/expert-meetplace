
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { createPaymentIntent } from '@/services/payments';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentFormProps {
  appointmentId: string;
  amount: number;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

const PaymentFormInner = ({ appointmentId, amount, onPaymentSuccess, onPaymentError }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const paymentIntent = await createPaymentIntent(appointmentId, amount);
      
      if (!paymentIntent) {
        throw new Error('Failed to create payment intent');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment
      const { error, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        onPaymentError(error.message || 'Payment failed');
      } else if (confirmedPayment?.status === 'succeeded') {
        onPaymentSuccess();
        toast.success('Payment successful!');
      }
    } catch (error: any) {
      onPaymentError(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-md">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-2xl font-bold">${amount.toFixed(2)}</p>
        </div>
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="min-w-[120px]"
        >
          {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
};

export const PaymentForm = (props: PaymentFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
        <CardDescription>
          Enter your payment details to complete the booking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise}>
          <PaymentFormInner {...props} />
        </Elements>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
