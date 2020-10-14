import svelteiconifysvg from "svelte-iconify-svg";

const rollupiconifysvg = (options = {}) => {
    const { targets = [], hook = "buildEnd" } = options;
    return {
        name: "rollupiconifysvg",
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

export default rollupiconifysvg;
