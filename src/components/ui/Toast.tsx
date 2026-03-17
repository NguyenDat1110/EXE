import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

const toastIcons: Record<ToastType, ReactNode> = {
  success: <Check className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  warning: <AlertCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

const toastColors: Record<ToastType, string> = {
  success: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  error: 'bg-red-500/20 border-red-500/30 text-red-300',
  warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
  info: 'bg-cyan/20 border-cyan/30 text-cyan',
};

export function Toast({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'glass-panel px-4 py-3 rounded-lg flex items-center gap-3 max-w-sm',
        toastColors[toast.type]
      )}
    >
      {toastIcons[toast.type]}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/60 hover:text-white transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
