import apiClient from './client';

export const getFile = async (category: string, filename: string): Promise<Blob> => {
  const response = await apiClient.get(`/files/${category}/${filename}`, {
    responseType: 'blob'
  });
  return response.data;
}

export const getFileUrl = (category: string, filename: string): string => {
  return `${apiClient.defaults.baseURL}/files/${category}/${filename}`;
}
