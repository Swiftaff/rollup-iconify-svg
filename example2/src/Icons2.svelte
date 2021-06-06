<script>
    import icons from "./icons.js";
</script>

<div>
    <h2>Other icons from Icons2.svelte</h2>
    <div>
        <span>
            {@html icons["bx:bx-atom"]}
        </span>
        <span>
            {@html icons["mdi:weather-pouring"]}
        </span>
        <span>
            {@html icons["typcn:weather-stormy"]}
        </span>
        <span>
            {@html icons["flat-ui:weather"]}
        </span>
        <span>
            {@html icons["map:travel-agency"]}
        </span>
        <span>
            {@html icons["zondicons:travel-bus"]}
        </span>
        <span>
            {@html icons["ic:sharp-card-travel"]}
        </span>
        <span>
            {@html icons["ls:checkbox"]}
        </span>
        <span>
            {@html icons["emojione:sport-utility-vehicle"]}
        </span>
        <span>
            {@html icons["ion:car-sport-sharp"]}
        </span>
        <span>
            {@html icons["emojione-v1:sports-medal"]}
        </span>
        <span>
            {@html icons["flat-color-icons:sports-mode"]}
        </span>
        <span>
            {@html icons["jam:magic"]}
        </span>
        <span>
            {@html icons["simple-line-icons:magic-wand"]}
        </span>
    </div>
</div>

<style>
    span {
        align-items: center;
        display: inline-flex;
        justify-content: center;
        max-width: 1.5rem !important;
    }
</style>
