import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

class UserApi {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle responses and errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('User API Error:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
        throw error;
      }
    );
  }

  // Get current user profile (simplified for header)
  async getCurrentUserProfile() {
    try {
      // First try the user profile endpoint
      const response = await this.api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.log('User profile endpoint failed, trying fallback...');
      
      // Fallback to localStorage if API fails
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (parseError) {
          console.error('Error parsing stored user:', parseError);
        }
      }
      
      // Minimal fallback user object
      return {
        userName: localStorage.getItem('username') || 'User',
        email: localStorage.getItem('userEmail') || '',
        role: 'USER'
      };
    }
  }

  // Update user profile (keep only if needed)
  async updateUserProfile(profileData) {
    try {
      const response = await this.api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}

// Create an instance and export it
const userApiInstance = new UserApi();
export default userApiInstance;