import React, { useState } from 'react';
import VerificationQueue from '../../components/admin-dashboard/VerificationQueue';

export function AdminVendors() {
  const handleShowToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    console.log(`[${type}] ${msg}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Phê Duyệt Vendor</h1>
        <p className="text-silver/60">Xem xét và phê duyệt/từ chối các đơn đăng ký vendor</p>
      </div>

      <VerificationQueue showToast={handleShowToast} />
    </div>
  );
}
