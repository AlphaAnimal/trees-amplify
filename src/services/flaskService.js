import { fetchAuthSession } from 'aws-amplify/auth';

class FlaskService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_FLASK_SERVICE_URL;
    this.partitionKey =
      typeof window !== 'undefined' ? window.localStorage.getItem('partition_key') : null;
  }

  setPartitionKey(partitionKey) {
    this.partitionKey = partitionKey;
    if (typeof window !== 'undefined') {
      if (partitionKey) {
        window.localStorage.setItem('partition_key', partitionKey);
      } else {
        window.localStorage.removeItem('partition_key');
      }
    }
  }

  async getAuthHeaders() {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
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
      const partitionKey = options.partitionKey || this.partitionKey;
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...(partitionKey ? { 'X-Partition-Key': partitionKey } : {}),
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
