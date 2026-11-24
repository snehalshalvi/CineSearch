import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const getMovies = async (params = {}) => {
  const response = await api.get('/movies', { params });
  return response.data;
};

export const getMovieDetail = async (id) => {
  const response = await api.get(`/movies/${id}`);
  return response.data;
};

export const searchMovies = async (searchData) => {
  const response = await api.post('/search', searchData);
  return response.data;
};

export const getSearchHistory = async () => {
  const response = await api.get('/search/history');
  return response.data;
};

export const clearSearchHistory = async () => {
  const response = await api.delete('/search/history');
  return response.data;
};

export const getSearchAnalysis = async (query, topK = 10) => {
  const response = await api.get('/search/analysis', {
    params: { query, top_k: topK },
  });
  return response.data;
};

export const getFilters = async () => {
  const response = await api.get('/filters');
  return response.data;
};

export const getTrending = async (limit = 8) => {
  const response = await api.get('/trending', { params: { limit } });
  return response.data;
};

export const getSuggestions = async (query) => {
  const response = await api.post('/search/suggestions', { query });
  return response.data;
};

export default api;
