import { defineConfig } from "vite"
import { createVuePlugin } from "vite-plugin-vue2"
import { resolve } from "path"
import postcssRem from "postcss-rem"

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
            plugins: [postcssRem({
                baseline: 75
            })]
        }
    }
})