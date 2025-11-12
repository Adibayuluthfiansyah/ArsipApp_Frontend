import axios, { AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Response Type Backend
interface ApiResponse<T> {
    status: 'success' | 'error';
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
}

interface PaginatedApiResponse<T> {
    status: 'success' | 'error';
    message?: string;
    data: T[];
    pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    };
}

export const api = axios.create({
    baseURL: API_URL,
    headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    }
    }
    return config;
});

// Handle responses and errors
api.interceptors.response.use(
(response) => response,
    (error) => {
        if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        }
    }
    return Promise.reject(error);
    }
);

// Helper function to extract data from Backend response
function extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (response.data.status === 'error') {
    throw new Error(response.data.message || 'An error occurred');
    }
    return response.data.data as T;
}

function extractPaginatedData<T>(
    response: AxiosResponse<PaginatedApiResponse<T>>
    ): PaginatedApiResponse<T> {
    if (response.data.status === 'error') {
    throw new Error(response.data.message || 'An error occurred');
    }
    return response.data;
}

    

