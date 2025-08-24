import { fetchAuthSession } from 'aws-amplify/auth';

class FlaskService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_FLASK_SERVICE_URL || '/api/flask';
  }

  async getAuthHeaders() {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.accessToken?.toString();
      
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    } catch (error) {
      console.error('Error getting auth session:', error);
      throw new Error('Authentication required');
    }
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Flask service request error:', error);
      throw error;
    }
  }

  // Family Tree CRUD operations
  async getFamilyTrees() {
    return this.makeRequest('/family-trees');
  }

  async getFamilyTree(id) {
    return this.makeRequest(`/family-trees/${id}`);
  }

  async createFamilyTree(treeData) {
    return this.makeRequest('/family-trees', {
      method: 'POST',
      body: JSON.stringify(treeData),
    });
  }

  async updateFamilyTree(id, treeData) {
    return this.makeRequest(`/family-trees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(treeData),
    });
  }

  async deleteFamilyTree(id) {
    return this.makeRequest(`/family-trees/${id}`, {
      method: 'DELETE',
    });
  }

  // Add more methods for other endpoints as needed
}

export const flaskService = new FlaskService();
