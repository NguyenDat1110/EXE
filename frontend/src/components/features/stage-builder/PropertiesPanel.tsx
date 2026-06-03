import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Move,
  Trash2,
  Copy,
  LayoutGrid,
  Circle,
  RectangleHorizontal,
  Flower2,
  Lightbulb,
  Disc3,
  PanelTop,
  Aperture,
  Settings2,
} from 'lucide-react';
import { useStageBuilderStore, generateId } from '../../../store/stageBuilderStore';

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  stage: {
    label: 'Sân khấu',
    icon: <LayoutGrid className="w-5 h-5" />,
    color: 'text-amber-400',
  },
  table_round: {
    label: 'Bàn tròn 10 người',
    icon: <Circle className="w-5 h-5" />,
    color: 'text-sky-400',
  },
  table_rect: {
    label: 'Bàn đại biểu',
    icon: <RectangleHorizontal className="w-5 h-5" />,
    color: 'text-emerald-400',
  },
  flower: {
    label: 'Cột hoa trang trí',
    icon: <Flower2 className="w-5 h-5" />,
    color: 'text-pink-400',
  },
  spotlight: {
    label: 'Đèn chiếu sáng',
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'text-yellow-300',
  },
  disco_light: {
    label: 'Đèn nháy / Disco',
    icon: <Disc3 className="w-5 h-5" />,
    color: 'text-violet-400',
  },
  curtain: {
    label: 'Rèm sân khấu',
    icon: <PanelTop className="w-5 h-5" />,
    color: 'text-red-400',
  },
  flower_arch: {
    label: 'Cổng hoa',
    icon: <Aperture className="w-5 h-5" />,
    color: 'text-rose-400',
  },
};

export default function PropertiesPanel() {
  const { items, selectedItemId, updateItem, removeItem, addItem, selectItem } =
    useStageBuilderStore();

  const item = items.find((i) => i.id === selectedItemId);

  if (!item) {
    return (
      <div className="w-64 border-l border-white/5 bg-[#0d1325]/80 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4">
          <Settings2 className="w-6 h-6 text-white/10" />
        </div>
        <p className="text-sm text-white/20 font-medium">Chọn một vật phẩm</p>
        <p className="text-[10px] text-white/10 mt-1">để xem thuộc tính</p>
      </div>
    );
  }

  const meta = TYPE_META[item.type];

  const handleDuplicate = () => {
    const newId = generateId(item.type);
    addItem({
      ...item,
      id: newId,
      x: item.x + 40,
      y: item.y + 40,
    });
    selectItem(newId);
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 border-l border-white/5 bg-[#0d1325]/80 backdrop-blur-2xl flex flex-col overflow-y-auto"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${meta.color}`}>
            {meta.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-white/90">{meta.label}</p>
            <p className="text-[9px] text-white/25 font-mono truncate">{item.id}</p>
          </div>
        </div>
      </div>

      {/* Position */}
      <div className="p-4 border-b border-white/5 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Move className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
            Vị trí
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] text-white/25 uppercase mb-1 block">X</label>
            <input
              type="number"
              value={Math.round(item.x)}
              onChange={(e) => updateItem(item.id, { x: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-white/80 font-mono focus:outline-none focus:border-cyan/30 transition-colors"
            />
          </div>
          <div>
            <label className="text-[9px] text-white/25 uppercase mb-1 block">Y</label>
            <input
              type="number"
              value={Math.round(item.y)}
              onChange={(e) => updateItem(item.id, { y: Number(e.target.value) })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-white/80 font-mono focus:outline-none focus:border-cyan/30 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Rotation */}
      <div className="p-4 border-b border-white/5 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <RotateCcw className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
            Góc xoay
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={item.rotation}
            onChange={(e) => updateItem(item.id, { rotation: Number(e.target.value) })}
            className="flex-1 accent-cyan h-1"
          />
          <span className="text-xs text-cyan font-mono w-10 text-right">
            {Math.round(item.rotation)}°
          </span>
        </div>
        {/* Quick angles */}
        <div className="flex gap-1.5">
          {[0, 45, 90, 135, 180, 270].map((deg) => (
            <button
              key={deg}
              onClick={() => updateItem(item.id, { rotation: deg })}
              className={`flex-1 py-1 rounded text-[9px] font-mono transition-all ${
                item.rotation === deg
                  ? 'bg-cyan/15 text-cyan border border-cyan/25'
                  : 'bg-white/[0.02] text-white/30 border border-white/5 hover:bg-white/5 hover:text-white/50'
              }`}
            >
              {deg}°
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={handleDuplicate}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white/60 bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:text-white/80 transition-all"
        >
          <Copy className="w-3.5 h-3.5" />
          Nhân đôi
        </button>
        <button
          onClick={() => removeItem(item.id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400/70 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Xóa vật phẩm
        </button>
      </div>
    </motion.div>
  );
}
