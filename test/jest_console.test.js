const rolluppluginiconifysvg = require("../src/index");
const { rollup } = require("rollup");
const path = require("path");
const del = require("del");
const VERSION_OF_SIS = "2.3.0";

//output not important in any of these tests - just testing console logging

test("test 12a fn - option logging='all' by default, not already saved", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12a.js";
    const filepath = path.join(__dirname, output);
    await del([filepath]); //only need to delete output file in test 12a

    const bundle = await rollup({
        input: "./test/fixtures/test1/test.js",
        plugins: [
            rolluppluginiconifysvg({
                targets: [{ src: "./test/fixtures/test1", dest: filepath }],
            }),
        ],
    });
    const result = await bundle.generate({ format: "cjs" });

    //stupid naming just to line up easier for readability
    let res = console.log.mock.calls;
    let ___res = console.log.mock.calls;
    let js = JSON.stringify;
    expect(___res[0][0]).toBe("\r\nsvelteiconifysvg v" + VERSION_OF_SIS);
    expect(___res[1][0]).toBe("- Found 1 file");
    expect(js(res[2][0])).toBe('[{"dir":"./test/fixtures/test1","files":["test.js"]}]');
    expect(___res[3][0]).toBe("- alwaysSave: output path doesn't exist so saving anyway");
    expect(___res[4][0]).toBe("- Generating SVG for: 'emojione:black-large-square'");
    expect(___res[5][0]).toBe("- Saved 1 of 1 icons bundle to");
});

test("test 12b fn - option logging='all' for presaved file", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12b.js";
    const filepath = path.join(__dirname, output);

    const bundle = await rollup({
        input: "./test/fixtures/test1/test.js",
        plugins: [
            rolluppluginiconifysvg({
                targets: [{ src: "./test/fixtures/test1", dest: filepath }],
                logging: "all",
            }),
        ],
    });
    const result = await bundle.generate({ format: "cjs" });

    //stupid naming just to line up easier for readability
    let res = console.log.mock.calls;
    let ___res = console.log.mock.calls;
    let js = JSON.stringify;
    expect(___res[0][0]).toBe("\r\nsvelteiconifysvg v" + VERSION_OF_SIS);
    expect(___res[1][0]).toBe("- Found 1 file");
    expect(js(res[2][0])).toBe('[{"dir":"./test/fixtures/test1","files":["test.js"]}]');
    expect(___res[3][0]).toBe("- Skipped getting & saving icons - current list is already saved");
});

test("test 12c fn - option logging=true for presaved file", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12c.js";
    const filepath = path.join(__dirname, output);

    const bundle = await rollup({
        input: "./test/fixtures/test1/test.js",
        plugins: [
            rolluppluginiconifysvg({
                targets: [{ src: "./test/fixtures/test1", dest: filepath }],
                logging: true,
            }),
        ],
    });
    const result = await bundle.generate({ format: "cjs" });

    //stupid naming just to line up easier for readability
    let res = console.log.mock.calls;
    let ___res = console.log.mock.calls;
    let js = JSON.stringify;
    expect(___res[0][0]).toBe("\r\nsvelteiconifysvg v" + VERSION_OF_SIS);
    expect(___res[1][0]).toBe("- Found 1 file");
    expect(js(res[2][0])).toBe('[{"dir":"./test/fixtures/test1","files":["test.js"]}]');
    expect(___res[3][0]).toBe("- Skipped getting & saving icons - current list is already saved");
});

test("test 12d fn - option logging='some' for presaved file", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12d.js";
    const filepath = path.join(__dirname, output);

    const bundle = await rollup({
        input: "./test/fixtures/test1/test.js",
        plugins: [
            rolluppluginiconifysvg({
                targets: [{ src: "./test/fixtures/test1", dest: filepath }],
                logging: "some",
            }),
        ],
    });
    const result = await bundle.generate({ format: "cjs" });

    //stupid naming just to line up easier for readability
    let res = console.log.mock.calls;
    let ___res = console.log.mock.calls;
    let js = JSON.stringify;
    expect(___res[0][0]).toBe("\r\nsvelteiconifysvg v" + VERSION_OF_SIS);
    expect(___res[1][0]).toBe("- Skipped getting & saving icons - current list is already saved");
});

test("test 12e fn - option logging='none' for presaved file", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12e.js";
    const filepath = path.join(__dirname, output);

    const bundle = await rollup({
        input: "./test/fixtures/test1/test.js",
        plugins: [
            rolluppluginiconifysvg({
                targets: [{ src: "./test/fixtures/test1", dest: filepath }],
                logging: "none",
            }),
        ],
    });
    const result = await bundle.generate({ format: "cjs" });

    expect(console.log.mock.calls.length).toBe(0); // i.e. no console logging
});

test("test 12f fn - option logging=false for presaved file", async () => {
    console.log = jest.fn();
    let output = "/outputs/test12/icons12f.js";
    const filepath = path.join(__dirname, output);

    const bundle = await rollup({
        input: "./test/fixtures/test1/test.js",
        plugins: [
            rolluppluginiconifysvg({
                targets: [{ src: "./test/fixtures/test1", dest: filepath }],
                logging: false,
            }),
        ],
    });
    const result = await bundle.generate({ format: "cjs" });
    expect(console.log.mock.calls.length).toBe(0); // i.e. no console logging
});
