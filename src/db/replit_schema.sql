
-- Create necessary tables for the ExpertMeet application

-- Users table (replacing Supabase auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  user_type TEXT DEFAULT 'client',
  user_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client profiles table
CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider profiles table
CREATE TABLE provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  specialty TEXT,
  years_experience INTEGER,
  rating DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES client_profiles(id) NOT NULL,
  provider_id UUID REFERENCES provider_profiles(id) NOT NULL,
  service TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) NOT NULL,
  receiver_id UUID REFERENCES users(id) NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  shared_with UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a few test users and profiles to get started
INSERT INTO users (email, password, user_type, user_metadata) VALUES
('client@example.com', 'password123', 'client', '{"full_name": "Test Client"}'),
('provider@example.com', 'password123', 'provider', '{"full_name": "Test Provider", "category": "legal", "specialty": "Corporate Law"}');

-- Insert corresponding profiles
INSERT INTO client_profiles (user_id, name, email)
SELECT id, user_metadata->>'full_name', email FROM users WHERE user_type = 'client';

INSERT INTO provider_profiles (user_id, name, email, category, specialty, years_experience, rating)
SELECT 
  id, 
  user_metadata->>'full_name', 
  email, 
  user_metadata->>'category', 
  user_metadata->>'specialty', 
  5, 
  4.5
FROM users WHERE user_type = 'provider';
