import http from '../lib/http';

export async function getMe() {
  const { data } = await http.get('/api/me');
  return data;
}

export async function updateMe(body) {
  const { data } = await http.patch('/api/me', body);
  return data;
}
