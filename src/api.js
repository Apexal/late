import axios from 'axios';

export default axios.create({
  baseURL: '/api/',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});
