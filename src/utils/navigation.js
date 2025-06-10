// Logs out the user by removing auth token and redirecting to login page
export const handleLogout = (navigate) => {
  localStorage.removeItem('token');
  navigate('/');
};

// Functions for working with browser session storage
export const saveToSession = (key, value) => {
  sessionStorage.setItem(key, value);
};

export const getFromSession = (key) => {
  return sessionStorage.getItem(key);
};

export const removeFromSession = (key) => {
  sessionStorage.removeItem(key);
}; 