const svelteiconifysvg = require("svelte-iconify-svg");

const rolluppluginiconifysvg = (options = {}) => {
    const { targets = [], hook = "options", commonJs = false } = options;
    return {
        name: "rolluppluginiconifysvg",
        [hook]: () => {
            targets.forEach(async (target) => {
                //? https://rollupjs.org/guide/en/#thisemitfileemittedfile-emittedchunk--emittedasset--string
                //? https://rollupjs.org/guide/en/#advanced-functionality
                let src = target.src ? (Array.isArray(target.src) ? target.src : [target.src]) : ["src"];
                let dest = target.dest;
                let svg_options = {
                    outputSVGfiles: !dest.endsWith(".js"),
                    commonJs,
                };
                svelteiconifysvg(src, dest, svg_options);
            });
        },
    };
};

module.exports = rolluppluginiconifysvg;
