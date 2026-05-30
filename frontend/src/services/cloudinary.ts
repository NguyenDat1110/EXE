/**
 * Cloudinary Image Upload Service
 * UC-06: Upload avatar images to Cloudinary
 */

// Provide typing for Vite's import.meta.env to satisfy TypeScript
declare global {
  interface ImportMetaEnv {
    VITE_CLOUDINARY_CLOUD_NAME?: string;
    VITE_CLOUDINARY_UPLOAD_PRESET?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
export {};

export interface CloudinaryResponse {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

// Cloudinary configuration - should be set from environment
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset';
const CLOUDINARY_IMAGE_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

type CloudinaryResourceType = 'image' | 'raw' | 'auto';

/**
 * Upload image file to Cloudinary
 * @param file - Image file to upload
 * @param folder - Optional folder path in Cloudinary
 * @returns Promise with Cloudinary response containing image URL
 */
export const uploadToCloudinary = async (
  file: File,
  folder: string = 'eventflow/users'
): Promise<CloudinaryResponse> => {
  return uploadToCloudinaryFile(file, folder, 'image');
};

export const uploadToCloudinaryFile = async (
  file: File,
  folder: string = 'eventflow/users',
  resourceType: CloudinaryResourceType = 'auto'
): Promise<CloudinaryResponse> => {
  try {
    // Validate file
    if (!file) {
      throw new Error('Vui lòng chọn một tệp hợp lệ');
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Kích thước tệp không được vượt quá 5MB');
    }

    // Restrict image uploads only when using image mode
    if (resourceType === 'image') {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Vui lòng chọn định dạng ảnh hợp lệ (JPG, PNG, WebP, GIF)');
      }
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    formData.append('resource_type', resourceType);

    // Upload to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Lỗi tải lên hình ảnh. Vui lòng thử lại');
    }

    const data = await response.json() as CloudinaryResponse;
    return data;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Resize/optimize Cloudinary URL
 * @param url - Original Cloudinary URL
 * @param width - Width in pixels
 * @param height - Height in pixels
 * @param quality - Image quality (1-100)
 * @returns Optimized Cloudinary URL
 */
export const optimizeCloudinaryUrl = (
  url: string,
  width: number = 400,
  height: number = 400,
  quality: number = 80
): string => {
  if (!url) return '';

  // Check if it's a Cloudinary URL
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  // Replace /upload/ with /upload/w_{width},h_{height},q_{quality},c_fill/
  return url.replace(
    '/upload/',
    `/upload/w_${width},h_${height},q_${quality},c_fill/`
  );
};

/**
 * Delete image from Cloudinary (requires signed deletion token)
 * Not implemented for security reasons - should be done server-side
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  console.warn(
    'Image deletion should be performed server-side for security. Public ID:',
    publicId
  );
  // This should be implemented as a backend endpoint for security
};
