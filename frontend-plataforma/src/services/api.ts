import axios from 'axios';

const API_URL = {
  pagos: 'http://localhost:3003/api',
  usuarios: 'http://localhost:3000/api',
  prestamos: 'http://localhost:3002/api'
};

// Helper to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper to get language header for cultural features
const getLanguageHeader = () => {
  const language = localStorage.getItem('preferredLanguage') || 'es';
  return { 'Accept-Language': language };
};

// Helper to get combined headers api calculator
const getHeaders = () => {
  return {
    ...getAuthHeader(),
    ...getLanguageHeader(),
    'Content-Type': 'application/json'
  };
};

// Fetch payment history (admin only)
export const fetchPaymentHistory = async () => {
  try {
    const response = await axios.get(`${API_URL.pagos}/pagos/historial`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

// Fetch user details by ID
export const fetchUserDetails = async (userId: string) => {
  try {
    // Use the specific endpoint to get basic user info instead of the full profile
    const response = await axios.get(`${API_URL.usuarios}/usuarios/${userId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching user details for ID ${userId}:`, error);
    return { nombre: 'Usuario', apellido: 'Desconocido' };
  }
};

// Cultural loan calculator
export const calculateCulturalLoan = async (loanData: {
  amount: number;
  term: number;
  purpose?: string;
  culturalConsiderations?: boolean;
}) => {
  try {
    const response = await axios.post(`${API_URL.usuarios}/cultural/loan-calculator`, loanData, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error calculating cultural loan:', error);
    throw error;
  }
};

// Get cultural statistics
export const getCulturalStats = async () => {
  try {
    const response = await axios.get(`${API_URL.usuarios}/cultural/stats`, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cultural stats:', error);
    throw error;
  }
};

// Get seasonal payment options
export const getSeasonalPaymentOptions = async (loanData: {
  loanAmount: number;
  purpose: string;
  region: string;
}) => {
  try {
    const response = await axios.post(`${API_URL.usuarios}/cultural/seasonal-payment-options`, loanData, {
      headers: getHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching seasonal payment options:', error);
    throw error;
  }
};