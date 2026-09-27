// Environment-specific configuration (see .env.example)
export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
// __USE_MOCK__ is injected by vite.config.js from VITE_USE_MOCK
export const USE_MOCK = __USE_MOCK__;
export const ROUTER_MODE = import.meta.env.VITE_ROUTER_MODE || 'browser';
export const MOCK_LATENCY = Number(import.meta.env.VITE_MOCK_LATENCY ?? 220);
