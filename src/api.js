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

instance.interceptors.response.use(response => {
  app.$Progress.finish(); // finish when a response is received
  return response;
});

export default instance;
