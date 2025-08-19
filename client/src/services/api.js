import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = axios.create({ baseURL });

export async function getUsers(params){
  const { data } = await api.get('/api/users', { params });
  return data;
}

export async function addUser(name){
  const { data } = await api.post('/api/users', { name });
  return data;
}

export async function claimPoints(userId){
  const { data } = await api.post(`/api/users/${userId}/claim`);
  return data;
}

export async function getLeaderboard(params){
  const { data } = await api.get('/api/leaderboard', { params });
  return data;
}

export async function getClaims(params){
  const { data } = await api.get('/api/claims', { params });
  return data;
}
