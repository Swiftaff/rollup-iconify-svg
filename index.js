import svelteiconifysvg from "svelte-iconify-svg";

const rollupiconifysvg = (options = {}) => {
    const { targets = [], hook = "buildStart" } = options;
    return {
        name: "rollupiconifysvg",
        [hook]: () => {
            targets.forEach(async (target) => {
                let src = Array.isArray(target.src) ? target.src : [target.src];
                svelteiconifysvg(src, target.dest);
            });
        },
    };
};

export default rollupiconifysvg;
