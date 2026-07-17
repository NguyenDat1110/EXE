const backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

function proxyUrl(url: string, preview: boolean): string {
  const params = new URLSearchParams({ url });
  if (preview) params.set('preview', '1');
  return `${backendUrl}/api/files/download?${params}`;
}

export const getDownloadUrl = (url: string): string => {
  if (!url) return url;

  if (url.startsWith('supabase://')) return proxyUrl(url, false);
  if (!url.includes('cloudinary.com')) return url;
  if (url.includes('/raw/upload/')) return proxyUrl(url, false);

  return url;
};

export const getPreviewUrl = (url: string): string => {
  if (!url) return url;

  if (url.startsWith('supabase://')) return proxyUrl(url, true);
  if (!url.includes('cloudinary.com')) return url;
  if (url.includes('/raw/upload/')) return proxyUrl(url, true);

  return url;
};
