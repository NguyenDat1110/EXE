import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadToCloudinary, uploadToCloudinaryFile, optimizeCloudinaryUrl } from '../cloudinary';

vi.mock('../supabase', () => ({
  uploadToSupabase: vi.fn(),
}));

const mockResponse = {
  public_id: 'test/public_id',
  url: 'http://res.cloudinary.com/test/image/upload/v1/test/file.jpg',
  secure_url: 'https://res.cloudinary.com/test/image/upload/v1/test/file.jpg',
  format: 'jpg',
  width: 300,
  height: 300,
  bytes: 12345,
  created_at: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
  vi.stubGlobal('import', undefined as any);
});

function mockFetchOk(data: unknown) {
  (globalThis.fetch as any).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function mockFetchFail(status: number) {
  (globalThis.fetch as any).mockResolvedValue({
    ok: false,
    status,
  });
}

import { uploadToSupabase } from '../supabase';

describe('uploadToCloudinaryFile', () => {
  it('throws when no file provided', async () => {
    await expect(uploadToCloudinaryFile(null as any)).rejects.toThrow('Vui lòng chọn một tệp hợp lệ');
  });

  it('throws when file exceeds max size', async () => {
    const bigFile = new File(['x'.repeat(6 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' });
    await expect(uploadToCloudinaryFile(bigFile)).rejects.toThrow('Kích thước tệp không được vượt quá');
  });

  it('throws when resourceType=image but file is not an image', async () => {
    const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    await expect(uploadToCloudinaryFile(pdfFile, undefined, 'image')).rejects.toThrow(
      'Vui lòng chọn định dạng ảnh hợp lệ'
    );
  });

  it('uploads an image file to Cloudinary image/upload', async () => {
    mockFetchOk(mockResponse);
    const imgFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const result = await uploadToCloudinaryFile(imgFile, 'eventflow/users');

    expect(result).toEqual(mockResponse);
    const fetchCall = (globalThis.fetch as any).mock.calls[0];
    expect(fetchCall[0]).toContain('/image/upload');
  });

  it('uploads a PDF file to Supabase instead of Cloudinary', async () => {
    (uploadToSupabase as any).mockResolvedValue({
      name: 'test.pdf',
      url: 'supabase://vendor-licenses/folder/test.pdf',
    });

    const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const result = await uploadToCloudinaryFile(pdfFile, 'eventflow/vendor-licenses');

    expect(uploadToSupabase).toHaveBeenCalledWith(pdfFile, 'vendor-licenses', 'eventflow/vendor-licenses');
    expect(result.secure_url).toBe('supabase://vendor-licenses/folder/test.pdf');
    expect(result.format).toBe('pdf');
  });

  it('throws when Cloudinary returns non-ok response', async () => {
    mockFetchFail(401);
    const imgFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    await expect(uploadToCloudinaryFile(imgFile)).rejects.toThrow('Lỗi tải lên tệp');
  });

  it('accepts PDFs in uploadToCloudinaryFile with no resourceType restriction', async () => {
    (uploadToSupabase as any).mockResolvedValue({
      name: 'test.pdf',
      url: 'supabase://vendor-licenses/test.pdf',
    });

    const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const result = await uploadToCloudinaryFile(pdfFile, 'eventflow/vendor-licenses', undefined, 20 * 1024 * 1024);
    expect(result.secure_url).toContain('supabase://');
  });
});

describe('uploadToCloudinary', () => {
  it('calls uploadToCloudinaryFile with resourceType=image', async () => {
    mockFetchOk(mockResponse);
    const imgFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    const result = await uploadToCloudinary(imgFile, 'eventflow/avatars');
    expect(result).toEqual(mockResponse);
  });

  it('throws for non-image files when using uploadToCloudinary', async () => {
    const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    await expect(uploadToCloudinary(pdfFile)).rejects.toThrow('Vui lòng chọn định dạng ảnh hợp lệ');
  });
});

describe('optimizeCloudinaryUrl', () => {
  it('returns empty string for falsy input', () => {
    expect(optimizeCloudinaryUrl('')).toBe('');
  });

  it('returns original URL if not a Cloudinary URL', () => {
    const url = 'https://example.com/image.jpg';
    expect(optimizeCloudinaryUrl(url)).toBe(url);
  });

  it('inserts transformation parameters for Cloudinary URLs', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v123/test.jpg';
    const result = optimizeCloudinaryUrl(url, 200, 200, 75);
    expect(result).toBe('https://res.cloudinary.com/demo/image/upload/w_200,h_200,q_75,c_fill/v123/test.jpg');
  });

  it('uses default parameters when not provided', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v123/test.jpg';
    const result = optimizeCloudinaryUrl(url);
    expect(result).toContain('w_400,h_400,q_80,c_fill');
  });

  it('handles Cloudinary URLs with raw/upload prefix', () => {
    const url = 'https://res.cloudinary.com/demo/raw/upload/v123/test.pdf';
    const result = optimizeCloudinaryUrl(url);
    expect(result).toBe('https://res.cloudinary.com/demo/raw/upload/w_400,h_400,q_80,c_fill/v123/test.pdf');
  });

  it('handles Cloudinary URLs with fl_attachment transformation', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/fl_attachment/v123/test.jpg';
    const result = optimizeCloudinaryUrl(url, 100, 100, 90);
    expect(result).toBe('https://res.cloudinary.com/demo/image/upload/w_100,h_100,q_90,c_fill/fl_attachment/v123/test.jpg');
  });
});
