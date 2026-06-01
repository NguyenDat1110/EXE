import api from './api';

export const getBooths = async () => {
  const res = await api.get('/booths');
  return res.data;
};

export const createBooth = async (payload: any) => {
  const res = await api.post('/booths', payload);
  return res.data;
};

export const updateBooth = async (id: string, payload: any) => {
  const res = await api.patch(`/booths/${id}`, payload);
  return res.data;
};

export const toggleBooth = async (id: string) => {
  const res = await api.patch(`/booths/${id}/toggle`);
  return res.data;
};

export const deleteBooth = async (id: string) => {
  const res = await api.delete(`/booths/${id}`);
  return res.data;
};
