import { describe, it, expect } from 'vitest';
import { getDownloadUrl, getPreviewUrl } from '../fileUrl';

describe('getDownloadUrl', () => {
  it('returns the same URL if not a Cloudinary or Supabase URL', () => {
    const url = 'https://example.com/file.pdf';
    expect(getDownloadUrl(url)).toBe(url);
  });

  it('returns the same URL if empty string', () => {
    expect(getDownloadUrl('')).toBe('');
  });

  it('returns the same URL if null', () => {
    expect(getDownloadUrl(null as any)).toBe(null as any);
  });

  it('returns the same URL if undefined', () => {
    expect(getDownloadUrl(undefined as any)).toBe(undefined as any);
  });

  it('wraps a supabase:// URL with the backend download proxy', () => {
    const supabaseUrl = 'supabase://vendor-licenses/folder/test.pdf';
    const result = getDownloadUrl(supabaseUrl);
    expect(result).toBe(
      'http://localhost:5000/api/files/download?url=supabase%3A%2F%2Fvendor-licenses%2Ffolder%2Ftest.pdf'
    );
  });

  it('returns the same image/upload URL directly (no proxy for image/upload)', () => {
    const cloudUrl = 'https://res.cloudinary.com/demo/image/upload/v123/test.pdf';
    const result = getDownloadUrl(cloudUrl);
    expect(result).toBe(cloudUrl);
  });

  it('wraps a Cloudinary raw/upload URL with the backend download proxy', () => {
    const cloudUrl = 'https://res.cloudinary.com/demo/raw/upload/v123/license.pdf';
    const result = getDownloadUrl(cloudUrl);
    expect(result).toBe(
      'http://localhost:5000/api/files/download?url=https%3A%2F%2Fres.cloudinary.com%2Fdemo%2Fraw%2Fupload%2Fv123%2Flicense.pdf'
    );
  });

  it('handles image/upload URLs with special characters (returns directly)', () => {
    const cloudUrl = 'https://res.cloudinary.com/demo/image/upload/v123/file name.pdf';
    const result = getDownloadUrl(cloudUrl);
    expect(result).toBe(cloudUrl);
  });

  it('handles raw/upload URLs with special characters via proxy', () => {
    const cloudUrl = 'https://res.cloudinary.com/demo/raw/upload/v123/file name.pdf';
    const result = getDownloadUrl(cloudUrl);
    expect(result).toContain('/api/files/download?url=');
    expect(result).toContain('file+name.pdf');
  });
});

describe('getPreviewUrl', () => {
  it('returns the same URL if not a Cloudinary or Supabase URL', () => {
    const url = 'https://example.com/file.pdf';
    expect(getPreviewUrl(url)).toBe(url);
  });

  it('returns empty string for falsy input', () => {
    expect(getPreviewUrl('')).toBe('');
  });

  it('wraps a supabase:// URL with preview=1', () => {
    const supabaseUrl = 'supabase://vendor-licenses/folder/test.pdf';
    const result = getPreviewUrl(supabaseUrl);
    expect(result).toBe(
      'http://localhost:5000/api/files/download?url=supabase%3A%2F%2Fvendor-licenses%2Ffolder%2Ftest.pdf&preview=1'
    );
  });

  it('returns image/upload URLs directly (no proxy)', () => {
    const cloudUrl = 'https://res.cloudinary.com/demo/image/upload/v123/test.pdf';
    expect(getPreviewUrl(cloudUrl)).toBe(cloudUrl);
  });

  it('wraps a raw/upload URL with preview=1', () => {
    const cloudUrl = 'https://res.cloudinary.com/demo/raw/upload/v123/license.pdf';
    const result = getPreviewUrl(cloudUrl);
    expect(result).toContain('/api/files/download?url=');
    expect(result).toContain('&preview=1');
  });
});
