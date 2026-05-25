import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0);
  const [label, setLabel] = useState('');

  useEffect(() => {
    let score = 0;

    if (!password) {
      setStrength(0);
      setLabel('');
      return;
    }

    // Length check
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;

    // Character variety
    if (/[a-z]/.test(password)) score += 0.5;
    if (/[A-Z]/.test(password)) score += 0.5;
    if (/[0-9]/.test(password)) score += 0.5;
    if (/[^a-zA-Z0-9]/.test(password)) score += 0.5;

    const normalized = Math.min(4, Math.ceil(score));
    setStrength(normalized);

    const labels = ['', 'Yếu', 'Trung bình', 'Tốt', 'Rất mạnh'];
    setLabel(labels[normalized]);
  }, [password]);

  const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-cyan/70', 'bg-emerald-500'];
  const textColors = ['', 'text-red-400', 'text-yellow-400', 'text-cyan', 'text-emerald-400'];

  return (
    <div className="space-y-2">
      <div className="flex gap-2 h-1.5 rounded-full overflow-hidden bg-white/5">
        {[1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            initial={{ width: '25%', scaleY: 0 }}
            animate={{
              scaleY: i <= strength ? 1 : 0,
              backgroundColor: i <= strength ? colors[strength] : 'transparent',
            }}
            transition={{ duration: 0.3 }}
            className="flex-1 origin-center"
          />
        ))}
      </div>
      {password && (
        <p className={`text-xs font-medium ${textColors[strength]}`}>{label}</p>
      )}
    </div>
  );
}
