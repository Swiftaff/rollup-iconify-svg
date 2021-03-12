# rollup-plugin-iconify-svg (Markup Exporter)

[![github-package.json-version](https://img.shields.io/github/package-json/v/Swiftaff/rollup-plugin-iconify-svg?style=social&logo=github)](https://github.com/Swiftaff/rollup-plugin-iconify-svg) [![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![CircleCI](https://circleci.com/gh/Swiftaff/rollup-plugin-iconify-svg.svg?style=svg)](https://circleci.com/gh/Swiftaff/rollup-plugin-iconify-svg)

## Purpose

An experimental rollup plugin to run [svelte-iconify-svg](https://github.com/Swiftaff/svelte-iconify-svg)

If you're trying out different icons, or icon collections in your project - it takes time to find and include the right files in your template whether they are fonts or SVGs or images. Yes it's great to be able to search for icons from multiple icon sets in https://iconify.design but even then you usually need to export each icon - or use their (very nice) [Iconify API](https://docs.iconify.design/sources/api/) to dynamically include them.

But what if you're app works offline, or is embedded, or you just don't want to call another CDN script for every page load, when you just want to try out a couple of icons.

## Fast dev experience - immediately use and see Iconify icons in your app!

This plugin allows you to simply type an icon reference into your svelte app code, hit save, and reload the page to view the auto-bundled icon svg markup!

## How it works

Checks the contents of all your files in the supplied 'src' directories for any references to 'iconify' icons.
i.e. any text in the format 'alphanumericordashes colon alphanumericordashes' such as `fa:random` or `si-glyph:pin-location-2`
It then uses the [Iconify API](https://docs.iconify.design/sources/api/) to generate markup for each icon reference found, then the plugin simply saves a .js file which exports an `icons` object of them all, which gets auto-bundled into your app.

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
        targets: [{ src: "src", dest: "src/icons.js" }],
    }),

    // ...other rollup plugins

    // If you are using livereload, you may need to add a 'delay' to allow some time for the icons file to be created
    !production && livereload({ watch: "public", delay: 1000 }),

    // If you are using watch, you may need to exclude the dest file(s) to avoid recursive watching!
    watch: {
      clearScreen: false,
      exclude:["src/icons.js"]
    },

    ]
};

```

### Rollup plugin options

-   targets: an array of options for each set of icons you wish to save. Normally just one.
    -   src: either a path (string) to the folder to search, or array of paths (strings). If undefined it will default to 'src'
    -   dest: the filepath (string) where you want the icons saved
    -   if the dest is a directory rather than a file ending in ".js" then the plugin will run in experimental mode to save SVGs as files for embedding, instead of the default JS object. Not able to automatically style svg colours with this approach though.
-   commonJs: By default is false so you can easily embed your icons into svelte using ES6 import syntax, but set it to true if you wish to 'require' the file instead
-   alwaysSave: forces the iconify API network call and re-save of the icons file, instead of the default which will skip these if the icons list has not changed
-   recursive: recursively searches within each input directory, instead of the default which will only search within the first level of input directories

### Example usage in svelte using the @html feature

The simplest project would be similar to example 1 in Working Examples below

```
// ./src/App.svelte
<script>
import icons from "./src/icons.js"; // this is the 'dest' file which the plugin has generated
</script>

{@html icons["fa:random"]}
```

So in this simple example, assuming you have set 'src' as the 'src' directory and 'src/icons.js' as the 'dest' in the rollup plugin options - then

-   each time you save a file - rollup will run this plugin
-   the "fa:random" text above would be found within this App.svelte file (because it's in the src directory)
-   the icons.js file would be auto-generated during bundling
-   rollup will then reload the page and the icon would be displayed by svelte in the @html tag
-   all in one smooth step!

## Quickly adding/replacing Iconify icons...

1. Go to Iconify and search for another icon from any collection - mix-and-match as much as you like! e.g. https://iconify.design/icon-sets/?query=emoji
2. Find an icon you like, e.g. https://iconify.design/icon-sets/line-md/emoji-grin.html
3. The icon reference you need is in the format 'collection-name:icon-name'
4. So if you then add `{@html icons["line-md:emoji-grin"]}` to the App.svelte file above, hit save, your dev build will auto-refresh showing the new icon!

## Working examples

1. Clone this repo
2. Basic test: Run `npm run test_dev` and visit `localhost:5000` to build and view the first example and auto-generate the icon file `/example/src/icons.js` (like the example described above)<br />
   https://github.com/Swiftaff/rollup-plugin-iconify-svg/tree/master/example
3. More features: Run `npm run test2_dev` and visit `localhost:5001` to build the second example and auto-generate 2 icon files `/example2/src/subfolder/icons1.js` & `/example2/src/icons2.js`. This is because of the array of 2 x targets in rollup.config.js - for when you wish to generate multiple icon files for different parts of your app.<br /><br />
   https://github.com/Swiftaff/rollup-plugin-iconify-svg/tree/master/example2

    This example also shows some basic ways to colour and size your icons using CSS

    And if you see 'undefined' appearing in your UI, like in this example - you may have an icon name typo. Just check the generated icons.js file - at the top and it should list any errors, as you can see in `/example2/src/subfolder/icons1.js`.

```
/*
x ERROR no such icon prefix 'emojione-wrong:' - in these icon names ('emojione-wrong:speak-no-evil-monkey')
x ERROR no such icon name   'emojione:hear-no-evil-monkey-wrong'
*/
```

## Versions below 2.0.0

The latest version is recommended, but if you do wish to use earlier versions please note the import syntax changed from 2.0.0 onwards to the above import syntax. Earlier versions use this syntax instead...

```
import { icons }  from "./src/icons.js";
```

And if you have issues with a clean first build of your app, where it expects the icons.js file(s) to already exists and won't build because they are missing e.g. via github Actions or other automated build process, you can try this workaround to simply add a placeholder for the expected built icon file(s),

e.g. in example 1 you would add `example/src/icons.js`<br />
and for example 2, you would add these files `example2/src/subfolder/icons.js` and `example2/src/icons1.js`<br />
These placeholders can be a copy of a previously built version of the final files, or maybe just an empty export to then allow the build process to proceed and re-generate them...

```
export default = {};
```

This should be working in v2 upwards, but please report any issues.

## Notes

This plugin obviously inlines each instance of the SVG on the page - so probably not recommended if you are using hundreds of icons! But you can split them into multiple files if that helps.

Using inline mono SVGs (rather than via separate svg files in object or img tags or via css background-image) does mean they can inherit the colour from CSS for easy icon colouring :-) See example2 above

## License

This project is licensed under the MIT License.
