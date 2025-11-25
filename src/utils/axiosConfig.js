import axios from 'axios';

const API_BASE_URL = 'https://workflow-0euv.onrender.com'; 

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'accept': '*/*'
  },
});

export default axiosClient;