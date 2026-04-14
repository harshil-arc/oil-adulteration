// Singleton connection state - survives across React Router navigations
// without needing serialization (BLE Characteristic objects can't be serialized)

let activeConnection = null;

export const getActiveConnection = () => {
  return activeConnection;
};

export const setActiveConnection = (conn) => {
  activeConnection = conn;
};

export const clearConnection = () => {
  activeConnection = null;
};
