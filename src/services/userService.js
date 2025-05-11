// Add this method if it doesn't exist
getUserById: async (userId) => {
  const token = getAuthToken();
  const response = await axios.get(`${API_URL}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
},