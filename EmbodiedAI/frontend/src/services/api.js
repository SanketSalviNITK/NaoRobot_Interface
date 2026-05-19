import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const connectRobot = async (ip, mock = false) => {
  const res = await axios.post(`${API_BASE}/connect`, { ip, port: 9559, mock });
  return res.data;
};

export const getRobotStatus = async () => {
  const res = await axios.get(`${API_BASE}/status`);
  return res.data;
};

export const executeAction = async (action) => {
  const res = await axios.post(`${API_BASE}/action`, { action });
  return res.data;
};

export const speakText = async (text) => {
  const res = await axios.post(`${API_BASE}/say`, { text });
  return res.data;
};

export const toggleLife = async (state) => {
  const res = await axios.post(`${API_BASE}/life`, { state });
  return res.data;
};

export const disconnectRobot = async () => {
  const res = await axios.post(`${API_BASE}/disconnect`);
  return res.data;
};
