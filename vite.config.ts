import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// On GitHub Pages the app is served from https://<user>.github.io/handpong/,
// so production builds (and `vite preview`) need the "/handpong/" base.
// The dev server runs in development mode and stays at the root "/".
export default defineConfig(({ mode }) => ({
    base: mode === 'production' ? '/handpong/' : '/',
    plugins: [react()],
}))
