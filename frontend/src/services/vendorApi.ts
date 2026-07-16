import api from './api';

export const getVendorStats = async () => {
  const res = await api.get('/vendor/stats');
  return res.data;
};
