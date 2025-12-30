import { auth } from '../firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Organization {
  id: string;
  name: string;
  role: 'ADMIN' | 'EMPLOYEE';
  code?: string;
}

export const orgApi = {
  create: async (name: string): Promise<Organization> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_URL}/organizations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    
    if (!response.ok) throw new Error('Failed to create organization');
    return response.json();
  },

  join: async (code: string): Promise<Organization> => {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_URL}/organizations/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
       const err = await response.json();
       throw new Error(err.detail || 'Failed to join organization');
    }
    return response.json();
  },

  list: async (): Promise<Organization[]> => {
    const token = await auth.currentUser?.getIdToken();
    // Return empty list if no user (should rely on auth context but for safety)
    if (!auth.currentUser) return [];

    const response = await fetch(`${API_URL}/organizations/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch organizations');
    return response.json();
  },
};
