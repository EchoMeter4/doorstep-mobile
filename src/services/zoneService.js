import http from '../lib/http';

export async function getZones() {
  const { data } = await http.get('/api/zones');
  return data.zones;
}
