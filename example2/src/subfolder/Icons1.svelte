<script>
  import icons from "./icons1.js";
  let colors = ["red", "pink", "cyan"];
  let selected;
  let size = 50;
</script>

<style>
  .size1 {
    align-items: center;
    display: inline-flex;
    justify-content: center;
    max-width: 1.5rem !important;
  }
  .size2 {
    align-items: center;
    display: inline-flex;
    justify-content: center;
    max-width: 3.5rem !important;
  }
  .size3 {
    align-items: center;
    display: inline-flex;
    justify-content: center;
    max-width: 8.5rem !important;
  }
</style>

<div>
  <h2>Apply colors through CSS</h2>
  <p>But only to monochrome icons</p>
  <select bind:value={selected}>
    {#each colors as color}
      <option value={color}>{color}</option>
    {/each}
  </select>

  <div style={'color:' + selected}>

    <span class="size1">
      {@html icons['emojione:hear-no-evil-monkey']}
    </span>
    <span class="size1">
      {@html icons['emojione:speak-no-evil-monkey']}
    </span>
    <span class="size1">
      {@html icons['emojione:see-no-evil-monkey']}
    </span>
    <span class="size1">
      {@html icons['fa:random']}
    </span>
    <span class="size1">
      {@html icons['mdi:checkbox-multiple-marked']}
    </span>
    <span class="size1">
      {@html icons['ls:checkbox']}
    </span>
  </div>
  <h2>Apply sizes through CSS</h2>
  <input type="range" bind:value={size} min="20" max="100" />
  {size}
  <div>
    <span style={'display: inline-flex; width: ' + size + 'px !important;'}>
      {@html icons['whh:checkboxalt']}
    </span>
  </div>
  <div>
    <span class="size1">
      {@html icons['icomoon-free:checkbox-checked']}
    </span>
    <span class="size2">
      {@html icons['mdi:format-list-checkbox']}
    </span>
    <span class="size2">
      {@html icons['mdi:checkbox-multiple-marked-circle']}
    </span>
    <span class="size3">
      {@html icons['clarity:checkbox-list-line']}
    </span>
    <span class="size3">
      {@html icons['ri:checkbox-circle-fill']}
    </span>
  </div>
  <div>
    <h2>Deliberate errors</h2>
    {@html icons['emojione:hear-no-evil-monkey-wrong']}
    {@html icons['emojione-wrong:speak-no-evil-monkey']}
  </div>
</div>
