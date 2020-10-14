<script>
  export let name;
  //import { icons } from "../public/build/icons.js";
</script>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
    color: red;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
  img,
  object {
    color: red;
  }
</style>

<main>
  <h1>Hello {name}!</h1>
  <p>
    Visit the
    <a href="https://svelte.dev/tutorial">Svelte tutorial</a>
    to learn how to build Svelte apps.
  </p>
  <!--img alt="pic" src="/build/icons/iconify#carbon-sunny#iconify" />

  <object
    type="image/svg+xml"
    title="icon"
    width="32px"
    data="/build/icons/iconify#fa-random#iconify" /-->

  <div id="testy" />
</main>
