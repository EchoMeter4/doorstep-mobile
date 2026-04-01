import http from '../lib/http';

export async function login(email, password) {
  const { data } = await http.post('/api/login', { email, password });
  return data; // { user, token, token_type }
}

export async function logout() {
  await http.post('/api/logout');
}
