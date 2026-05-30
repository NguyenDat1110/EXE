import api from './api';

export const getMyPackages = async (boothId?: string) => {
  const res = await api.get('/packages', {
    params: boothId ? { boothId } : undefined
  });
  return res.data;
};

export const createPackage = async (payload: any) => {
  const res = await api.post('/packages', payload);
  return res.data;
};

export const updatePackage = async (id: string, payload: any) => {
  const res = await api.patch(`/packages/${id}`, payload);
  return res.data;
};

export const togglePackage = async (id: string) => {
  const res = await api.patch(`/packages/${id}/toggle`);
  return res.data;
};

export const deletePackage = async (id: string) => {
  const res = await api.delete(`/packages/${id}`);
  return res.data;
};
