import axios from 'axios';

// Change this to your computer's LAN IP for real device
// Find it with: ipconfig (Windows) or ifconfig (Mac/Linux)
// Example: http://192.168.1.100:8080/api
const API_BASE = 'http://192.168.1.94:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

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

export const searchProducts = async (query: string): Promise<SearchResultDto[]> => {
  try {
    const response = await api.get<SearchResultDto[]>('/search', {
      params: { q: query },
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
  sessionId: string
): Promise<boolean> => {
  try {
    await api.post('/qr-scan', null, {
      params: {
        productId: productId ?? undefined,
        categoryCode: categoryCode ?? undefined,
        sessionId,
      },
    });
    return true;
  } catch (error) {
    console.error('QR scan log error:', error);
    return false;
  }
};

export default api;
