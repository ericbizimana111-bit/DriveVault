const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
let csrfToken = null;

export const getApiUrl = () => API;

export async function getCsrfToken() {
    const res = await fetch(`${API}/csrf-token`, {
        method: 'GET',
        credentials: 'include'
    });
    if (!res.ok) {
        throw new Error('Unable to fetch CSRF token');
    }
    const data = await res.json();
    csrfToken = data.csrfToken;
    return csrfToken;
}

export async function apiFetch(path, options = {}) {
    const url = path.startsWith('http') ? path : `${API}${path}`;
    const method = (options.method || 'GET').toUpperCase();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        // Always fetch a fresh CSRF token for mutating requests
        csrfToken = null;
        headers['X-CSRF-Token'] = await getCsrfToken();
    }

    const response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers
    });

    // If 403, token may be stale — refresh once and retry
    if (response.status === 403) {
        csrfToken = null;
        headers['X-CSRF-Token'] = await getCsrfToken();
        return fetch(url, {
            credentials: 'include',
            ...options,
            headers
        });
    }

    return response;
}