import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	server: {
		host: true,
		port: 3000,
		proxy: {
			"/api": {
				target: "https://moksha-frontend-one.vercel.app",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
		},
	},
	optimizeDeps: {
		include: ["@pbe/react-yandex-maps"],
	},
	build: {
		commonjsOptions: {
			include: [/node_modules/, /@pbe\/react-yandex-maps/],
		},
		rollupOptions: {
			output: {
				manualChunks: undefined,
			},
		},
	},
});
