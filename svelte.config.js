import adapterStatic from "@sveltejs/adapter-static";
import { sveltePreprocess } from "svelte-preprocess";
import autoprefixer from "autoprefixer";

const preprocess = sveltePreprocess({
	postcss: {
		plugins: [autoprefixer]
	}
});

// Set this to your repository name if deploying to GitHub Pages
// e.g., '/bean-to-bar' for https://username.github.io/bean-to-bar
// Leave empty '' if deploying to a custom domain or root
const basePath = process.env.NODE_ENV === 'production' ? '/bean-to-bar' : '';

const config = {
	compilerOptions: {
		runes: true
	},
	preprocess,
	kit: {
		adapter: adapterStatic({ strict: false }),
		paths: {
			base: basePath
		}
	}
};

export default config;
