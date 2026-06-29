export const getApiUrl = () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL_WEB ||
                 process.env.EXPO_PUBLIC_API_URL_ANDROID ||
                 process.env.EXPO_PUBLIC_API_URL_IOS;

  if (!apiUrl) {
    throw new Error('API URL not configured in .env');
  }

  return apiUrl;
};

export const getSocketUrl = () => {
  const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL_WEB ||
                    process.env.EXPO_PUBLIC_SOCKET_URL_ANDROID ||
                    process.env.EXPO_PUBLIC_SOCKET_URL_IOS;

  if (!socketUrl) {
    throw new Error('Socket URL not configured in .env');
  }

  return socketUrl;
};
