
-- Create necessary tables for the ExpertMeet application

-- Client profiles table
CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider profiles table
CREATE TABLE provider_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  specialty TEXT,
  years_experience INTEGER,
  rating DECIMAL(3,2),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES client_profiles(id) NOT NULL,
  provider_id UUID REFERENCES provider_profiles(id) NOT NULL,
  service TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  method TEXT NOT NULL,
  room_id TEXT, -- For video call sessions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  shared_with UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider services and pricing table
CREATE TABLE provider_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES provider_profiles(id) NOT NULL,
  service_name TEXT NOT NULL,
  description TEXT,
  price_per_session DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) NOT NULL,
  stripe_payment_intent_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, succeeded, failed, canceled
  stripe_client_secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider payment settings table
CREATE TABLE provider_payment_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES provider_profiles(id) NOT NULL UNIQUE,
  stripe_account_id TEXT,
  payment_enabled BOOLEAN DEFAULT FALSE,
  require_deposit BOOLEAN DEFAULT FALSE,
  deposit_percentage INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- View for user profile information (combines client and provider profiles)
CREATE OR REPLACE VIEW users_view AS
  SELECT 
    cp.id,
    cp.user_id,
    cp.name,
    cp.email,
    'client' as user_type
  FROM client_profiles cp
  UNION ALL
  SELECT 
    pp.id,
    pp.user_id,
    pp.name,
    pp.email,
    'provider' as user_type
  FROM provider_profiles pp;

-- Security policies

-- Client profiles policies
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own profile"
  ON client_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Clients can update their own profile"
  ON client_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Providers can view client profiles they have appointments with"
  ON client_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provider_profiles pp
      JOIN appointments a ON pp.id = a.provider_id
      WHERE pp.user_id = auth.uid() AND a.client_id = client_profiles.id
    )
  );

-- Provider profiles policies
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view their own profile"
  ON provider_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view provider profiles"
  ON provider_profiles FOR SELECT
  USING (true);

CREATE POLICY "Providers can update their own profile"
  ON provider_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Appointments policies
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE user_id = auth.uid() AND id = appointments.client_id
    )
  );

CREATE POLICY "Clients can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE user_id = auth.uid() AND id = appointments.client_id
    )
  );

CREATE POLICY "Clients can update their appointments"
  ON appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM client_profiles
      WHERE user_id = auth.uid() AND id = appointments.client_id
    )
  );

CREATE POLICY "Providers can view their appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM provider_profiles
      WHERE user_id = auth.uid() AND id = appointments.provider_id
    )
  );

CREATE POLICY "Providers can update their appointments"
  ON appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM provider_profiles
      WHERE user_id = auth.uid() AND id = appointments.provider_id
    )
  );

-- Messages policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages they sent or received"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages they send"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Documents policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = ANY(shared_with));

CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- Provider services policies
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage their own services"
  ON provider_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM provider_profiles
      WHERE user_id = auth.uid() AND id = provider_services.provider_id
    )
  );

CREATE POLICY "Anyone can view active provider services"
  ON provider_services FOR SELECT
  USING (is_active = true);

-- Payments policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their payment records"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN client_profiles cp ON a.client_id = cp.id
      WHERE cp.user_id = auth.uid() AND a.id = payments.appointment_id
    )
  );

CREATE POLICY "Providers can view their payment records"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      JOIN provider_profiles pp ON a.provider_id = pp.id
      WHERE pp.user_id = auth.uid() AND a.id = payments.appointment_id
    )
  );

-- Provider payment settings policies
ALTER TABLE provider_payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can manage their own payment settings"
  ON provider_payment_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM provider_profiles
      WHERE user_id = auth.uid() AND id = provider_payment_settings.provider_id
    )
  );

-- Storage policies for document uploads
-- These would be configured in the Supabase dashboard
