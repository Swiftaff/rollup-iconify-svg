const svelteiconifysvg = require("svelte-iconify-svg");

const rolluppluginiconifysvg = (options = {}) => {
    const { targets = [], hook = "buildEnd" } = options;
    return {
        name: "rolluppluginiconifysvg",
        [hook]: () => {
            targets.forEach(async (target) => {
                let src = target.src ? (Array.isArray(target.src) ? target.src : [target.src]) : ["src"];
                let dest = target.dest;
                let save_as_files = !dest.endsWith(".js");
                svelteiconifysvg(src, dest, save_as_files);
            });
        },
    };
};

module.exports = rolluppluginiconifysvg;
