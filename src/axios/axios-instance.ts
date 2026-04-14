import axios from 'axios';
import { env } from '../config/env';

export const api = axios.create({
  baseURL: env.BACKEND_URL,
  headers: {
    'Authorization': `Bearer ${env.BEARER_TOKEN}`
  }
});

