import api from './index';

export interface UploadResponse {
  success: boolean;
  url: string;
  fileName?: string;
  message: string;
}

export const uploadImage = async (file: File, folder: string = 'images'): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await api.post<UploadResponse>('/oss/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const deleteFile = async (fileName: string) => {
  const response = await api.delete('/oss/delete', {
    data: { fileName }
  });
  return response.data;
};
