import axios from 'axios';

export default () => {
  return axios.create({
    baseURL: '//localhost:3000/api/',
    withCredentials: false,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  });
};
