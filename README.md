# Rollup Iconify SVG (Markup Exporter)

[![github-package.json-version](https://img.shields.io/github/package-json/v/Swiftaff/rollup-iconify-svg?style=social&logo=github)](https://github.com/Swiftaff/rollup-iconify-svg) [![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](http://opensource.org/licenses/MIT)

## Purpose

An experimental rollup plugin to run [svelte-iconify-svg](https://github.com/Swiftaff/svelte-iconify-svg)

## How it works

Checks the contents of all your files in the supplied 'src' directories for any references to 'iconify' icons.
i.e. any text in the format 'alphanumericordashes colon alphanumericordashes' such as `fa:random` or `si-glyph:pin-location-2`
It will then save a .js file which exports an `icons` object of all iconify files found in your project.

## Installation

```
npm install rollup-iconify-svg --save-dev
```

## Usage

Add to your 'rollup.config.js'

```
// ...other rollup imports

import rollupiconifysvg from "rollup-iconify-svg";

export default {

  // ...other rollup config

  plugins: [
    rollupiconifysvg({
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

### Options

-   targets: an array of options for each set of icons you wish to save. Normally just one.
-   src: either a path (string) to the folder to search, or array of paths (strings). If undefined it will default to 'src'
-   dest: the filepath (string) where you want the icons saved
-   if the dest is a directory rather than a file ending in ".js" then the plugin will run in experimental mode to save SVGs as files for embedding, instead of the default JS object. Not able to automatically style svg colours with this approach though.
-

## Usage (in svelte)

Using the svelte @html feature

```
// src/example.svelte
<script>
import { icons } from "./src/icons.js"; // this is the 'dest' file which the plugin has generated
</script>

{@html icons["fa:random"]}
```

So in this simple example above, assuming you set 'src' as the 'src' directory in the plugin, and 'src/icons.js' as the 'dest' - then the "fa:random" text above would be found by the plugin, the icon auto-generated during bundling, then displayed by svelte in the @html tag - all in one smooth step!

No more downloading svgs manually, just find the references on iconify, e.g. https://iconify.design/icon-sets/fa/random.html, and paste into your @html blocks then each icon will be generated during bundling and ready for you to use.

This obviously inlines each instance of the SVG on the page - so probably not recommended if you have hundreds of icons.

Using inline (mono) SVGs means they can inherit the colour from CSS too for easy icon colouring

## License

This project is licensed under the MIT License.
