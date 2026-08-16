export const getBaseUrl = (): string => {
  const isLocal = import.meta.env.DEV || 
                  window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';
  
  return isLocal 
    ? 'http://localhost:5000' 
    : 'https://advanced-todolist-r0re.onrender.com';
};

export const Base_URL = getBaseUrl();
