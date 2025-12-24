import http from "./http";

export const login = (data: any) => http.post("/auth/login", data);
export const register = (data: any) => http.post("/auth/onboarding", data);

export const me = () => http.get("/auth/me");