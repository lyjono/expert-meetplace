
import { Pool } from 'pg';

// Create connection pool using Replit Postgres credentials
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper to execute SQL queries
export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
};

// Simple in-memory user cache for the demo
// In production, you would use sessions/JWT
const userCache = new Map();

// Auth helpers
export const getCurrentUser = async () => {
  // This is a simplified auth approach
  // You would typically use sessions or JWT in a real app
  const userId = localStorage.getItem('userId');
  if (!userId) return null;
  
  if (userCache.has(userId)) {
    return userCache.get(userId);
  }
  
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length > 0) {
      userCache.set(userId, result.rows[0]);
      return result.rows[0];
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getUserType = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  return user.user_type || 'client';
};

// Auth methods
export const signInWithPassword = async (email: string, password: string) => {
  try {
    // In a real app, you'd use bcrypt to hash and compare passwords
    const result = await query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userType', user.user_type || 'client');
      
      return { user, error: null };
    }
    
    return { user: null, error: { message: 'Invalid login credentials' } };
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, error: { message: 'Database error during login' } };
  }
};

export const signUp = async (email: string, password: string, userData: any) => {
  try {
    // Check if user already exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return { user: null, error: { message: 'User already exists' } };
    }
    
    // Insert new user
    const result = await query(
      'INSERT INTO users (email, password, user_type, user_metadata) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, password, userData.user_type, userData]
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      // Store additional profile data
      if (userData.user_type === 'provider') {
        await query(
          'INSERT INTO provider_profiles (user_id, name, email, category, specialty, years_experience) VALUES ($1, $2, $3, $4, $5, $6)',
          [user.id, userData.full_name, email, userData.category, userData.specialty, userData.years_experience || 0]
        );
      } else {
        await query(
          'INSERT INTO client_profiles (user_id, name, email) VALUES ($1, $2, $3)',
          [user.id, userData.full_name, email]
        );
      }
      
      return { user, error: null };
    }
    
    return { user: null, error: { message: 'Failed to create user' } };
  } catch (error) {
    console.error('Registration error:', error);
    return { user: null, error: { message: 'Database error during registration' } };
  }
};

export const signOut = async () => {
  localStorage.removeItem('userId');
  localStorage.removeItem('userType');
  return { error: null };
};
