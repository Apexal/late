import axios from 'axios';

const ax = axios.create({
  baseURL: '/api/',
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

export default ax;
