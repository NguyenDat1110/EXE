import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid, Box, RotateCcw, Trash2, Save, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../../../services/api';
import { useStageBuilderStore } from '../../../store/stageBuilderStore';
import SidebarPalette from '../../../components/features/stage-builder/SidebarPalette';
import KonvaCanvas from '../../../components/features/stage-builder/KonvaCanvas';
import ThreeDViewer from '../../../components/features/stage-builder/ThreeDViewer';
import PropertiesPanel from '../../../components/features/stage-builder/PropertiesPanel';

interface VendorStageBuilderProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function VendorStageBuilder({ showToast }: VendorStageBuilderProps) {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { 
    items, 
    viewMode, 
    setViewMode, 
    clearAll,
    selectedItemId,
    removeItem,
    updateItem
  } = useStageBuilderStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pkgName, setPkgName] = useState('Bản thiết kế nháp (Demo)');

  // Hydration logic
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        // Fetch package details
        const res = await api.get(`/packages/public/${packageId}`);
        const data = res.data.data.package;
        
        if (isMounted) {
          setPkgName(data.name || 'Gói dịch vụ');
          if (data.stageLayout && Array.isArray(data.stageLayout)) {
            useStageBuilderStore.setState({ items: data.stageLayout });
          } else {
            clearAll();
          }
        }
      } catch (err) {
        if (isMounted) {
          showToast('Lỗi khi tải dữ liệu thiết kế cũ.', 'error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (packageId) {
      loadData();
    } else {
      // Demo mode
      if (isMounted) {
        setIsLoading(false);
      }
    }
    
    return () => {
      isMounted = false;
      clearAll(); // Cleanup when unmounting
    };
  }, [packageId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveDesign = async () => {
    if (!packageId) {
      showToast('Tính năng lưu tạm khoá trong chế độ Demo.', 'info');
      return;
    }
    setIsSaving(true);
    try {
      await api.patch(
        `/packages/${packageId}`,
        { stageLayout: items }
      );
      showToast('Lưu thiết kế thành công!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi lưu thiết kế.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedItem = items.find((i) => i.id === selectedItemId);

  const handleRotate90 = () => {
    if (selectedItem) {
      updateItem(selectedItem.id, {
        rotation: (selectedItem.rotation + 45) % 360,
      });
    }
  };

  const handleDelete = () => {
    if (selectedItemId) {
      removeItem(selectedItemId);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-navy flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan animate-spin mb-4" />
        <p className="text-white/50 text-sm animate-pulse">Đang nạp thiết kế...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-navy overflow-hidden">
      {/* Custom Toolbar for Vendor with Save button */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#0d1325]/80 backdrop-blur-2xl">
        {/* Left: Title & Back Button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/vendor/dashboard')}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan/20 to-purple-500/20 flex items-center justify-center border border-cyan/20">
              <LayoutGrid className="w-4 h-4 text-cyan" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide truncate max-w-[200px]">
                {pkgName}
              </h2>
              <p className="text-[10px] text-white/30 uppercase tracking-widest">
                Stage Builder
              </p>
            </div>
          </div>
        </div>

        {/* Center: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/5">
          {[
            { mode: '2d' as const, label: '2D Design', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
            { mode: '3d' as const, label: '3D 360°', icon: <Box className="w-3.5 h-3.5" /> },
          ].map((opt) => (
            <button
              key={opt.mode}
              onClick={() => setViewMode(opt.mode)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                viewMode === opt.mode
                  ? 'text-cyan'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {viewMode === opt.mode && (
                <motion.div
                  layoutId="viewModeIndicatorVendor"
                  className="absolute inset-0 bg-cyan/10 border border-cyan/20 rounded-lg"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {opt.icon}
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Item-specific actions */}
          {selectedItem && (
            <div className="flex items-center gap-1 mr-2 pr-3 border-r border-white/10">
              <button
                onClick={handleRotate90}
                title="Xoay 45°"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-cyan hover:bg-cyan/5 border border-white/5 hover:border-cyan/20 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xoay</span>
              </button>
              <button
                onClick={handleDelete}
                title="Xóa vật phẩm"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-red-400 hover:bg-red-500/5 border border-white/5 hover:border-red-500/20 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-[10px] text-white/30 font-mono mr-2 hidden md:flex">
            {items.length} items
          </div>

          <button
            onClick={handleSaveDesign}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan text-navy font-bold text-xs hover:bg-cyan/90 transition-all shadow-[0_0_15px_rgba(0,212,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu thiết kế
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        <SidebarPalette />
        <div className="flex-1 flex min-w-0 p-3">
          <AnimatePresence mode="wait">
            {viewMode === '2d' ? (
              <motion.div
                key="canvas2d"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex min-w-0"
              >
                <KonvaCanvas />
              </motion.div>
            ) : (
              <motion.div
                key="viewer3d"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex min-w-0"
              >
                <ThreeDViewer />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {viewMode === '2d' && <PropertiesPanel />}
      </div>
    </div>
  );
}
