import ky, { KyInstance } from 'ky';

export const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '/';

let globalHeaders: Record<string, string> = {};

export const api: KyInstance = ky.create({
	prefixUrl: `${API_BASE_URL}`,
	hooks: {
		beforeRequest: [
			(request) => {
				// Apply global headers
				Object.entries(globalHeaders).forEach(([key, value]) => {
					request.headers.set(key, value);
				});

				// Automatically add Authorization header if token exists in localStorage
				if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
					const token = localStorage.getItem('token');

					if (token) {
						request.headers.set('Authorization', `Bearer ${token}`);
					}
				}
			}
		]
	},
	retry: {
		limit: 2,
		methods: ['get', 'put', 'head', 'delete', 'options', 'trace']
	}
});

export const setGlobalHeaders = (headers: Record<string, string>) => {
	globalHeaders = { ...globalHeaders, ...headers };
};

export const removeGlobalHeaders = (headerKeys: string[]) => {
	headerKeys.forEach((key) => {
		delete globalHeaders[key];
	});
};

export const getGlobalHeaders = () => {
	return globalHeaders;
};

export default api;
