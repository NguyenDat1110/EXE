import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../services/cloudinary', () => ({
  uploadToCloudinary: vi.fn(),
  uploadToCloudinaryFile: vi.fn(),
  optimizeCloudinaryUrl: vi.fn((url: string) => url),
}));

vi.mock('../../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams()],
}));

import { VendorSubmissionForm } from '../VendorSubmissionForm';
import { useAuthStore } from '../../../store/authStore';
import { uploadToCloudinaryFile, optimizeCloudinaryUrl } from '../../../services/cloudinary';
import api from '../../../services/api';

const vendorUser = { _id: 'vendor1', role: 'vendor', name: 'Test Vendor', email: 'vendor@test.com', phone: '0912345678' };

beforeEach(() => {
  vi.clearAllMocks();
  (useAuthStore as any).mockReturnValue({ user: vendorUser });
  (api.get as any).mockRejectedValue(new Error('No data'));
  (api.post as any).mockResolvedValue({ data: { message: 'Success' } });
});

describe('VendorSubmissionForm', () => {
  it('redirects non-vendor users', () => {
    (useAuthStore as any).mockReturnValue({ user: { _id: 'user1', role: 'customer' } });
    render(<VendorSubmissionForm />);
    expect(screen.getByText('Chỉ vendor mới có thể truy cập trang này')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    (api.get as any).mockImplementation(() => new Promise(() => {}));
    render(<VendorSubmissionForm />);
    expect(screen.getByText('Đang tải thông tin...')).toBeInTheDocument();
  });

  it('renders the form for vendor users', async () => {
    render(<VendorSubmissionForm />);
    expect(await screen.findByText('Hoàn Thành Hồ Sơ Doanh Nghiệp')).toBeInTheDocument();
  });

  it('displays required fields', async () => {
    render(<VendorSubmissionForm />);
    expect(await screen.findByText('Tên Công Ty *')).toBeInTheDocument();
    expect(await screen.findByText('Mã Số Thuế *')).toBeInTheDocument();
    expect(await screen.findByText('Địa Chỉ Công Ty *')).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<VendorSubmissionForm />);

    expect(await screen.findByText('Hoàn Thành Hồ Sơ Doanh Nghiệp')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /gửi/i });
    await user.click(submitBtn);

    expect(await screen.findByText('Tên công ty là bắt buộc.')).toBeInTheDocument();
    expect(await screen.findByText('Mã số thuế là bắt buộc.')).toBeInTheDocument();
    expect(await screen.findByText('Địa chỉ công ty là bắt buộc.')).toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    const user = userEvent.setup();
    render(<VendorSubmissionForm />);

    expect(await screen.findByText('Hoàn Thành Hồ Sơ Doanh Nghiệp')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Tên Công Ty/i), 'Công ty ABC');
    await user.type(screen.getByLabelText(/Mã Số Thuế/i), '1234567890');
    await user.type(screen.getByLabelText(/Địa Chỉ Công Ty/i), '123 Đường ABC');
    await user.type(await screen.findByLabelText(/Tên Chủ Tài Khoản/i), 'Nguyễn Văn A');
    await user.type(await screen.findByLabelText(/Số Tài Khoản/i), '123456789');
    await user.type(await screen.findByLabelText(/Tên Ngân Hàng/i), 'Vietcombank');

    const submitBtn = screen.getByRole('button', { name: /gửi/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/vendor/submit-info', expect.any(Object));
    });
  });

  it('displays business license upload section', async () => {
    render(<VendorSubmissionForm />);
    expect(await screen.findByText('Giấy Phép Kinh Doanh *')).toBeInTheDocument();
  });

  it('shows uploaded license files after upload', async () => {
    const fileUrl = 'https://res.cloudinary.com/test/raw/upload/v1/test/license.pdf';
    (uploadToCloudinaryFile as any).mockResolvedValue({ secure_url: fileUrl });
    (optimizeCloudinaryUrl as any).mockImplementation((url: string) => url);

    const user = userEvent.setup();
    const { container } = render(<VendorSubmissionForm />);

    expect(await screen.findByText('Giấy Phép Kinh Doanh *')).toBeInTheDocument();

    const fileInput = container.querySelector('input[type="file"][accept*="pdf"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();
    const pdfFile = new File(['content'], 'license.pdf', { type: 'application/pdf' });
    await user.upload(fileInput, pdfFile);

    expect(await screen.findByText('license.pdf')).toBeInTheDocument();
  });

  it('handles upload error gracefully', async () => {
    (uploadToCloudinaryFile as any).mockRejectedValue(new Error('Lỗi Cloudinary'));

    const user = userEvent.setup();
    const { container } = render(<VendorSubmissionForm />);

    expect(await screen.findByText('Giấy Phép Kinh Doanh *')).toBeInTheDocument();

    const fileInput = container.querySelector('input[type="file"][accept*="pdf"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();
    const pdfFile = new File(['content'], 'bad.pdf', { type: 'application/pdf' });
    await user.upload(fileInput, pdfFile);

    expect(await screen.findByText('Lỗi Cloudinary')).toBeInTheDocument();
  });

  it('pre-fills form fields from existing vendor data', async () => {
    (api.get as any).mockResolvedValue({
      data: {
        vendor: {
          companyName: 'Công ty cũ',
          taxId: '987654321',
          companyAddress: '456 Đường XYZ',
          phone: '0987654321',
          email: 'old@test.com',
          website: 'https://old.com',
          bio: 'Công ty cũ',
          accountHolderName: 'Trần Văn B',
          accountNumber: '987654321',
          bankName: 'Techcombank',
          businessLicense: ['https://res.cloudinary.com/test/raw/upload/v1/old/license.pdf'],
          businessLicenseNames: ['old_license.pdf'],
          avatar: 'https://res.cloudinary.com/test/image/upload/v1/old/avatar.jpg',
          verificationStatus: 'pending',
        },
      },
    });

    render(<VendorSubmissionForm />);
    const companyInput = (await screen.findByLabelText(/Tên Công Ty/i)) as HTMLInputElement;
    expect(companyInput.value).toBe('Công ty cũ');
  });

  it('displays delete button for license files in non-view mode', async () => {
    (uploadToCloudinaryFile as any).mockResolvedValue({
      secure_url: 'https://res.cloudinary.com/test/raw/upload/v1/test/to-delete.pdf',
    });

    const user = userEvent.setup();
    const { container } = render(<VendorSubmissionForm />);

    expect(await screen.findByText('Giấy Phép Kinh Doanh *')).toBeInTheDocument();

    const fileInput = container.querySelector('input[type="file"][accept*="pdf"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();
    await user.upload(fileInput, new File(['content'], 'to-delete.pdf', { type: 'application/pdf' }));

    expect(await screen.findByText('to-delete.pdf')).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', { name: /xóa/i });
    expect(deleteBtn).toBeInTheDocument();

    await user.click(deleteBtn);
    await waitFor(() => {
      expect(screen.queryByText('to-delete.pdf')).not.toBeInTheDocument();
    });
  });
});
