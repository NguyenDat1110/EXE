import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../services/adminApi', () => ({
  getPendingVendors: vi.fn(),
  approveVendor: vi.fn(),
  rejectVendor: vi.fn(),
}));

vi.mock('../../../services/fileUrl', () => ({
  getDownloadUrl: vi.fn((url: string) => `/proxy?url=${encodeURIComponent(url)}`),
  getPreviewUrl: vi.fn((url: string) => `/proxy?url=${encodeURIComponent(url)}&preview=1`),
}));

import VerificationQueue from '../VerificationQueue';
import { getPendingVendors } from '../../../services/adminApi';

const baseVendor = {
  _id: 'v1',
  companyName: 'Công ty sân khấu VNC',
  email: 'test@vnc.com',
  businessLicense: [
    'https://res.cloudinary.com/djchnk9pz/image/upload/v1/eventflow/vendor-licenses/file1.pdf',
    'https://res.cloudinary.com/djchnk9pz/raw/upload/v1/eventflow/vendor-licenses/file2.jpg',
  ],
  businessLicenseNames: ['license1.pdf', 'license2.jpg'],
  companyAddress: '14/28 Song Hành, Quận 12, TP. Danang',
  phone: '0912345678',
  taxId: '199434554',
  verificationStatus: 'pending',
  createdAt: '2026-07-17T00:00:00.000Z',
};

const defaultApiResponse = {
  data: [baseVendor],
  pagination: { total: 1 },
};

const mockShowToast = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (getPendingVendors as any).mockResolvedValue(defaultApiResponse);
});

describe('VerificationQueue', () => {
  it('renders vendor cards with business license links', async () => {
    render(<VerificationQueue showToast={mockShowToast} />);

    expect(await screen.findByText('Công ty sân khấu VNC')).toBeInTheDocument();
    expect(screen.getByText('license1.pdf')).toBeInTheDocument();
    expect(screen.getByText('license2.jpg')).toBeInTheDocument();
  });

  it('shows preview and download proxy URLs for business license files', async () => {
    render(<VerificationQueue showToast={mockShowToast} />);

    expect(await screen.findByText('license1.pdf')).toBeInTheDocument();

    const previewLinks = screen.getAllByText('Xem');
    expect(previewLinks[0]).toHaveAttribute('href', '/proxy?url=https%3A%2F%2Fres.cloudinary.com%2Fdjchnk9pz%2Fimage%2Fupload%2Fv1%2Feventflow%2Fvendor-licenses%2Ffile1.pdf&preview=1');
    expect(previewLinks[0]).toHaveAttribute('target', '_blank');

    const downloadLinks = screen.getAllByText('Tải');
    expect(downloadLinks[0]).toHaveAttribute('href', '/proxy?url=https%3A%2F%2Fres.cloudinary.com%2Fdjchnk9pz%2Fimage%2Fupload%2Fv1%2Feventflow%2Fvendor-licenses%2Ffile1.pdf');
  });

  it('opens preview links in new tabs', async () => {
    render(<VerificationQueue showToast={mockShowToast} />);

    expect(await screen.findByText('license1.pdf')).toBeInTheDocument();

    const previewLinks = screen.getAllByText('Xem');
    expect(previewLinks[0]).toHaveAttribute('target', '_blank');
    expect(previewLinks[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('displays business info fields', async () => {
    render(<VerificationQueue showToast={mockShowToast} />);

    expect(await screen.findByText('Công ty sân khấu VNC')).toBeInTheDocument();
    expect(screen.getByText(/199434554/)).toBeInTheDocument();
    expect(screen.getByText(/14\/28 Song Hành/)).toBeInTheDocument();
  });

  it('shows "Xem Hồ Sơ" button and opens detail modal', async () => {
    const user = userEvent.setup();
    render(<VerificationQueue showToast={mockShowToast} />);

    expect(await screen.findByText('Công ty sân khấu VNC')).toBeInTheDocument();

    const detailBtn = screen.getByText('Xem Hồ Sơ');
    await user.click(detailBtn);

    expect(await screen.findByText('Thông tin công ty')).not.toBeNull();
  });

  it('handles empty license list gracefully', async () => {
    const emptyLicenseVendor = { ...baseVendor, businessLicense: [], businessLicenseNames: [] };
    (getPendingVendors as any).mockResolvedValue({ data: [emptyLicenseVendor], pagination: { total: 1 } });

    render(<VerificationQueue showToast={mockShowToast} />);
    expect(await screen.findByText('Công ty sân khấu VNC')).toBeInTheDocument();
    expect(screen.queryByText('license1.pdf')).not.toBeInTheDocument();
  });

  it('shows default fallback names when license names are missing (multiple files)', async () => {
    const noNamesVendor = { ...baseVendor, businessLicenseNames: undefined };
    (getPendingVendors as any).mockResolvedValue({ data: [noNamesVendor], pagination: { total: 1 } });

    render(<VerificationQueue showToast={mockShowToast} />);
    expect(await screen.findByText('Giấy phép 1')).toBeInTheDocument();
    expect(screen.getByText('Giấy phép 2')).toBeInTheDocument();
  });

  it('shows "Giấy phép kinh doanh" for single file without name', async () => {
    const singleVendor = { ...baseVendor, businessLicense: [baseVendor.businessLicense[0]], businessLicenseNames: undefined };
    (getPendingVendors as any).mockResolvedValue({ data: [singleVendor], pagination: { total: 1 } });

    render(<VerificationQueue showToast={mockShowToast} />);
    expect(await screen.findByText('Giấy phép kinh doanh')).toBeInTheDocument();
  });
});
