import axios from 'axios';
import app from './main';

const instance = axios.create({
  baseURL: '/api/',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

instance.interceptors.request.use(config => {
  app.$Progress.start(); // for every request start the progress
  return config;
});

instance.interceptors.response.use(
  response => {
    app.$Progress.finish(); // finish when a response is received
    return response;
  },
  error => {
    app.$Progress.finish();
    if (
      error.response.status === 401 &&
      error.response.config.url !== '/api/students/user' &&
      !error.response.config.url.includes('discordapp') &&
      error.response.config.url !== '/api/students/loginas'
    ) {
      alert('Your session has expired! Refreshing...');
      location.reload();
      return;
    }
    return Promise.reject(error);
  }
);

export default instance;
