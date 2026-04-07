/**
 * Dynamically determines the backend URL based on the current environment.
 * If the app is accessed via a local IP (e.g. 192.168.1.5), 
 * it will point to the backend at that same IP on port 4000.
 */
export const getBackendUrl = () => {
  // Use environment variable if provided
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl && envUrl !== 'http://localhost:4000') {
    return envUrl;
  }

  const { hostname, protocol } = window.location;
  
  // If we are on localhost, use localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:4000';
  }

  // Otherwise, assume the backend is on the same host but port 4000
  return `${protocol}//${hostname}:4000`;
};
