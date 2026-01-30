// utils/api.ts
const API_BASE_URL = 'http://localhost/VisioAD/Backend/api';

export const fetchAdminStats = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin.php?action=stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Erreur API');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur fetchAdminStats:', error);
    throw error;
  }
};

export const fetchRecentUsers = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin.php?action=recent-users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Erreur API');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur fetchRecentUsers:', error);
    throw error;
  }
};