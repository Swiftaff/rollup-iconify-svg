# rollup-plugin-iconify-svg (Markup Exporter)

[![github-package.json-version](https://img.shields.io/github/package-json/v/Swiftaff/rollup-plugin-iconify-svg?style=social&logo=github)](https://github.com/Swiftaff/rollup-plugin-iconify-svg) [![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](http://opensource.org/licenses/MIT)

## Purpose

An experimental rollup plugin to run [svelte-iconify-svg](https://github.com/Swiftaff/svelte-iconify-svg)

## Why?

If you're experimenting with variants of icons, or trying out different icon sets in your project - it takes time to find and include the right files in your template whether they are fonts or svgs or images. Yes it's greate to be able to search for icons from multiple icon sets in https://iconify.design but even then you usually need to export each icon - or use their (very nice) [JavaScript API](https://docs.iconify.design/sources/api/) to dynamically include them.

But what if you're app works offline, or is embedded, or you just don't want to call another CDN script for every page load, when you just want to try out a couple of icons.

This plugin allows you to simply type an icon reference into your app code, and the icon svg markup is then auto-embedded, assuming you have set up watch/hot-reloading and no icon-name typos!

## How it works

Checks the contents of all your files in the supplied 'src' directories for any references to 'iconify' icons.
i.e. any text in the format 'alphanumericordashes colon alphanumericordashes' such as `fa:random` or `si-glyph:pin-location-2`
It will then use the Iconify API to generate markup for each icon reference found, then the plugin simply saves a .js file which exports an `icons` object of them all, for you to use as you wish.

## Installation

```
npm i rollup-plugin-iconify-svg --save-dev
```

### Add to rollup.config.js

```
// ...other rollup imports

import rolluppluginiconifysvg from "rollup-plugin-iconify-svg";

export default {

  // ...other rollup config

  plugins: [
    rolluppluginiconifysvg({
        targets: [{ src: "src", dest: "public/build/icons.js" }],
    }),

    // ...other rollup plugins

    // If you are using watch, you may need to exclude the dest file to avoid recursive watching!
    watch: {
      clearScreen: false,
      exclude:["public/build/icons.js"]
    },

    ]
};

```

### Rollup plugin options

-   targets: an array of options for each set of icons you wish to save. Normally just one.
-   src: either a path (string) to the folder to search, or array of paths (strings). If undefined it will default to 'src'
-   dest: the filepath (string) where you want the icons saved
-   if the dest is a directory rather than a file ending in ".js" then the plugin will run in experimental mode to save SVGs as files for embedding, instead of the default JS object. Not able to automatically style svg colours with this approach though.
-

### Example usage in svelte using the @html feature

```
// src/example.svelte
<script>
import { icons } from "./src/icons.js"; // this is the 'dest' file which the plugin has generated
</script>

{@html icons["fa:random"]}
```

In this simple example above, assuming you set 'src' as the 'src' directory in the plugin, and 'src/icons.js' as the 'dest' - then the "fa:random" text above would be found by the plugin, the icon auto-generated during bundling, then displayed by svelte in the @html tag - all in one smooth step!

This obviously inlines each instance of the SVG on the page - so probably not recommended if you are using hundreds of icons.

But using inline mono SVGs (rather than via separate svg files in object or img tags or via css background-image) does mean they can inherit the colour from CSS for easy icon colouring.

## License

This project is licensed under the MIT License.
