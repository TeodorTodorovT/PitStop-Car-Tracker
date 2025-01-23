const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.[0]?.msg || 'An error occurred');
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (credentials) => 
    fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(res => res.json()),

  register: (userData) =>
    fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }).then(res => res.json()),

  getProfile: () => fetchWithAuth('/users/profile'),
};

// Cars API
export const carsApi = {
  getCars: () => fetchWithAuth('/cars'),
  
  getCar: (id) => fetchWithAuth(`/cars/${id}`),
  
  addCar: async (formData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/cars`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.msg || 'Failed to add car');
    }
    
    return response.json();
  },
  
  updateCar: (id, carData) => {
    const formData = new FormData();
    Object.entries(carData).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        if (key === 'image') {
          // Handle FileList from input[type="file"]
          if (value instanceof FileList && value.length > 0) {
            formData.append(key, value[0]);
          }
          // Handle File object
          else if (value instanceof File) {
            formData.append(key, value);
          }
          // Skip if no valid image
        } else {
          formData.append(key, value);
        }
      }
    });
    
    return fetchWithAuth(`/cars/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },
  
  deleteCar: (id) => 
    fetchWithAuth(`/cars/${id}`, {
      method: 'DELETE',
    }),
};

// Documents API
export const documentsApi = {
  // Get all documents for a car
  getDocuments: (carId) => fetchWithAuth(`/documents/car/${carId}`),
  
  // Get a single document
  getDocument: (id) => fetchWithAuth(`/documents/${id}`),
  
  // Add a new document
  addDocument: async (formData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.msg || 'Failed to add document');
    }
    
    return response.json();
  },
  
  // Update a document
  updateDocument: async (id, formData) => {
    return fetchWithAuth(`/documents/${id}`, {
      method: 'PUT',
      body: formData,
    });
  },
  
  // Delete a document
  deleteDocument: (id) => 
    fetchWithAuth(`/documents/${id}`, {
      method: 'DELETE',
    }),
}; 