
import { query } from '@/lib/database';

export interface Expert {
  id: string;
  name: string;
  specialty: string;
  category: string;
  rating: number;
  image: string;
}

export const searchExperts = async (
  searchTerm?: string,
  category?: string
): Promise<Expert[]> => {
  try {
    let sql = 'SELECT * FROM provider_profiles WHERE 1=1';
    const params: any[] = [];
    
    if (searchTerm) {
      sql += ' AND (name ILIKE $1 OR specialty ILIKE $1)';
      params.push(`%${searchTerm}%`);
    }
    
    if (category) {
      sql += ` AND category = $${params.length + 1}`;
      params.push(category);
    }
    
    const { rows } = await query(sql, params);
    
    return rows.map(expert => ({
      id: expert.id,
      name: expert.name,
      specialty: expert.specialty || '',
      category: expert.category,
      rating: expert.rating || 4.5, // Default rating if not available
      image: '/placeholder.svg', // Default image
    }));
  } catch (error) {
    console.error('Error searching experts:', error);
    return [];
  }
};

export const getRecommendedExperts = async (): Promise<Expert[]> => {
  try {
    const { rows } = await query(
      'SELECT * FROM provider_profiles ORDER BY rating DESC LIMIT 3'
    );
    
    return rows.map(expert => ({
      id: expert.id,
      name: expert.name,
      specialty: expert.specialty || '',
      category: expert.category,
      rating: expert.rating || 4.5,
      image: '/placeholder.svg',
    }));
  } catch (error) {
    console.error('Error fetching recommended experts:', error);
    return [];
  }
};
