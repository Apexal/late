import axios from 'axios';

export default axios.create({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/api/'
      : '/api/',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});
