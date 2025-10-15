import axios from 'axios';
import { API_BASE } from '../constants/urls';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

export default api;
