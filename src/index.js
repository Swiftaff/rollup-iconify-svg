const svelteiconifysvg = require("svelte-iconify-svg");

const DEFAULT_SRC = "src";
const DEFAULT_DEST = "src/icons.js";

const rolluppluginiconifysvg = (options = {}) => {
    const {
        targets = [{ src: DEFAULT_SRC, dest: DEFAULT_DEST }],
        hook = "options",
        commonJs = false,
        alwaysSave = false,
        recursive = false,
        logging = true,
    } = options;
    return {
        name: "rolluppluginiconifysvg",
        [hook]: () => {
            targets.forEach(async (target) => {
                let src = target.src ? (Array.isArray(target.src) ? target.src : [target.src]) : [DEFAULT_SRC];
                let dest = target.dest || DEFAULT_DEST;
                let options = {
                    outputSVGfiles: !dest.endsWith(".js") && !dest.endsWith(".cjs") && !dest.endsWith(".mjs"),
                    commonJs,
                    alwaysSave,
                    recursive,
                    logging,
                };
                svelteiconifysvg(src, dest, options);
            });
        },
    };
};

module.exports = rolluppluginiconifysvg;
