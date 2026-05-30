import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Edit2, Eye, EyeOff, Plus, Store, Trash2, X } from 'lucide-react';
import {
  createBooth,
  deleteBooth,
  getBooths,
  toggleBooth,
  updateBooth
} from '../../services/boothsApi';
import {
  createPackage,
  deletePackage,
  getMyPackages,
  togglePackage,
  updatePackage
} from '../../services/packagesApi';
import { uploadToCloudinary, uploadToCloudinaryFile } from '../../services/cloudinary';
import api from '../../services/api';

type BoothEventType = 'TIỆC CƯỚI' | 'HỘI THẢO' | 'SINH NHẬT' | 'KỈ NIỆM';

type Booth = {
  _id: string;
  name: string;
  eventType: BoothEventType;
  description: string;
  isActive: boolean;
};

type ServicePackage = {
  _id: string;
  boothId: string;
  name: string;
  description: string;
  price: number;
  includedServices: string[];
  minParticipants: number;
  maxParticipants: number;
  depositAmount: number;
  serviceDuration: string;
  images?: string[];
  model3dUrl?: string;
  isActive: boolean;
};

type BoothForm = {
  name: string;
  eventType: BoothEventType;
  description: string;
};

type PackageForm = {
  name: string;
  price: string;
  description: string;
  includedServices: string[];
  minParticipants: string;
  maxParticipants: string;
  depositAmount: string;
  serviceDuration: string;
  images: string[];
  model3dUrl: string;
};

type ConfirmDeleteState = {
  open: boolean;
  type: 'booth' | 'package';
  id: string;
  boothId?: string;
  title: string;
  message: string;
};

const EVENT_TYPES: BoothEventType[] = ['TIỆC CƯỚI', 'HỘI THẢO', 'SINH NHẬT', 'KỈ NIỆM'];

const defaultBoothForm: BoothForm = {
  name: '',
  eventType: 'TIỆC CƯỚI',
  description: ''
};

const defaultPackageForm: PackageForm = {
  name: '',
  price: '',
  description: '',
  includedServices: [''],
  minParticipants: '',
  maxParticipants: '',
  depositAmount: '',
  serviceDuration: '',
  images: [],
  model3dUrl: ''
};

const normalizeMoneyInput = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('vi-VN');
};

const parseMoneyInput = (value: string): number => {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
};

const MAX_PACKAGE_IMAGES = 10;

export default function PackageManager({ showToast }: { showToast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [selectedBoothId, setSelectedBoothId] = useState<string>('');
  const [packagesByBooth, setPackagesByBooth] = useState<Record<string, ServicePackage[]>>({});

  const [boothModalOpen, setBoothModalOpen] = useState(false);
  const [editingBooth, setEditingBooth] = useState<Booth | null>(null);
  const [boothForm, setBoothForm] = useState<BoothForm>(defaultBoothForm);

  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [packageForm, setPackageForm] = useState<PackageForm>(defaultPackageForm);

  const [loadingBooths, setLoadingBooths] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [packageErrors, setPackageErrors] = useState<Partial<Record<keyof PackageForm, string>>>({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [vendorPlan, setVendorPlan] = useState<'basic' | 'vip' | null>(null);
  const [preview3D, setPreview3D] = useState<{ open: boolean; url: string; name: string }>({
    open: false,
    url: '',
    name: ''
  });
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>({
    open: false,
    type: 'booth',
    id: '',
    title: '',
    message: ''
  });

  const selectedBooth = useMemo(
    () => booths.find((b) => b._id === selectedBoothId) || null,
    [booths, selectedBoothId]
  );

  const selectedPackages = selectedBoothId ? packagesByBooth[selectedBoothId] || [] : [];

  const loadBooths = async () => {
    try {
      setLoadingBooths(true);
      const res = await getBooths();
      const data: Booth[] = res?.data || [];
      setBooths(data);

      if (data.length > 0) {
        setSelectedBoothId((prev) => prev || data[0]._id);
      } else {
        setSelectedBoothId('');
      }
    } catch (error) {
      console.error('Get booths error', error);
      showToast('Không tải được danh sách gian hàng', 'error');
    } finally {
      setLoadingBooths(false);
    }
  };

  const loadVendorPlan = async () => {
    try {
      const res = await api.get('/vendor/info');
      setVendorPlan((res?.data?.vendor?.subscriptionPlan as 'basic' | 'vip' | undefined) || null);
    } catch (error) {
      console.error('Get vendor info error', error);
      setVendorPlan(null);
    }
  };

  const loadPackages = async (boothId: string) => {
    if (!boothId) return;

    try {
      setLoadingPackages(true);
      const res = await getMyPackages(boothId);
      setPackagesByBooth((prev) => ({ ...prev, [boothId]: res?.data || [] }));
    } catch (error) {
      console.error('Get packages error', error);
      showToast('Không tải được danh sách dịch vụ', 'error');
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    loadBooths();
    loadVendorPlan();
  }, []);

  useEffect(() => {
    if (selectedBoothId) {
      loadPackages(selectedBoothId);
    }
  }, [selectedBoothId]);

  const openCreateBooth = () => {
    setEditingBooth(null);
    setBoothForm(defaultBoothForm);
    setBoothModalOpen(true);
  };

  const openEditBooth = (booth: Booth) => {
    setEditingBooth(booth);
    setBoothForm({
      name: booth.name,
      eventType: booth.eventType,
      description: booth.description || ''
    });
    setBoothModalOpen(true);
  };

  const closeBoothModal = () => {
    setBoothModalOpen(false);
    setEditingBooth(null);
    setBoothForm(defaultBoothForm);
  };

  const submitBooth = async () => {
    if (!boothForm.name.trim()) {
      showToast('Vui lòng nhập tên gian hàng', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: boothForm.name.trim(),
        eventType: boothForm.eventType,
        description: boothForm.description.trim()
      };

      if (editingBooth) {
        const res = await updateBooth(editingBooth._id, payload);
        setBooths((prev) => prev.map((b) => (b._id === editingBooth._id ? res.booth : b)));
        showToast('Đã cập nhật gian hàng', 'success');
      } else {
        const res = await createBooth(payload);
        setBooths((prev) => [res.booth, ...prev]);
        setSelectedBoothId(res.booth._id);
        showToast('Đã tạo gian hàng mới', 'success');
      }

      closeBoothModal();
    } catch (error) {
      console.error('Save booth error', error);
      showToast('Lưu gian hàng thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const onToggleBooth = async (booth: Booth) => {
    try {
      const res = await toggleBooth(booth._id);
      setBooths((prev) => prev.map((b) => (b._id === booth._id ? res.booth : b)));
      showToast('Đã cập nhật trạng thái gian hàng', 'success');
    } catch (error) {
      console.error('Toggle booth error', error);
      showToast('Không thể đổi trạng thái gian hàng', 'error');
    }
  };

  const onDeleteBooth = async (booth: Booth) => {
    try {
      await deleteBooth(booth._id);
      const next = booths.filter((b) => b._id !== booth._id);
      setBooths(next);
      setPackagesByBooth((prev) => {
        const clone = { ...prev };
        delete clone[booth._id];
        return clone;
      });

      if (selectedBoothId === booth._id) {
        setSelectedBoothId(next[0]?._id || '');
      }

      showToast('Đã xóa gian hàng', 'success');
    } catch (error) {
      console.error('Delete booth error', error);
      showToast('Xóa gian hàng thất bại', 'error');
    }
  };

  const requestDeleteBooth = (booth: Booth) => {
    setConfirmDelete({
      open: true,
      type: 'booth',
      id: booth._id,
      title: 'Xóa gian hàng?',
      message: `Gian hàng "${booth.name}" và toàn bộ package bên trong sẽ bị xóa vĩnh viễn.`
    });
  };

  const openCreatePackage = (boothId: string) => {
    setSelectedBoothId(boothId);
    setEditingPackage(null);
    setPackageForm(defaultPackageForm);
    setPackageModalOpen(true);
  };

  const openEditPackage = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name,
      price: pkg.price ? Number(pkg.price).toLocaleString('vi-VN') : '',
      description: pkg.description || '',
      includedServices: pkg.includedServices?.length ? [...pkg.includedServices] : [''],
      minParticipants: String(pkg.minParticipants || ''),
      maxParticipants: String(pkg.maxParticipants || ''),
      depositAmount: pkg.depositAmount ? Number(pkg.depositAmount).toLocaleString('vi-VN') : '',
      serviceDuration: pkg.serviceDuration || '',
      images: pkg.images?.length ? [...pkg.images] : [],
      model3dUrl: pkg.model3dUrl || ''
    });
    setPackageModalOpen(true);
  };

  const closePackageModal = () => {
    setPackageModalOpen(false);
    setEditingPackage(null);
    setPackageForm(defaultPackageForm);
    setPackageErrors({});
  };

  const handlePackageImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const currentCount = packageForm.images.length;
    if (currentCount + files.length > MAX_PACKAGE_IMAGES) {
      const msg = `Chỉ được tải tối đa ${MAX_PACKAGE_IMAGES} ảnh cho mỗi package.`;
      showToast(msg, 'error');
      return;
    }

    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const uploaded = await uploadToCloudinary(file, 'eventflow/package-images');
        uploadedUrls.push(uploaded.secure_url);
      }

      setPackageForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    } catch (error: any) {
      console.error('Upload package images error', error);
      showToast(error?.message || 'Không thể tải ảnh package', 'error');
    } finally {
      setUploadingImages(false);
    }
  };

  const removePackageImage = (index: number) => {
    setPackageForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleModel3DSelect = async (file: File | null) => {
    if (!file) return;

    const validExtensions = ['.glb', '.gltf'];
    const lowerName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => lowerName.endsWith(ext));
    if (!isValid) {
      const msg = 'Chỉ chấp nhận file .glb hoặc .gltf';
      showToast(msg, 'error');
      return;
    }

    if (vendorPlan !== 'vip') {
      const msg = 'Hãy nâng cấp lên gói Vip để sử dụng nó';
      showToast(msg, 'error');
      return;
    }

    try {
      const uploaded = await uploadToCloudinaryFile(file, 'eventflow/package-models', 'raw');
      setPackageForm((prev) => ({ ...prev, model3dUrl: uploaded.secure_url }));
      showToast('Đã tải file 3D thành công', 'success');
    } catch (error: any) {
      console.error('Upload 3D error', error);
      showToast(error?.message || 'Không thể tải file 3D', 'error');
    }
  };

  const setServiceAt = (index: number, value: string) => {
    setPackageForm((prev) => {
      const next = [...prev.includedServices];
      next[index] = value;
      return { ...prev, includedServices: next };
    });
  };

  const addServiceItem = () => {
    setPackageForm((prev) => ({ ...prev, includedServices: [...prev.includedServices, ''] }));
  };

  const removeServiceItem = (index: number) => {
    setPackageForm((prev) => {
      const next = prev.includedServices.filter((_, i) => i !== index);
      return { ...prev, includedServices: next.length ? next : [''] };
    });
  };

  const submitPackage = async () => {
    if (!selectedBoothId) {
      showToast('Vui lòng chọn gian hàng trước khi tạo dịch vụ', 'error');
      return;
    }

    const errors: Partial<Record<keyof PackageForm, string>> = {};
    const price = parseMoneyInput(packageForm.price);
    const minParticipants = Number(packageForm.minParticipants);
    const maxParticipants = Number(packageForm.maxParticipants);
    const depositAmount = parseMoneyInput(packageForm.depositAmount);
    const cleanedServices = packageForm.includedServices.map((x) => x.trim()).filter(Boolean);

    if (!packageForm.name.trim()) {
      errors.name = 'Vui lòng nhập tên gói dịch vụ.';
    }
    if (!Number.isFinite(price) || price <= 0) {
      errors.price = 'Mức giá phải lớn hơn 0.';
    }
    if (!Number.isFinite(minParticipants) || minParticipants <= 0) {
      errors.minParticipants = 'Số người tối thiểu phải lớn hơn 0.';
    }
    if (!Number.isFinite(maxParticipants) || maxParticipants <= 0) {
      errors.maxParticipants = 'Số người tối đa phải lớn hơn 0.';
    }
    if (Number.isFinite(minParticipants) && Number.isFinite(maxParticipants) && maxParticipants < minParticipants) {
      errors.maxParticipants = 'Số người tối đa phải lớn hơn hoặc bằng số tối thiểu.';
    }
    if (!Number.isFinite(depositAmount) || depositAmount < 0) {
      errors.depositAmount = 'Tiền cọc không được âm.';
    }
    if (Number.isFinite(depositAmount) && Number.isFinite(price) && depositAmount > price) {
      errors.depositAmount = 'Tiền cọc không được lớn hơn mức giá.';
    }
    if (!packageForm.serviceDuration.trim()) {
      errors.serviceDuration = 'Vui lòng nhập thời lượng phục vụ.';
    }
    if (cleanedServices.length === 0) {
      errors.includedServices = 'Cần ít nhất một dịch vụ đi kèm.';
    }
    if (packageForm.images.length === 0) {
      errors.images = 'Cần ít nhất một ảnh minh họa.';
    }

    setPackageErrors(errors);
    if (Object.keys(errors).length > 0) {
      showToast('Vui lòng kiểm tra lại thông tin package', 'error');
      return;
    }

    const payload = {
      boothId: selectedBoothId,
      name: packageForm.name.trim(),
      price,
      description: packageForm.description.trim(),
      includedServices: cleanedServices,
      minParticipants: Number(packageForm.minParticipants) || 0,
      maxParticipants: Number(packageForm.maxParticipants) || 0,
      depositAmount,
      serviceDuration: packageForm.serviceDuration.trim(),
      images: packageForm.images,
      model3dUrl: packageForm.model3dUrl
    };

    try {
      setSaving(true);

      if (editingPackage) {
        const res = await updatePackage(editingPackage._id, payload);
        setPackagesByBooth((prev) => ({
          ...prev,
          [selectedBoothId]: (prev[selectedBoothId] || []).map((p) => (p._id === editingPackage._id ? res.package : p))
        }));
        showToast('Đã cập nhật package', 'success');
      } else {
        const res = await createPackage(payload);
        setPackagesByBooth((prev) => ({
          ...prev,
          [selectedBoothId]: [res.package, ...(prev[selectedBoothId] || [])]
        }));
        showToast('Đã tạo package mới', 'success');
      }

      closePackageModal();
    } catch (error) {
      console.error('Save package error', error);
      showToast('Lưu package thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const onTogglePackage = async (pkg: ServicePackage) => {
    try {
      const res = await togglePackage(pkg._id);
      setPackagesByBooth((prev) => ({
        ...prev,
        [pkg.boothId]: (prev[pkg.boothId] || []).map((p) => (p._id === pkg._id ? res.package : p))
      }));
      showToast('Đã cập nhật trạng thái package', 'success');
    } catch (error) {
      console.error('Toggle package error', error);
      showToast('Không thể đổi trạng thái package', 'error');
    }
  };

  const onDeletePackage = async (pkg: ServicePackage) => {
    try {
      await deletePackage(pkg._id);
      setPackagesByBooth((prev) => ({
        ...prev,
        [pkg.boothId]: (prev[pkg.boothId] || []).filter((p) => p._id !== pkg._id)
      }));
      showToast('Đã xóa package', 'success');
    } catch (error) {
      console.error('Delete package error', error);
      showToast('Xóa package thất bại', 'error');
    }
  };

  const requestDeletePackage = (pkg: ServicePackage) => {
    setConfirmDelete({
      open: true,
      type: 'package',
      id: pkg._id,
      boothId: pkg.boothId,
      title: 'Xóa package?',
      message: `Package "${pkg.name}" sẽ bị xóa vĩnh viễn.`
    });
  };

  const openPreview3D = (pkg: ServicePackage) => {
    if (!pkg.model3dUrl) return;

    setPreview3D({
      open: true,
      url: pkg.model3dUrl,
      name: pkg.name
    });
  };

  const closePreview3D = () => {
    setPreview3D({ open: false, url: '', name: '' });
  };

  const closeConfirmDelete = () => {
    setConfirmDelete((prev) => ({ ...prev, open: false }));
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.open || !confirmDelete.id) return;

    try {
      setDeleting(true);

      if (confirmDelete.type === 'booth') {
        const booth = booths.find((b) => b._id === confirmDelete.id);
        if (booth) {
          await onDeleteBooth(booth);
        }
      } else {
        const boothPkgs = confirmDelete.boothId ? packagesByBooth[confirmDelete.boothId] || [] : [];
        const pkg = boothPkgs.find((p) => p._id === confirmDelete.id);
        if (pkg) {
          await onDeletePackage(pkg);
        }
      }
    } finally {
      setDeleting(false);
      closeConfirmDelete();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản Lí Gian Hàng</h2>
          <p className="text-slate-400 text-sm mt-1">Mỗi gian hàng có thể chứa nhiều package dịch vụ.</p>
        </div>
        <button
          onClick={openCreateBooth}
          className="px-4 py-2 bg-primary text-background-dark font-bold rounded-lg flex items-center gap-2 hover:brightness-110 transition-all cyan-glow text-sm uppercase tracking-widest"
        >
          <Plus className="w-4 h-4" /> Tạo Gian Hàng
        </button>
      </div>

      {loadingBooths ? (
        <div className="text-slate-400">Đang tải gian hàng...</div>
      ) : booths.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center text-slate-300">
          Chưa có gian hàng nào. Hãy tạo gian hàng đầu tiên.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {booths.map((booth) => {
            const isSelected = selectedBoothId === booth._id;

            return (
              <div key={booth._id} className={`glass-card rounded-2xl p-6 border ${isSelected ? 'border-primary/50' : 'border-white/10'}`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-bold truncate">{booth.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 capitalize">Loại: {booth.eventType}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleBooth(booth)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${booth.isActive ? 'bg-primary' : 'bg-white/10'}`}
                    title={booth.isActive ? 'Ẩn gian hàng' : 'Hiện gian hàng'}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${booth.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <p className="text-sm text-slate-300 mb-4 min-h-[40px]">{booth.description || 'Chưa có mô tả gian hàng.'}</p>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedBoothId(booth._id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${isSelected ? 'bg-primary text-background-dark' : 'bg-white/5 text-white hover:bg-white/10'}`}
                  >
                    Quản lí package
                  </button>
                  <button
                    onClick={() => openCreatePackage(booth._id)}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-white/5 text-white hover:bg-white/10"
                  >
                    Tạo package
                  </button>
                  <button
                    onClick={() => openEditBooth(booth)}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-white/5 text-white hover:bg-white/10 flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" /> Sửa
                  </button>
                  <button
                    onClick={() => requestDeleteBooth(booth)}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-300 hover:bg-red-500/20 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedBooth && (
        <div className="glass-card rounded-2xl p-6 border border-primary/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Package của gian hàng: {selectedBooth.name}</h3>
              <p className="text-slate-400 text-sm">Tạo, sửa, ẩn hoặc xóa các package dịch vụ của gian hàng này.</p>
            </div>
            <button
              onClick={() => openCreatePackage(selectedBooth._id)}
              className="px-4 py-2 bg-primary text-background-dark font-bold rounded-lg flex items-center gap-2 hover:brightness-110 transition-all text-sm"
            >
              <Plus className="w-4 h-4" /> Tạo Package
            </button>
          </div>

          {loadingPackages ? (
            <div className="text-slate-400">Đang tải package...</div>
          ) : selectedPackages.length === 0 ? (
            <div className="text-slate-400 text-sm">Chưa có package nào trong gian hàng này.</div>
          ) : (
            <div className="space-y-4">
              {selectedPackages.map((pkg) => (
                <div key={pkg._id} className={`rounded-xl p-4 border ${pkg.isActive ? 'border-white/15' : 'border-white/10 opacity-70'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-white font-semibold">{pkg.name}</h4>
                      <p className="text-sm text-slate-300 mt-1">{pkg.description || 'Chưa có mô tả.'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {pkg.model3dUrl && (
                        <button
                          onClick={() => openPreview3D(pkg)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200"
                          title="Xem trước 3D"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onTogglePackage(pkg)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200"
                        title={pkg.isActive ? 'Ẩn package' : 'Hiện package'}
                      >
                        {pkg.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEditPackage(pkg)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200"
                        title="Sửa package"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => requestDeletePackage(pkg)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300"
                        title="Xóa package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-sm">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-slate-400">Mức giá</p>
                      <p className="text-white font-medium">{pkg.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-slate-400">Số người tham gia</p>
                      <p className="text-white font-medium">{pkg.minParticipants} - {pkg.maxParticipants}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-slate-400">Tiền cọc / thời lượng</p>
                      <p className="text-white font-medium">{pkg.depositAmount.toLocaleString('vi-VN')}đ / {pkg.serviceDuration || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-slate-400 mb-1">Dịch vụ đi kèm</p>
                    <div className="flex flex-wrap gap-2">
                      {pkg.includedServices?.length ? (
                        pkg.includedServices.map((service, index) => (
                          <span key={`${pkg._id}-${index}`} className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                            {service}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">Chưa khai báo dịch vụ đi kèm.</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {boothModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-2xl w-full max-w-xl bg-background-dark overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{editingBooth ? 'Sửa Gian Hàng' : 'Tạo Gian Hàng'}</h3>
                <button onClick={closeBoothModal} className="p-2 rounded-full hover:bg-white/10">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Tên gian hàng</label>
                  <input
                    value={boothForm.name}
                    onChange={(e) => setBoothForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                    placeholder="Ví dụ: Gian hàng tiệc cưới cao cấp"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Loại sự kiện</label>
                  <select
                    value={boothForm.eventType}
                    onChange={(e) => setBoothForm((prev) => ({ ...prev, eventType: e.target.value as BoothEventType }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type} className="text-black">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Mô tả gian hàng</label>
                  <textarea
                    rows={4}
                    value={boothForm.description}
                    onChange={(e) => setBoothForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
                    placeholder="Mô tả điểm mạnh của gian hàng..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-3">
                <button onClick={closeBoothModal} className="flex-1 py-3 glass-card text-white rounded-xl hover:bg-white/10">
                  Hủy
                </button>
                <button
                  onClick={submitBooth}
                  disabled={saving}
                  className="flex-1 py-3 bg-primary text-background-dark font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" /> Lưu Gian Hàng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {packageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-2xl w-full max-w-2xl bg-background-dark overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{editingPackage ? 'Sửa Package' : 'Tạo Package Mới'}</h3>
                <button onClick={closePackageModal} className="p-2 rounded-full hover:bg-white/10">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Tên gói</label>
                  <input
                    value={packageForm.name}
                    onChange={(e) => setPackageForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                    placeholder="Ví dụ: Gói trang trí tiêu chuẩn"
                  />
                  {packageErrors.name && <p className="text-red-400 text-xs mt-1">{packageErrors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Mức giá (VND)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9.]*"
                      value={packageForm.price}
                      onChange={(e) =>
                        setPackageForm((prev) => ({
                          ...prev,
                          price: normalizeMoneyInput(e.target.value)
                        }))
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                    />
                    {packageErrors.price && <p className="text-red-400 text-xs mt-1">{packageErrors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Tiền cọc (VND)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9.]*"
                      value={packageForm.depositAmount}
                      onChange={(e) =>
                        setPackageForm((prev) => ({
                          ...prev,
                          depositAmount: normalizeMoneyInput(e.target.value)
                        }))
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                    />
                    {packageErrors.depositAmount && <p className="text-red-400 text-xs mt-1">{packageErrors.depositAmount}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Số người từ</label>
                    <input
                      type="number"
                      min={1}
                      value={packageForm.minParticipants}
                      onChange={(e) => setPackageForm((prev) => ({ ...prev, minParticipants: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                    />
                    {packageErrors.minParticipants && <p className="text-red-400 text-xs mt-1">{packageErrors.minParticipants}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Số người đến</label>
                    <input
                      type="number"
                      min={1}
                      value={packageForm.maxParticipants}
                      onChange={(e) => setPackageForm((prev) => ({ ...prev, maxParticipants: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                    />
                    {packageErrors.maxParticipants && <p className="text-red-400 text-xs mt-1">{packageErrors.maxParticipants}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Thời lượng phục vụ</label>
                  <input
                    value={packageForm.serviceDuration}
                    onChange={(e) => setPackageForm((prev) => ({ ...prev, serviceDuration: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                    placeholder="Ví dụ: 4 giờ"
                  />
                  {packageErrors.serviceDuration && <p className="text-red-400 text-xs mt-1">{packageErrors.serviceDuration}</p>}
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Mô tả gói</label>
                  <textarea
                    rows={3}
                    value={packageForm.description}
                    onChange={(e) => setPackageForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2 flex items-center justify-between">
                    <span>Ảnh minh họa {packageForm.images.length > 0 ? `(${packageForm.images.length}/${MAX_PACKAGE_IMAGES})` : `(0/${MAX_PACKAGE_IMAGES})`}</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePackageImages(e.target.files)}
                    className="w-full text-sm text-white/70"
                  />
                  <p className="text-xs text-slate-400 mt-2">Tối đa {MAX_PACKAGE_IMAGES} ảnh. Ảnh sẽ được xem trước sau khi tải lên.</p>
                  {packageErrors.images && <p className="text-red-400 text-xs mt-1">{packageErrors.images}</p>}

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {packageForm.images.map((src, index) => (
                      <div key={`${src}-${index}`} className="relative group rounded-xl overflow-hidden border border-white/10 bg-white/5">
                        <img src={src} alt={`preview-${index}`} className="w-full h-28 object-cover" />
                        <button
                          type="button"
                          onClick={() => removePackageImage(index)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {uploadingImages && (
                      <div className="h-28 rounded-xl border border-dashed border-white/15 flex items-center justify-center text-slate-400 text-sm">
                        Đang tải ảnh...
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2 flex items-center justify-between">
                    <span>Dịch vụ đi kèm</span>
                    <button type="button" onClick={addServiceItem} className="text-primary text-xs hover:underline">
                      + Thêm dịch vụ
                    </button>
                  </label>

                  <div className="space-y-2">
                    {packageForm.includedServices.map((service, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          value={service}
                          onChange={(e) => setServiceAt(index, e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                          placeholder="Ví dụ: MC, bàn gallery, backdrop..."
                        />
                        <button
                          type="button"
                          onClick={() => removeServiceItem(index)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {packageErrors.includedServices && <p className="text-red-400 text-xs mt-1">{packageErrors.includedServices}</p>}
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">File minh họa 3D (.glb/.gltf)</label>
                  <input
                    type="file"
                    accept=".glb,.gltf"
                    onChange={(e) => handleModel3DSelect(e.target.files?.[0] || null)}
                    className="w-full text-sm text-white/70"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    {vendorPlan === 'vip'
                      ? 'Vendor VIP có thể sử dụng file 3D cho package.'
                      : 'Hãy nâng cấp lên gói Vip để sử dụng nó'}
                  </p>
                  {packageForm.model3dUrl && (
                    <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 break-all">
                      Đã tải 3D: {packageForm.model3dUrl}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-3">
                <button onClick={closePackageModal} className="flex-1 py-3 glass-card text-white rounded-xl hover:bg-white/10">
                  Hủy
                </button>
                <button
                  onClick={submitPackage}
                  disabled={saving}
                  className="flex-1 py-3 bg-primary text-background-dark font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" /> Lưu Package
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-2xl w-full max-w-md bg-background-dark overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/15 text-red-300 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{confirmDelete.title}</h3>
                  <p className="text-slate-400 text-sm mt-1">{confirmDelete.message}</p>
                </div>
              </div>

              <div className="p-6 flex gap-3">
                <button
                  onClick={closeConfirmDelete}
                  disabled={deleting}
                  className="flex-1 py-3 glass-card text-white rounded-xl hover:bg-white/10 disabled:opacity-60"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-400 transition-all disabled:opacity-60"
                >
                  {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {preview3D.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-2xl w-full max-w-2xl bg-background-dark overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Xem trước 3D</h3>
                  <p className="text-slate-400 text-sm mt-1 truncate">{preview3D.name}</p>
                </div>
                <button onClick={closePreview3D} className="p-2 rounded-full hover:bg-white/10">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-300 text-sm">File 3D đã tải lên:</p>
                  <p className="mt-2 text-xs text-slate-400 break-all">{preview3D.url}</p>
                </div>

                <div className="rounded-2xl border border-dashed border-white/15 bg-black/30 h-72 flex flex-col items-center justify-center text-center px-6">
                  <Store className="w-12 h-12 text-primary mb-3" />
                  <p className="text-white font-semibold">Bản xem trước 3D</p>
                  <p className="text-slate-400 text-sm mt-2 max-w-md">
                    Trình duyệt đang hiển thị thông tin file 3D đã upload. Nếu bạn muốn xem mô hình tương tác trực tiếp,
                    mình có thể nối thêm thư viện viewer 3D sau.
                  </p>
                  <a
                    href={preview3D.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background-dark font-bold hover:brightness-110 transition-all"
                  >
                    Mở file 3D
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
