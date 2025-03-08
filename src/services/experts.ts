
export const searchExperts = async (
  searchTerm?: string,
  category?: string
): Promise<Expert[]> => {
  try {
    let query = supabase
      .from('provider_profiles')
      .select('*');

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,specialty.ilike.%${searchTerm}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(expert => ({
      id: expert.id,
      name: expert.name,
      specialty: expert.specialty || '',
      category: expert.category,
      rating: expert.rating || 4.5, // Default rating if not available
      image: expert.image_url || '/placeholder.svg', // Default image
      years_experience: expert.years_experience || null,
    }));
  } catch (error) {
    console.error('Error searching experts:', error);
    return [];
  }
};

export const getRecommendedExperts = async (): Promise<Expert[]> => {
  try {
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .order('rating', { ascending: false })
      .limit(3);

    if (error) throw error;

    return data.map(expert => ({
      id: expert.id,
      name: expert.name,
      specialty: expert.specialty || '',
      category: expert.category,
      rating: expert.rating || 4.5,
      image: expert.image_url || '/placeholder.svg',
      years_experience: expert.years_experience || null,
    }));
  } catch (error) {
    console.error('Error fetching recommended experts:', error);
    return [];
  }
};
