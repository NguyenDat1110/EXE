import React from 'react';
import PackageManager from '../../components/vendor-dashboard/PackageManager';

export default function VendorPackages() {
  const dummyShowToast = (msg: string, type?: 'success' | 'error' | 'info') => {
    console.log(msg, type);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        <PackageManager showToast={dummyShowToast} />
      </div>
    </div>
  );
}
