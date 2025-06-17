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