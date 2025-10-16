const getApiUrl = () => {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return import.meta.env.VITE_LOCAL_API;
  } else if (hostname.startsWith("192.168.") || hostname.startsWith("10.")) {
    return import.meta.env.VITE_MOBILE_API;
  } else {
    return import.meta.env.VITE_PROD_API;
  }
};

const config = {
  API_URL: getApiUrl(),
};

export default config;
