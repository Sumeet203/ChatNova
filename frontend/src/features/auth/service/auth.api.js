import { api } from "../../../config/config";
export async function registerUser({ email, username, password }) {
    const response = await api.post('/api/auth/register', { email, username, password });
    return response.data;
}

export async function loginUser({ email, password }) {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
}

export async function getMe() {
    const response = await api.get('/api/auth/get-me');
    return response.data;
}

export async function logoutUser() {
    const response = await api.get('/api/auth/logout');
    return response.data;
}

export async function resendVerificationEmail() {
    const response = await api.get('/api/auth/resend-verification-email');
    return response.data;
}

export async function forgotPassword({ email }) {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
}

export async function verifyResetCode({ email, otp }) {
    const response = await api.post('/api/auth/verify-reset-code', { email, otp });
    return response.data;
}

export async function resetPassword({ email, otp, newPassword }) {
    const response = await api.post('/api/auth/reset-password', { email, otp, newPassword });
    return response.data;
}

