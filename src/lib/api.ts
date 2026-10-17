/**
 * API Client for Django Backend
 */

import { clearAuthStorage } from '../store/useAuthStore';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const ACCESS_TOKEN_KEY = 'auth.access_token';

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

function getErrorMessage(errorData: any): string {
  if (!errorData) return 'Request failed';
  if (typeof errorData === 'string') return errorData;
  if (typeof errorData.detail === 'string') return errorData.detail;
  if (typeof errorData.message === 'string') return errorData.message;
  if (typeof errorData.error === 'string') return errorData.error;
  if (Array.isArray(errorData.non_field_errors) && errorData.non_field_errors[0]) {
    return String(errorData.non_field_errors[0]);
  }
  if (typeof errorData === 'object') {
    const firstField = Object.values(errorData).find((value) => value != null);
    if (Array.isArray(firstField) && firstField[0]) return String(firstField[0]);
    if (typeof firstField === 'string') return firstField;
  }
  return 'Request failed';
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    defaultHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      clearAuthStorage();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        getErrorMessage(errorData),
        errorData
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Network error', error);
  }
}

// Categories API
export const categoriesApi = {
  getAll: () => fetchApi<any[]>('/categories/'),
  
  getById: (id: string) => fetchApi<any>(`/categories/${id}/`),
  
  create: (data: any) =>
    fetchApi<any>('/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: any) =>
    fetchApi<any>(`/categories/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchApi<void>(`/categories/${id}/`, {
      method: 'DELETE',
    }),
};

// Suppliers API
export const suppliersApi = {
  getAll: () => fetchApi<any[]>('/suppliers/'),
  
  getById: (id: string) => fetchApi<any>(`/suppliers/${id}/`),
  
  create: (data: any) =>
    fetchApi<any>('/suppliers/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: any) =>
    fetchApi<any>(`/suppliers/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchApi<void>(`/suppliers/${id}/`, {
      method: 'DELETE',
    }),
};

// Services API
export const servicesApi = {
  getAll: () => fetchApi<any[]>('/services/'),
  getById: (id: string) => fetchApi<any>(`/services/${id}/`),
  create: (data: any) =>
    fetchApi<any>('/services/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchApi<any>(`/services/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi<void>(`/services/${id}/`, {
      method: 'DELETE',
    }),
};

// Medicines API
export const medicinesApi = {
  getAll: (params?: {
    search?: string;
    category_id?: string;
    supplier_id?: string;
    page?: number;
    page_size?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category_id) queryParams.append('category_id', params.category_id);
    if (params?.supplier_id) queryParams.append('supplier_id', params.supplier_id);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.page_size) queryParams.append('page_size', String(params.page_size));
    
    const queryString = queryParams.toString();
    return fetchApi<{ count: number; next: string | null; previous: string | null; results: any[] }>(`/medicines/${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id: string) => fetchApi<any>(`/medicines/${id}/`),
  getAllUnpaginated: () => fetchApi<any[]>(`/medicines/all/`),
  
  create: (data: any) =>
    fetchApi<any>('/medicines/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: any) =>
    fetchApi<any>(`/medicines/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) =>
    fetchApi<void>(`/medicines/${id}/`, {
      method: 'DELETE',
    }),
  
  getLowStock: () => fetchApi<any[]>('/medicines/low_stock/'),
  
  getExpiringSoon: () => fetchApi<any[]>('/medicines/expiring_soon/'),

  getStocks: (medicineId: string) => fetchApi<any[]>(`/medicines/${medicineId}/stocks/`),
};

// Stock Movements API
export const stockMovementsApi = {
  getAll: (params?: {
    medicine_id?: string;
    type?: 'entry' | 'exit';
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.medicine_id) queryParams.append('medicine_id', params.medicine_id);
    if (params?.type) queryParams.append('type', params.type);
    
    const queryString = queryParams.toString();
    return fetchApi<any[]>(`/stock-movements/${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id: string) => fetchApi<any>(`/stock-movements/${id}/`),
  
  create: (data: {
    medicine_id: string;
    type: 'entry' | 'exit';
    quantity: number;
    expiration_date: string;
    unit_price?: number;
    service_id?: string;
    location?: string;
    reference?: string;
    notes?: string;
  }) =>
    fetchApi<any>('/stock-movements/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Delivery Notes API
export const deliveryNotesApi = {
  list: async (params?: { search?: string; supplier_id?: string; status?: string }): Promise<any[]> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.supplier_id) queryParams.append('supplier_id', params.supplier_id);
    if (params?.status) queryParams.append('status', params.status);
    const queryString = queryParams.toString();
    const res = await fetchApi<any>(`/delivery-notes/${queryString ? `?${queryString}` : ''}`);
    // Normalize to array whether paginated or not
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
    return [];
  },

  getById: (id: string) => fetchApi<any>(`/delivery-notes/${id}/`),

  create: (data: {
    number?: string;
    date?: string;
    supplier_id: string;
    reference?: string;
    notes?: string;
    items: Array<{
      medicine_id: string;
      lot?: string;
      expiration_date?: string;
      quantity: number;
      unit_price: number;
    }>;
  }) =>
    fetchApi<any>('/delivery-notes/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{ date: string; supplier_id: string; reference: string; notes: string; items: any[] }>) =>
    fetchApi<any>(`/delivery-notes/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/delivery-notes/${id}/`, {
      method: 'DELETE',
    }),

  validate: (id: string) =>
    fetchApi<any>(`/delivery-notes/${id}/validate/`, {
      method: 'POST',
    }),
};

// Invoices API
export const invoicesApi = {
  getAll: async (params?: {
    search?: string;
    supplier_id?: string;
    status?: string;
    date_start?: string;
    date_end?: string;
  }): Promise<any[]> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.supplier_id) queryParams.append('supplier_id', params.supplier_id);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.date_start) queryParams.append('date_start', params.date_start);
    if (params?.date_end) queryParams.append('date_end', params.date_end);
    const queryString = queryParams.toString();
    const res = await fetchApi<any>(`/invoices/${queryString ? `?${queryString}` : ''}`);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.results)) return res.results;
    return [];
  },

  getById: (id: string) => fetchApi<any>(`/invoices/${id}/`),

  create: (data: any) =>
    fetchApi<any>('/invoices/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchApi<any>(`/invoices/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/invoices/${id}/`, {
      method: 'DELETE',
    }),

  validate: (id: string) =>
    fetchApi<any>(`/invoices/${id}/validate/`, {
      method: 'POST',
    }),
};

export { ApiError };
