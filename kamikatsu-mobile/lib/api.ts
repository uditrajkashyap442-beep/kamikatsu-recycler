import axios from 'axios';
import { Platform } from 'react-native';

// Use public cloud URL if defined in environment, else fallback to local network
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://kamikatsu-recycler.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export let searchCancelTokenSource = axios.CancelToken.source();

export const cancelPendingSearch = () => {
  searchCancelTokenSource.cancel('Operation canceled by user due to new typing.');
  searchCancelTokenSource = axios.CancelToken.source();
};

export interface ProductDto {
  id: number;
  name: string;
  description: string;
  classification: string;
  costStatus: string;
  kurukuruLocation: string;
  homeOnly: boolean;
  preparationSteps: string;
  imageUrl: string;
  category: CategoryDto;
  createdAt: string;
}

export interface CategoryDto {
  id: number;
  code: string;
  name: string;
  description: string;
  disposalMethod: string;
  imageUrl: string;
  mainType: MainTypeDto;
}

export interface MainTypeDto {
  id: number;
  name: string;
  iconName: string;
  colorHex: string;
}

export interface SearchResultDto {
  id: number | null;
  name: string;
  description: string;
  categoryName: string;
  mainTypeName: string;
  categoryCode: string | null;
}

export const searchProducts = async (query: string, useAi: boolean = false): Promise<SearchResultDto[]> => {
  try {
    const response = await api.get<SearchResultDto[]>('/search', {
      params: { q: query, useAi: useAi.toString() },
      cancelToken: searchCancelTokenSource.token,
    });
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

export const getProductById = async (id: number): Promise<ProductDto | null> => {
  try {
    const response = await api.get<ProductDto>(`/product/${id}`);
    return response.data;
  } catch (error) {
    console.error('Get product error:', error);
    return null;
  }
};

export const getProductByBarcode = async (barcode: string): Promise<ProductDto | null> => {
  try {
    const response = await api.get<ProductDto>(`/barcode/${barcode}`);
    return response.data;
  } catch (error) {
    console.error('Get barcode error:', error);
    return null;
  }
};

export const getCategoryByCode = async (code: string): Promise<CategoryDto | null> => {
  try {
    const response = await api.get<CategoryDto>(`/category/${code}`);
    return response.data;
  } catch (error) {
    console.error('Get category error:', error);
    return null;
  }
};

export const getProductsByCategoryCode = async (code: string): Promise<ProductDto[]> => {
  try {
    const response = await api.get<ProductDto[]>(`/category/${code}/products`);
    return response.data;
  } catch (error) {
    console.error('Get products by category code error:', error);
    return [];
  }
};

export const logQrScan = async (
  productId: number | null,
  categoryCode: string | null,
  sessionId: string,
  userId?: string
): Promise<boolean> => {
  try {
    await api.post('/qr-scan', null, {
      params: {
        productId: productId ?? undefined,
        categoryCode: categoryCode ?? undefined,
        sessionId,
        userId: userId ?? undefined,
      },
    });
    return true;
  } catch (error) {
    console.error('QR scan log error:', error);
    return false;
  }
};

export const registerUser = async (data: any) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const loginUser = async (data: any) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export default api;
