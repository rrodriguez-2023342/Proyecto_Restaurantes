'use strict';

const RESTAURANT_ADMIN_ROLE = 'ADMIN_RESTAURANT_ROLE';
const REQUEST_TIMEOUT_MS    = 5_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const extractRoles = (payload) => {
    if (Array.isArray(payload))       return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const getAuthServiceBaseUrl = () => {
    const configured = process.env.AUTH_SERVICE_URL || process.env.AUTH_SERVICE_BASE_URL;

    if (!configured) {
        throw new Error('[auth-service] AUTH_SERVICE_URL no está configurado');
    }

    const trimmed = configured.replace(/\/+$/, '');
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
};

const getUserRolesUrl = (userId) =>
    `${getAuthServiceBaseUrl()}/users/${encodeURIComponent(userId)}/roles`;

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Consulta los roles de un usuario en el servicio de autenticación.
 * @returns {{ exists: boolean, roles: string[] }}
 */
export const getUserRolesFromAuthService = async ({ userId, token }) => {
    if (!token) {
        throw new Error('[auth-service] Token no disponible para consultar AuthService');
    }

    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(getUserRolesUrl(userId), {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'x-token':     token,
            },
            signal: controller.signal,
        });

        if (response.status === 404) {
            return { exists: false, roles: [] };
        }

        if (!response.ok) {
            const body = await response.text();
            throw new Error(
                `[auth-service] AuthService respondió ${response.status} para usuario ${userId}. ${body}`
            );
        }

        const payload = await response.json();
        return { exists: true, roles: extractRoles(payload) };

    } finally {
        clearTimeout(timeout);
    }
};

/**
 * Valida que el dueño de un restaurante exista y tenga el rol correcto.
 * @returns {{ isValid: boolean, message?: string }}
 */
export const validateRestaurantOwnerUser = async ({ ownerId, token }) => {
    const { exists, roles } = await getUserRolesFromAuthService({ userId: ownerId, token });

    if (!exists) {
        return { isValid: false, message: 'El dueño no existe en AuthService' };
    }

    if (!roles.includes(RESTAURANT_ADMIN_ROLE)) {
        return { isValid: false, message: 'El dueño debe tener rol ADMIN_RESTAURANT_ROLE' };
    }

    return { isValid: true };
};