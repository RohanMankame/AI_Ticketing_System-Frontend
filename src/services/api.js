import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tickets
export const getTickets = async () => {
  const response = await api.get('/tickets/');
  return response.data;
};

export const getTicket = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};


export const importTickets = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/tickets/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const analyzeTicket = async (ticketId) => {
  const response = await api.post(`/tickets/${ticketId}/analyze`);
  return response.data;
};

export const suggestSolution = async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}/suggest-solution`);
  return response.data;
};

export const getSimilarTickets = async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}/similar`);
  return response.data;
};

// Knowledge
export const getKnowledgeArticles = async () => {
  const response = await api.get('/knowledge/');
  return response.data;
};

export const getKnowledgeArticle = async (articleId) => {
  const response = await api.get(`/knowledge/${articleId}`);
  return response.data;
};

export const createKnowledgeArticle = async (articleData) => {
  const response = await api.post('/knowledge/', articleData);
  return response.data;
};

export const searchKnowledge = async (query) => {
  const response = await api.get('/knowledge/search', {
    params: { q: query },
  });
  return response.data;
};

export const draftKnowledgeArticle = async (ticketIds) => {
  const response = await api.post('/knowledge/draft', { ticket_ids: ticketIds });
  return response.data;
};

export const deleteKnowledgeArticle = async (articleId) => {
  const response = await api.delete(`/knowledge/${articleId}`);
  return response.data;
};

// Analytics
export const getAnalyticsRoot = async () => {
  const response = await api.get('/analytics/');
  return response.data;
};

export const getForecast = async (days = 7, daysToForecast = 7) => {
  const response = await api.get('/analytics/forecast', {
    params: { days, days_to_forecast: daysToForecast },
  });
  return response.data;
};

export const getForecastByType = async (days = 30, daysToForecast = 7) => {
  const response = await api.get('/analytics/forecast-by-type', {
    params: { days, days_to_forecast: daysToForecast },
  });
  return response.data;
};

export default api;
