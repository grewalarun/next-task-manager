import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        try {
            const stored = sessionStorage.getItem("taskflow-user");
            if (stored) {
                const value = JSON.parse(stored);
                if (value?.token) {
                    config.headers.Authorization = `Bearer ${value.token}`;
                }
            }
        } catch (error) {
            console.error("Invalid user data in storage");
        }
    }
    return config;
});

export default api;