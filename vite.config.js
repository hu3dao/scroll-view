import { defineConfig } from "vite"
import { createVuePlugin } from "vite-plugin-vue2"
import { resolve } from "path"
import postcssPxToViewport from "postcss-px-to-viewport"

export default defineConfig({
    plugins: [createVuePlugin()],
    build: {
        lib: {
            entry: resolve(__dirname, "packages/scroll-view/index.js"),
            name: "scroll-view",
            formats: ["es", "umd"],
            fileName: (format) => `scroll-view.${format}.js`,
        },
        rollupOptions: {
            external: ["vue"],
            output: {
                globals: {
                    vue: "Vue"
                },
            },
        }
    },
    css: {
        postcss: {
            plugins: [postcssPxToViewport({
                viewportWidth: 750,
                exclude: [/node_modules/, /\/src\/assets\//, /index.html/],
            })]
        }
    }
})