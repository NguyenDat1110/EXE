import React, { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeIndex = tabs.findIndex(t => t.id === activeTab);

  return (
    <div className={clsx('w-full', className)}>
      {/* Tab Header */}
      <div className="border-b border-white/10 flex gap-2 overflow-x-auto">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-4 py-3 font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-colors relative',
              activeTab === tab.id
                ? 'text-cyan'
                : 'text-silver/60 hover:text-silver'
            )}
          >
            {tab.icon && tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan to-cyan/50"
                initial={false}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="relative">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="py-6"
        >
          {tabs.find(t => t.id === activeTab)?.content}
        </motion.div>
      </div>
    </div>
  );
}
