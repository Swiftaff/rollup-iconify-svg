const svelte = require("rollup-plugin-svelte");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const { terser } = require("rollup-plugin-terser");
const test = require("ava");
const { rollup } = require("rollup");
const rolluppluginiconifysvg = require("../src/index");
const withPage = require("./_withPage");

test("test1 basic", async (t) => {
    const bundle = await rollup({
        input: "./test/fixtures/test1/test.js",
        plugins: [
            rolluppluginiconifysvg({
                targets: [{ src: "./test/fixtures/test1", dest: "./test/outputs/test1.js" }],
                commonJs: true,
            }),
        ],
    });
    await bundle.generate({ format: "cjs" });
    const icons = require("./outputs/test1.js");
    t.snapshot(icons);
});

test("test2 build a svelte app", withPage, async (t, page) => {
    const bundle = await rollup({
        input: "./example/src/main.js",
        plugins: [
            rolluppluginiconifysvg({
                targets: [{ src: "example/src", dest: "example/src/icons.js" }],
            }),
            svelte(),
            nodeResolve({
                browser: true,
                dedupe: ["svelte"],
            }),
            commonjs(),
            terser(),
        ],
    });
    const output = await bundle.generate({ sourcemap: true, format: "iife" });
    let html = `<!DOCTYPE html><html lang="en"><head><title>Svelte app</title></head><body></body></html>`;
    await page.setContent(html);
    page.evaluate(output.output[0].code);
    const result = await page.content();
    t.snapshot(result);
});
