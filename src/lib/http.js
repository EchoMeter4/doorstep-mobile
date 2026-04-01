import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const http = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

http.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;
