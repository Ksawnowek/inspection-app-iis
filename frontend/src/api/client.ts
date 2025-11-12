import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Lista endpointów które NIE powinny triggerować refresh
const excludedEndpoints = ['/login', '/refresh', '/register', '/logout'];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Sprawdź czy URL jest wykluczony z auto-refresh
    const isExcludedEndpoint = excludedEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );
    
    // NIE rób refresh dla:
    // - wykluczonych endpointów
    // - jeśli już próbowaliśmy
    // - jeśli nie ma 401
    if (
      !isExcludedEndpoint &&
      error.response?.status === 401 && 
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      
      try {
        await api.post("/refresh");
        return api(originalRequest);
      } catch (refreshError) {
        // Tylko przekieruj jeśli NIE jesteśmy już na /login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);