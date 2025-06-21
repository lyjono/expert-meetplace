import { supabase } from '@/lib/supabase';

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthly_appointments: number;
  monthly_storage_mb: number;
  monthly_chats: number;
}

export interface ProviderUsage {
  id: string;
  provider_id: string;
  month: number;
  year: number;
  appointments_used: number;
  storage_used_mb: number;
  chats_used: number;
  unique_chat_partners: string[];
}

/**
 * Fetches the provider's active subscription plan.
 * @param providerId UUID of the provider.
 * @returns The active subscription plan.
 * @throws Error if no plan can be assigned.
 */
export const getProviderSubscriptionPlan = async (providerId: string): Promise<SubscriptionPlan> => {
  try {
    const { data, error } = await supabase
      .from('provider_subscriptions')
      .select(`
        plan_id,
        status,
        subscription_plans!inner (
          id,
          name,
          monthly_appointments,
          monthly_storage_mb,
          monthly_chats
        )
      `)
      .eq('provider_id', providerId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error(`Error fetching subscription plan for provider ${providerId}:`, {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    if (!data || !data.subscription_plans) {
      console.warn(`No active subscription found for provider ${providerId}. Assigning Free plan.`);

      // Fetch Free plan
      const { data: freePlan, error: freePlanError } = await supabase
        .from('subscription_plans')
        .select('id, name, monthly_appointments, monthly_storage_mb, monthly_chats')
        .eq('name', 'Free')
        .single();

      if (freePlanError || !freePlan) {
        console.error(`Failed to fetch Free plan:`, freePlanError);
        throw new Error('No Free plan defined in subscription_plans');
      }

      // Assign Free plan to provider
      const { error: insertError } = await supabase
        .from('provider_subscriptions')
        .insert({
          id: crypto.randomUUID(),
          provider_id: providerId,
          plan_id: freePlan.id,
          status: 'active',
          starts_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error(`Failed to assign Free plan to provider ${providerId}:`, insertError);
        throw insertError;
      }

      console.log(`Assigned Free plan to provider ${providerId}`);
      return freePlan;
    }

    console.log(`Found active plan for provider ${providerId}: ${data.subscription_plans.name}`);
    return data.subscription_plans;
  } catch (error) {
    console.error('Error in getProviderSubscriptionPlan:', error);
    throw error;
  }
};

/**
 * Fetches or creates the provider's usage record for the current month.
 * @param providerId UUID of the provider.
 * @returns The provider's usage record.
 */
export const getOrCreateProviderUsage = async (providerId: string): Promise<ProviderUsage> => {
  const now = new Date();
  const month = now.getMonth() + 1; // JavaScript months are 0-based
  const year = now.getFullYear();

  try {
    // Try to fetch existing usage record
    let { data, error } = await supabase
      .from('provider_usage')
      .select('*')
      .eq('provider_id', providerId)
      .eq('month', month)
      .eq('year', year)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching provider usage for ${providerId}:`, error);
      throw error;
    }

    if (!data) {
      console.log(`Creating new usage record for provider ${providerId} for ${month}/${year}`);
      const { data: newData, error: insertError } = await supabase
        .from('provider_usage')
        .insert({
          provider_id: providerId,
          month,
          year,
          appointments_used: 0,
          storage_used_mb: 0,
          chats_used: 0,
          unique_chat_partners: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error(`Error creating provider usage for ${providerId}:`, insertError);
        throw insertError;
      }
      data = newData;
    }

    return data;
  } catch (error) {
    console.error('Error in getOrCreateProviderUsage:', error);
    throw error;
  }
};

/**
 * Checks if the provider can perform an action based on their subscription limits.
 * @param providerId UUID of the provider.
 * @param action Type of action ('appointment', 'storage', 'chat').
 * @param extra Optional extra data (e.g., storage size in MB, receiver ID for chat).
 * @returns True if allowed, throws an error if limit exceeded.
 */
export const checkProviderLimit = async (
  providerId: string,
  action: 'appointment' | 'storage' | 'chat',
  extra?: { storageSizeMb?: number; receiverId?: string }
): Promise<boolean> => {
  const plan = await getProviderSubscriptionPlan(providerId);
  const usage = await getOrCreateProviderUsage(providerId);
  console.log(`Checking limit for ${action} - Provider: ${providerId}, Plan: ${plan.name}, Usage:`, usage);

  switch (action) {
    case 'appointment': {
      if (usage.appointments_used >= plan.monthly_appointments) {
        console.error(`Appointment limit exceeded for provider ${providerId}: ${usage.appointments_used}/${plan.monthly_appointments}`);
        throw new Error('Monthly appointment limit reached');
      }
      return true;
    }
    case 'storage': {
      const sizeMb = Math.ceil(extra?.storageSizeMb || 0); // Round up to nearest integer
      console.log(`Storage check: Current ${usage.storage_used_mb} MB + New ${sizeMb} MB vs Limit ${plan.monthly_storage_mb} MB`);
      if (usage.storage_used_mb + sizeMb > plan.monthly_storage_mb) {
        console.error(`Storage limit exceeded for provider ${providerId}: ${usage.storage_used_mb + sizeMb}/${plan.monthly_storage_mb} MB`);
        throw new Error('Storage limit reached');
      }
      return true;
    }
    case 'chat': {
      if (usage.chats_used >= plan.monthly_chats) {
        console.error(`Chat limit exceeded for provider ${providerId}: ${usage.chats_used}/${plan.monthly_chats}`);
        throw new Error('Monthly chat limit exceeded');
      }
      if (extra?.receiverId) {
        const uniquePartners = new Set([...usage.unique_chat_partners, extra.receiverId]);
        if (uniquePartners.size > plan.monthly_chats) {
          console.error(`Unique chat partner limit exceeded for provider ${providerId}: ${uniquePartners.size}/${plan.monthly_chats}`);
          throw new Error('Unique chat partner limit exceeded');
        }
      }
      return true;
    }
    default:
      console.error(`Invalid action type: ${action}`);
      throw new Error('Invalid action type');
  }
};

/**
 * Updates provider usage after an action is performed.
 * @param providerId UUID of the provider.
 * @param action Type of action ('appointment', 'storage', 'chat').
 * @param extra Optional extra data (e.g., storage size in MB, receiver ID for chat).
 * @returns Boolean indicating success.
 */
export const updateProviderUsage = async (
  providerId: string,
  action: 'appointment' | 'storage' | 'chat',
  extra?: { storageSizeMb?: number; receiverId?: string }
): Promise<boolean> => {
  const usage = await getOrCreateProviderUsage(providerId);
  console.log(`Updating usage for ${action} - Provider: ${providerId}, Current Usage:`, usage);

  let updates: Partial<ProviderUsage> = {};

  try {
    switch (action) {
      case 'appointment':
        updates = {
          appointments_used: usage.appointments_used + 1,
          updated_at: new Date().toISOString(),
        };
        break;
      case 'storage':
        const sizeMb = Math.ceil(extra?.storageSizeMb || 0); // Round up to nearest integer
        updates = {
          storage_used_mb: usage.storage_used_mb + sizeMb,
          updated_at: new Date().toISOString(),
        };
        console.log(`Storage update: Adding ${sizeMb} MB to ${usage.storage_used_mb} MB`);
        break;
      case 'chat':
        updates = {
          chats_used: usage.chats_used + 1,
          unique_chat_partners: extra?.receiverId && !usage.unique_chat_partners.includes(extra.receiverId)
            ? [...usage.unique_chat_partners, extra.receiverId]
            : usage.unique_chat_partners,
          updated_at: new Date().toISOString(),
        };
        break;
      default:
        console.error(`Invalid action type: ${action}`);
        throw new Error('Invalid action type');
    }

    const { data, error } = await supabase
      .from('provider_usage')
      .update(updates)
      .eq('id', usage.id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating provider usage for ${providerId} - Action: ${action}:`, error);
      throw error;
    }

    console.log(`Updated provider usage for ${providerId} - Action: ${action}:`, data);
    return true;
  } catch (error) {
    console.error('Error in updateProviderUsage:', error);
    return false;
  }
};