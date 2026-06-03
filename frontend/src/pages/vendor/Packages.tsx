import React from 'react';
import PackageManager from '../../components/vendor-dashboard/PackageManager';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function VendorPackages({ showToast }: Props) {

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        <PackageManager showToast={showToast} />
      </div>
    </div>
  );
}
