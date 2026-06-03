import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Circle,
  RectangleHorizontal,
  Flower2,
  Lightbulb,
  Disc3,
  PanelTop,
  Aperture,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ItemType, useStageBuilderStore, generateId } from '../../../store/stageBuilderStore';

interface PaletteItem {
  type: ItemType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
}

interface PaletteCategory {
  title: string;
  items: PaletteItem[];
}

const PALETTE_CATEGORIES: PaletteCategory[] = [
  {
    title: 'Sân khấu & Bàn',
    items: [
      {
        type: 'stage',
        label: 'Sân khấu',
        description: 'Sân khấu chính cho sự kiện',
        icon: <LayoutGrid className="w-6 h-6" />,
        color: 'text-amber-400',
        bgGradient: 'from-amber-500/20 to-orange-600/10',
      },
      {
        type: 'table_round',
        label: 'Bàn tròn 10 người',
        description: 'Bàn tiệc tròn VIP',
        icon: <Circle className="w-6 h-6" />,
        color: 'text-sky-400',
        bgGradient: 'from-sky-500/20 to-blue-600/10',
      },
      {
        type: 'table_rect',
        label: 'Bàn đại biểu',
        description: 'Bàn chữ nhật cho đại biểu',
        icon: <RectangleHorizontal className="w-6 h-6" />,
        color: 'text-emerald-400',
        bgGradient: 'from-emerald-500/20 to-green-600/10',
      },
    ],
  },
  {
    title: 'Ánh sáng',
    items: [
      {
        type: 'spotlight',
        label: 'Đèn chiếu sáng',
        description: 'Spotlight rọi sân khấu',
        icon: <Lightbulb className="w-6 h-6" />,
        color: 'text-yellow-300',
        bgGradient: 'from-yellow-400/20 to-amber-500/10',
      },
      {
        type: 'disco_light',
        label: 'Đèn nháy / Disco',
        description: 'Đèn LED xoay nhiều màu',
        icon: <Disc3 className="w-6 h-6" />,
        color: 'text-violet-400',
        bgGradient: 'from-violet-500/20 to-purple-600/10',
      },
    ],
  },
  {
    title: 'Trang trí',
    items: [
      {
        type: 'flower',
        label: 'Cột hoa trang trí',
        description: 'Lẵng hoa trên cột cao',
        icon: <Flower2 className="w-6 h-6" />,
        color: 'text-pink-400',
        bgGradient: 'from-pink-500/20 to-rose-600/10',
      },
      {
        type: 'flower_arch',
        label: 'Cổng hoa',
        description: 'Cổng hoa cưới vòm cung',
        icon: <Aperture className="w-6 h-6" />,
        color: 'text-rose-400',
        bgGradient: 'from-rose-500/20 to-pink-600/10',
      },
      {
        type: 'curtain',
        label: 'Rèm sân khấu',
        description: 'Rèm vải nhung hai bên',
        icon: <PanelTop className="w-6 h-6" />,
        color: 'text-red-400',
        bgGradient: 'from-red-500/20 to-rose-700/10',
      },
    ],
  },
];

// Flat list for stats
const ALL_PALETTE_ITEMS = PALETTE_CATEGORIES.flatMap((c) => c.items);

// Color lookup for stat dots
const DOT_COLORS: Record<string, string> = {
  stage: 'bg-amber-400',
  table_round: 'bg-sky-400',
  table_rect: 'bg-emerald-400',
  flower: 'bg-pink-400',
  spotlight: 'bg-yellow-300',
  disco_light: 'bg-violet-400',
  flower_arch: 'bg-rose-400',
  curtain: 'bg-red-400',
};

// Canvas dimensions (must match KonvaCanvas)
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

export default function SidebarPalette() {
  const { items, clearAll, addItem } = useStageBuilderStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleAddItem = (type: ItemType) => {
    const id = generateId(type);
    addItem({
      id,
      type,
      x: CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 200,
      y: CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * 200,
      rotation: 0,
      scale: 1,
    });
  };

  const handleDragStart = (e: React.DragEvent, type: ItemType) => {
    e.dataTransfer.setData('itemType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <motion.div
      animate={{ width: collapsed ? 56 : 280 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="relative h-full flex flex-col border-r border-white/10 bg-[#0d1325]/80 backdrop-blur-2xl overflow-hidden select-none"
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-20 w-6 h-6 rounded-full bg-cyan/90 text-navy flex items-center justify-center shadow-lg shadow-cyan/30 hover:scale-110 transition-transform"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Header */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 border-b border-white/5"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-cyan" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/80">
                Vật phẩm
              </h3>
            </div>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">
              Click hoặc kéo thả vào canvas
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Palette Items — grouped by category */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-hide">
        {PALETTE_CATEGORIES.map((cat) => (
          <div key={cat.title}>
            {/* Category heading */}
            {!collapsed && (
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/25 mb-2 px-1">
                {cat.title}
              </p>
            )}
            <div className="space-y-1.5">
              {cat.items.map((item, idx) => (
                <motion.div
                  key={item.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  draggable
                  onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, item.type)}
                  onClick={() => handleAddItem(item.type)}
                  className={`group relative cursor-grab active:cursor-grabbing rounded-xl border border-white/5 hover:border-white/15 transition-all duration-300 overflow-hidden ${
                    collapsed ? 'p-2 flex items-center justify-center' : 'p-3'
                  }`}
                >
                  {/* Hover glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="relative z-10 flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300`}
                    >
                      {item.icon}
                    </div>
                    {!collapsed && (
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-white/90 truncate leading-tight">
                          {item.label}
                        </p>
                        <p className="text-[10px] text-white/35 truncate">
                          {item.description}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats & Clear */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 border-t border-white/5 space-y-3"
          >
            {/* Item Count */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Tổng vật phẩm</span>
              <span className="text-cyan font-bold text-sm">{items.length}</span>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-2 gap-1">
              {ALL_PALETTE_ITEMS.map((p) => {
                const count = items.filter((i) => i.type === p.type).length;
                if (count === 0) return null;
                return (
                  <div
                    key={p.type}
                    className="flex items-center gap-1.5 text-[10px] text-white/30"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[p.type] || 'bg-white/30'}`} />
                    <span className="truncate">{p.label}</span>
                    <span className="ml-auto text-white/50 font-medium">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Clear Button */}
            {items.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={clearAll}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400/80 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa tất cả
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
