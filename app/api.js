import axios from "axios";

// export const API_BASE_URL = "https://smart-commerce-backend.vercel.app/api";
export const API_BASE_URL = "http://localhost:5000/api";
// Function to create a role
export const createRequest = (data, url, token) => {
  return axios.post(`${API_BASE_URL}/${url}`, data, {
    headers: {
      "x-access-token": token,
    },
  });
};
// Function to update a role
export const updateRequest = (data, url, token) => {
  return axios.put(`${API_BASE_URL}/${url}`, data, {
    headers: {
      "x-access-token": token, // Add the x-access-token to the headers
    },
  });
};

// Function to delete a role
export const deleteRequest = (roleId, url, token) => {
  return axios.delete(`${API_BASE_URL}/${url}/${roleId}`, {
    headers: {
      "x-access-token": token, // Add the x-access-token to the headers
    },
  });
};

// Function to get roles (example of a GET request)
export const getRequest = (url, token) => {
  return axios.get(`${API_BASE_URL}/${url}`, {
    headers: {
      "x-access-token": token, // Add the x-access-token to the headers
    },
  });
};

export const getFilteredMembers = async (memberType, url, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/${url}/type-of-member/${memberType}`,
      {
        headers: {
          "x-access-token": token, // Add the x-access-token to the headers
        },
      }
    );
    return response.data; // Return the data directly
  } catch (error) {
    console.error("Error fetching member data:", error);
    throw new Error("Failed to fetch member data.");
  }
};
