
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/supabase';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (you'll need to add your publishable key to environment variables)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface ProviderService {
  id: string;
  provider_id: string;
  service_name: string;
  description?: string;
  price_per_session: number;
  duration_minutes: number;
  is_active: boolean;
}

export interface Payment {
  id: string;
  appointment_id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

// Provider Services Management
export const createProviderService = async (
  serviceName: string,
  description: string,
  pricePerSession: number,
  durationMinutes: number = 60
): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data: providerProfile, error: profileError } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw profileError;

    const { error } = await supabase
      .from('provider_services')
      .insert({
        provider_id: providerProfile.id,
        service_name: serviceName,
        description,
        price_per_session: pricePerSession,
        duration_minutes: durationMinutes,
        is_active: true
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating provider service:', error);
    return false;
  }
};

export const getProviderServices = async (): Promise<ProviderService[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data: providerProfile, error: profileError } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw profileError;

    const { data, error } = await supabase
      .from('provider_services')
      .select('*')
      .eq('provider_id', providerProfile.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching provider services:', error);
    return [];
  }
};

export const updateProviderService = async (
  serviceId: string,
  updates: Partial<ProviderService>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('provider_services')
      .update(updates)
      .eq('id', serviceId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating provider service:', error);
    return false;
  }
};

export const deleteProviderService = async (serviceId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('provider_services')
      .update({ is_active: false })
      .eq('id', serviceId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting provider service:', error);
    return false;
  }
};

// Payment Processing
export const createPaymentIntent = async (
  appointmentId: string,
  amount: number
): Promise<PaymentIntent | null> => {
  try {
    // In a real implementation, this would call your backend API
    // which would create the payment intent with Stripe
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointment_id: appointmentId,
        amount: amount * 100, // Convert to cents
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const paymentIntent = await response.json();

    // Store payment record in database
    const { error } = await supabase
      .from('payments')
      .insert({
        appointment_id: appointmentId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: amount,
        currency: 'usd',
        status: 'pending',
        stripe_client_secret: paymentIntent.client_secret
      });

    if (error) throw error;

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return null;
  }
};

export const confirmPayment = async (
  paymentIntentId: string,
  paymentMethodId: string
): Promise<boolean> => {
  try {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe not loaded');

    const { error } = await stripe.confirmPayment({
      elements: null as any, // This would be your Elements instance
      confirmParams: {
        payment_method: paymentMethodId,
      },
    });

    if (error) {
      console.error('Payment confirmation error:', error);
      return false;
    }

    // Update payment status in database
    await supabase
      .from('payments')
      .update({ status: 'succeeded' })
      .eq('stripe_payment_intent_id', paymentIntentId);

    return true;
  } catch (error) {
    console.error('Error confirming payment:', error);
    return false;
  }
};

export const getPaymentHistory = async (): Promise<Payment[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Get user profile to determine if client or provider
    const { data: clientProfile } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const { data: providerProfile } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let query = supabase
      .from('payments')
      .select(`
        *,
        appointments (
          service,
          date,
          time,
          client_profiles (name),
          provider_profiles (name)
        )
      `);

    if (clientProfile) {
      query = query.eq('appointments.client_id', clientProfile.id);
    } else if (providerProfile) {
      query = query.eq('appointments.provider_id', providerProfile.id);
    } else {
      throw new Error('User profile not found');
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
};

// Provider Payment Settings
export const getProviderPaymentSettings = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data: providerProfile, error: profileError } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw profileError;

    const { data, error } = await supabase
      .from('provider_payment_settings')
      .select('*')
      .eq('provider_id', providerProfile.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error fetching provider payment settings:', error);
    return null;
  }
};

export const updateProviderPaymentSettings = async (settings: {
  stripe_account_id?: string;
  payment_enabled?: boolean;
  require_deposit?: boolean;
  deposit_percentage?: number;
}): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data: providerProfile, error: profileError } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw profileError;

    const { error } = await supabase
      .from('provider_payment_settings')
      .upsert({
        provider_id: providerProfile.id,
        ...settings,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating provider payment settings:', error);
    return false;
  }
};
