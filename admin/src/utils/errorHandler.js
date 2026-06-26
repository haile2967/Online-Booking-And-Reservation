// Utility function to safely extract error messages
export const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    // Handle API error response objects
    if (error.message) {
      return error.message;
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'string') {
        return data;
      }
      if (data.title) {
        return data.title;
      }
      if (data.errors && Array.isArray(data.errors)) {
        return data.errors.join(', ');
      }
    }
    
    if (error.status) {
      return `Error ${error.status}: ${error.statusText || 'Request failed'}`;
    }
  }
  
  return 'An error occurred. Please try again.';
};

// Function to safely render error messages in React components
export const renderErrorMessage = (error) => {
  return getErrorMessage(error);
}; 