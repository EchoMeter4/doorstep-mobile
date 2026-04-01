import http from '../lib/http';

export async function submitAccess(zoneId, imageUri) {
  const form = new FormData();
  form.append('zone_id', zoneId);
  form.append('image', { uri: imageUri, name: 'photo.jpg', type: 'image/jpeg' });
  const { data } = await http.post('/api/access', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data; // { authorized, log_code, extracted, message }
}

export async function getLogs(from, to) {
  const { data } = await http.get('/api/logs', { params: { from, to } });
  return data.logs;
}
