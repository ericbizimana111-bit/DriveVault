
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API.replace(/\/api$/, ''); // e.g. http://localhost:5000

export const getApiUrl = () => API;
export const getApiBase = () => API_BASE;

export async function getCsrfToken() {
    const res = await fetch(`${API}/csrf-token`, {
        method: 'GET',
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Unable to fetch CSRF token');
    const data = await res.json();
    return data.csrfToken;
}

export async function apiFetch(path, options = {}) {
    const url = path.startsWith('http') ? path : `${API}${path}`;
    const method = (options.method || 'GET').toUpperCase();

    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers
    };

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        headers['X-CSRF-Token'] = await getCsrfToken();
    }

    return fetch(url, {
        credentials: 'include',
        ...options,
        headers
    });
}


