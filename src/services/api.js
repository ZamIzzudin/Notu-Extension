const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getTokens = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  return { accessToken, refreshToken };
};

const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

class ApiService {
  async request(endpoint, options = {}, retry = true) {
    const url = `${API_BASE_URL}${endpoint}`;
    const { accessToken } = getTokens();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401 && retry) {
        const data = await response.json();
        
        if (data.code === 'TOKEN_EXPIRED') {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            return this.request(endpoint, options, false);
          }
        }
        
        clearTokens();
        window.dispatchEvent(new Event('auth-logout'));
        throw new Error('Session expired. Please login again.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async refreshToken() {
    const { refreshToken } = getTokens();
    
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        clearTokens();
        return false;
      }

      const data = await response.json();
      setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch (error) {
      console.error('Refresh token error:', error);
      clearTokens();
      return false;
    }
  }

  // Auth
  async register(name, email, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }, false);
    
    setTokens(data.accessToken, data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);
    
    setTokens(data.accessToken, data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
    }
  }

  async getMe() {
    return this.request('/auth/me');
  }

  isAuthenticated() {
    const { accessToken } = getTokens();
    return !!accessToken;
  }

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Notes
  async getNotes() {
    return this.request('/notes');
  }

  async getNote(id) {
    return this.request(`/notes/${id}`);
  }

  async createNote(noteData) {
    return this.request('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async updateNote(id, noteData) {
    return this.request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteNote(id) {
    return this.request(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadImage(base64Image) {
    return this.request('/notes/upload', {
      method: 'POST',
      body: JSON.stringify({ image: base64Image }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
