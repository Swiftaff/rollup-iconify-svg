
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35730/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.4' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /*
    x ERROR no such icon prefix 'emojione-wrong:' - in these icon names ('emojione-wrong:speak-no-evil-monkey')
    x ERROR no such icon name   'emojione:hear-no-evil-monkey-wrong'
    */

    /*
    This file was generated directly by 'https://github.com/Swiftaff/svelte-iconify-svg' 
    or via the rollup plugin 'https://github.com/Swiftaff/rollup-plugin-iconify-svg'.

    You can import this file to create an object of all 'iconify' icons which were found in your project.

    You can then include, e.g. {@html 'icons["fa:random]'} in your svelte file to display the icon.
    it's a bit hacky, and this file will get large for large amounts of icons.
    But it may be preferrable to using the standard iconify scripts to pull in the icons each time.

    You can regenerate this file using the packages named above which will check the contents of all files in the 'input' directories supplied  for any references to 'iconify' icons
    i.e. anything in quotes of the format alphanumericordashes:alphanumericordashes, e.g. "fa:random" or 'si-glyph:pin-location-2' />'
    and generate this file containine a list of those iconify icon references with their SVG markup.
    */

    var icons = {
      "clarity:checkbox-list-line": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 36 36">
<path d="M31.43 16H10v2h21.43a1 1 0 0 0 0-2z" class="clr-i-outline clr-i-outline-path-1" fill="currentColor"/><path d="M31.43 24H10v2h21.43a1 1 0 0 0 0-2z" class="clr-i-outline clr-i-outline-path-2" fill="currentColor"/><path d="M15.45 10h16a1 1 0 0 0 0-2h-14z" class="clr-i-outline clr-i-outline-path-3" fill="currentColor"/><path d="M17.5 3.42a1.09 1.09 0 0 0-1.55 0l-8.06 8.06l-3.38-3.64a1.1 1.1 0 1 0-1.61 1.5l4.94 5.3L17.5 5a1.1 1.1 0 0 0 0-1.58z" class="clr-i-outline clr-i-outline-path-4" fill="currentColor"/>
<rect x="0" y="0" width="36" height="36" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "emojione:hear-no-evil-monkey": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 64 64">
<path d="M54 27.6c0-8.6-4.7-14-11.3-16.8c1.1-.6 1.8-.9 1.8-.9c-3.1-1.1-5.7-1.8-8-2.1c1.2-1 2-1.3 2-1.3C19.3 3.5 10 16.3 10 27.6c0 2.3.6 4.4 1.5 6.4c-1 2-1.5 4.2-1.5 6.4C10 50.1 19.9 58 32 58s22-7.9 22-17.6c0-2.3-.6-4.4-1.5-6.4c.9-2 1.5-4.2 1.5-6.4" fill="#89664c"/><path d="M51 28.2c0-17-19-6.2-19-6.2s-19-10.8-19 6.2c0 4.7 2.8 9 7.1 11.7c-1.3 1.7-2 3.6-2 5.7c0 6.1 6.2 11 13.9 11s13.9-4.9 13.9-11c0-2.1-.7-4-2-5.7c4.3-2.7 7.1-7 7.1-11.7" fill="#e0ac7e"/><g fill="#3b302a"><path d="M35.1 38.7c0 1.1-.4 2.1-1 2.1s-1-.9-1-2.1c0-1.1.4-2.1 1-2.1s1 1 1 2.1"/><path d="M30.9 38.7c0 1.1-.4 2.1-1 2.1s-1-.9-1-2.1c0-1.1.4-2.1 1-2.1s1 1 1 2.1"/></g><g fill="#89664c"><path d="M51.1 40.5L49.3 62H62c-4-12-2.9-22.4-2.9-22.4l-8 .9"/><path d="M12.9 40.5L14.7 62H2c4-12 2.9-22.4 2.9-22.4l8 .9"/></g><g fill="#ffd6bb"><path d="M58.4 26.1c-1.7-4.5-4.8-8.2-6.1-6.3c-1.2 1.8.1 2-.4 4c-1 4.1 1.3 8.2.5 10.1c-4.7 11.6 1.3 12.6 3.6 11.6c4.7-1.9 4.4-14.1 2.4-19.4"/><path d="M5.6 26.1c1.7-4.5 4.8-8.2 6.1-6.3c1.2 1.8-.1 2 .4 4c1 4.1-1.3 8.2-.5 10.1c4.7 11.6-1.3 12.6-3.6 11.6c-4.7-1.9-4.4-14.1-2.4-19.4"/></g><g fill="#3b302a"><path d="M41.8 44.3c1.4 1.2-2.9 6.9-9.8 7c-6.9 0-11.3-5.8-9.8-7c.4-.3 5.2.9 9.8.9c4.7 0 9.5-1.2 9.8-.9"/><ellipse cx="40.7" cy="31.3" rx="3.5" ry="4.5"/><ellipse cx="23.3" cy="31.3" rx="3.5" ry="4.5"/></g>
<rect x="0" y="0" width="64" height="64" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "emojione:see-no-evil-monkey": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 64 64">
<circle cx="53.8" cy="33" fill="#89664c" r="8.2"/><circle cx="53.8" cy="33" fill="#ffc5d3" r="5.4"/><circle cx="10.2" cy="33" fill="#89664c" r="8.2"/><circle cx="10.2" cy="33" fill="#ffc5d3" r="5.4"/><g fill="#89664c"><path d="M43.4 10.8c1.1-.6 1.9-.9 1.9-.9c-3.2-1.1-6-1.8-8.5-2.1c1.3-1 2.1-1.3 2.1-1.3C18.5 3.6 8.8 15.5 8.8 26h46.4c-.7-7.4-4.8-12.4-11.8-15.2"/><path d="M55.3 27.6C55.3 17.9 44.9 10 32 10S8.7 17.9 8.7 27.6c0 2.3.6 4.4 1.6 6.4c-1 2-1.6 4.2-1.6 6.4C8.7 50.1 19.1 58 32 58s23.3-7.9 23.3-17.6c0-2.3-.6-4.4-1.6-6.4c1-2 1.6-4.2 1.6-6.4"/></g><path d="M52 28.2c0-16.9-20-6.1-20-6.1s-20-10.8-20 6.1c0 4.7 2.9 9 7.5 11.7c-1.3 1.7-2.1 3.6-2.1 5.7c0 6.1 6.6 11 14.7 11s14.7-4.9 14.7-11c0-2.1-.8-4-2.1-5.7c4.4-2.7 7.3-7 7.3-11.7" fill="#e0ac7e"/><g fill="#3b302a"><path d="M35.1 38.7c0 1.1-.4 2.1-1 2.1s-1-.9-1-2.1c0-1.1.4-2.1 1-2.1s1 1 1 2.1"/><path d="M30.9 38.7c0 1.1-.4 2.1-1 2.1s-1-.9-1-2.1c0-1.1.4-2.1 1-2.1s1 1 1 2.1"/><ellipse transform="rotate(-16.096 37 48.044)" cx="37" cy="48" rx="4.5" ry="2.7"/></g><path d="M9.3 32.6L2 62h11.9c-1.6-7.7 4-21 4-21l-8.6-8.4z" fill="#89664c"/><path d="M15.7 24.9s4.9-4.5 9.5-3.9c2.3.3-7.1 7.6-7.1 7.6s9.7-8.2 11.7-5.6c1.8 2.3-8.9 9.8-8.9 9.8s10-8.1 9.6-4.6C30.2 32 22.6 41 18 42c-6.6 1.3-11.8-2.9-8.3-17.5c1.8-7.4 3.5.8 6 .4" fill="#ffd6bb"/><path d="M54.7 32.6L62 62H50.1c1.6-7.7-4-21-4-21l8.6-8.4z" fill="#89664c"/><path d="M48.3 24.9s-4.9-4.5-9.5-3.9c-2.3.3 7.1 7.6 7.1 7.6s-9.7-8.2-11.7-5.6c-1.8 2.3 8.9 9.8 8.9 9.8s-10-8.1-9.7-4.6C33.8 32 41.4 41 46 42c6.6 1.3 11.8-2.9 8.3-17.5c-1.8-7.4-3.5.8-6 .4" fill="#ffd6bb"/>
<rect x="0" y="0" width="64" height="64" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "emojione:speak-no-evil-monkey": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 64 64">
<ellipse cx="53.7" cy="33" rx="8.3" ry="8.2" fill="#89664c"/><circle cx="53.7" cy="33" fill="#ffc5d3" r="5.4"/><circle cx="10.2" cy="33" fill="#89664c" r="8.2"/><circle cx="10.2" cy="33" fill="#ffc5d3" r="5.4"/><g fill="#89664c"><path d="M43.4 10.8c1.1-.6 1.9-.9 1.9-.9c-3.2-1.1-6-1.8-8.5-2.1c1.3-1 2.1-1.3 2.1-1.3C18.5 3.6 8.8 15.5 8.8 26h46.4c-.7-7.4-4.8-12.4-11.8-15.2"/><path d="M55.3 27.6C55.3 17.9 44.9 10 32 10S8.7 17.9 8.7 27.6c0 2.3.6 4.4 1.6 6.4c-1 2-1.6 4.2-1.6 6.4C8.7 50.1 19.1 58 32 58s23.3-7.9 23.3-17.6c0-2.3-.6-4.4-1.6-6.4c1-2 1.6-4.2 1.6-6.4"/></g><path d="M52 28.2c0-16.9-20-6.1-20-6.1s-20-10.8-20 6.1c0 4.7 2.9 9 7.5 11.7c-1.3 1.7-2.1 3.6-2.1 5.7c0 6.1 6.6 11 14.7 11s14.7-4.9 14.7-11c0-2.1-.8-4-2.1-5.7c4.4-2.7 7.3-7 7.3-11.7" fill="#e0ac7e"/><g fill="#3b302a"><path d="M35.1 38.7c0 1.1-.4 2.1-1 2.1s-1-.9-1-2.1c0-1.1.4-2.1 1-2.1s1 1 1 2.1"/><path d="M30.9 38.7c0 1.1-.4 2.1-1 2.1s-1-.9-1-2.1c0-1.1.4-2.1 1-2.1c.5.1 1 1 1 2.1"/><ellipse cx="40.7" cy="31.7" rx="3.5" ry="4.5"/><ellipse cx="23.3" cy="31.7" rx="3.5" ry="4.5"/></g><path fill="#89664c" d="M14.9 52L6.6 62h12.9l4-3.6z"/><path d="M20.2 43.3s4.9-4.5 9.5-3.9c2.3.3-7.1 7.6-7.1 7.6s9.7-8.2 11.7-5.6c1.8 2.3-8.9 9.8-8.9 9.8s10-8.1 9.6-4.6c-.3 3.9-7.9 12.9-12.5 13.8c-6.6 1.3-11.8-2.9-8.3-17.5c1.8-7.3 3.6.8 6 .4" fill="#ffd6bb"/><path fill="#89664c" d="M48.3 50.2L59 62H45l-2.2-2.6z"/><path d="M38.2 43.7s-6.2-2.3-10.3 0c-2 1.1 9.4 4.3 9.4 4.3s-12.1-3.9-13-.8c-.8 2.9 12 5.7 12 5.7s-12.3-3.7-10.7-.5c1.8 3.4 12.2 8.9 16.8 8c6.8-1.4-1.8-17.3-4.2-16.7" fill="#ddb199"/><path d="M39.6 43.7s-6.2-2.3-10.3 0c-2 1.1 9.4 4.3 9.4 4.3s-12.1-3.9-13-.8c-.8 2.9 12 5.7 12 5.7s-12.3-3.7-10.7-.5c1.8 3.4 12.2 8.9 16.8 8c6.6-1.3 9.8-7.2 1-19.4c-4.3-6.1-2.9 2.1-5.2 2.7" fill="#ffd6bb"/>
<rect x="0" y="0" width="64" height="64" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "fa:random": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 1792 1600">
<path d="M666 449q-60 92-137 273q-22-45-37-72.5T451.5 586t-51-56.5t-63-35T256 480H32q-14 0-23-9t-9-23V256q0-14 9-23t23-9h224q250 0 410 225zm1126 799q0 14-9 23l-320 320q-9 9-23 9q-13 0-22.5-9.5t-9.5-22.5v-192q-32 0-85 .5t-81 1t-73-1t-71-5t-64-10.5t-63-18.5t-58-28.5t-59-40t-55-53.5t-56-69.5q59-93 136-273q22 45 37 72.5t40.5 63.5t51 56.5t63 35t81.5 14.5h256V928q0-14 9-23t23-9q12 0 24 10l319 319q9 9 9 23zm0-896q0 14-9 23l-320 320q-9 9-23 9q-13 0-22.5-9.5T1408 672V480h-256q-48 0-87 15t-69 45t-51 61.5t-45 77.5q-32 62-78 171q-29 66-49.5 111t-54 105t-64 100t-74 83t-90 68.5t-106.5 42t-128 16.5H32q-14 0-23-9t-9-23v-192q0-14 9-23t23-9h224q48 0 87-15t69-45t51-61.5t45-77.5q32-62 78-171q29-66 49.5-111t54-105t64-100t74-83t90-68.5t106.5-42t128-16.5h256V32q0-14 9-23t23-9q12 0 24 10l319 319q9 9 9 23z" fill="currentColor"/>
<rect x="0" y="0" width="1792" height="1600" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "icomoon-free:checkbox-checked": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 16 16">
<path d="M14 0H2C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zM7 12.414L3.293 8.707l1.414-1.414L7 9.586l4.793-4.793l1.414 1.414L7 12.414z" fill="currentColor"/>
<rect x="0" y="0" width="16" height="16" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "ls:checkbox": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 700 677">
<path d="M517 480l74-106v303H0V87h476l-51 74H74v442l443 1V480zm66-449L347 372L182 250L99 365l280 214l321-461z" fill="currentColor"/>
<rect x="0" y="0" width="700" height="677" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "mdi:checkbox-multiple-marked": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 24 24">
<path d="M22 16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2h12a2 2 0 0 1 2 2v12m-6 4v2H4a2 2 0 0 1-2-2V7h2v13h12m-3-6l7-7l-1.41-1.41L13 11.17L9.91 8.09L8.5 9.5L13 14z" fill="currentColor"/>
<rect x="0" y="0" width="24" height="24" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "mdi:checkbox-multiple-marked-circle": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 24 24">
<path d="M14 2a8 8 0 0 0-8 8a8 8 0 0 0 8 8a8 8 0 0 0 8-8a8 8 0 0 0-8-8M4.93 5.82A8.01 8.01 0 0 0 2 12a8 8 0 0 0 8 8c.64 0 1.27-.08 1.88-.23c-1.76-.39-3.38-1.27-4.71-2.48A6.001 6.001 0 0 1 4 12c0-.3.03-.59.07-.89C4.03 10.74 4 10.37 4 10c0-1.44.32-2.87.93-4.18m13.16.26L19.5 7.5L13 14l-3.79-3.79l1.42-1.42L13 11.17" fill="currentColor"/>
<rect x="0" y="0" width="24" height="24" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "mdi:format-list-checkbox": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 24 24">
<path d="M21 19v-2H8v2h13m0-6v-2H8v2h13M8 7h13V5H8v2M4 5v2h2V5H4M3 5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5m1 6v2h2v-2H4m-1 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2m1 6v2h2v-2H4m-1 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2z" fill="currentColor"/>
<rect x="0" y="0" width="24" height="24" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "ri:checkbox-circle-fill": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 24 24">
<path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10zm-.997-6l7.07-7.071l-1.414-1.414l-5.656 5.657l-2.829-2.829l-1.414 1.414L11.003 16z" fill="currentColor"/>
<rect x="0" y="0" width="24" height="24" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "whh:checkboxalt": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 1025 1023">
<path d="M896.428 1023h-768q-53 0-90.5-37.5T.428 895V127q0-53 37.5-90t90.5-37h768q53 0 90.5 37t37.5 90v768q0 53-37.5 90.5t-90.5 37.5zm0-832q0-26-18.5-45t-45.5-19h-640q-27 0-45.5 19t-18.5 45v640q0 27 18.5 45.5t45.5 18.5h640q27 0 45.5-18.5t18.5-45.5V191zm-290 320l142 142q20 20 20 47.5t-19.5 46.5t-47 19t-47.5-19l-142-142l-142 143q-20 19-47 19t-46.5-19.5t-19.5-47t19-46.5l143-143l-144-143q-19-20-19-47.5t19-46.5t46.5-19t47.5 19l143 144l144-144q19-19 46.5-19t47 19.5t19.5 47t-20 46.5z" fill="currentColor"/>
<rect x="0" y="0" width="1025" height="1023" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        };

    /* example2\src\subfolder\Icons1.svelte generated by Svelte v3.29.4 */
    const file = "example2\\src\\subfolder\\Icons1.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (33:4) {#each colors as color}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*color*/ ctx[5] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*color*/ ctx[5];
    			option.value = option.__value;
    			add_location(option, file, 33, 6, 713);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(33:4) {#each colors as color}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div4;
    	let h20;
    	let t1;
    	let p;
    	let t3;
    	let select;
    	let t4;
    	let div0;
    	let span0;
    	let raw0_value = icons["emojione:hear-no-evil-monkey"] + "";
    	let t5;
    	let span1;
    	let raw1_value = icons["emojione:speak-no-evil-monkey"] + "";
    	let t6;
    	let span2;
    	let raw2_value = icons["emojione:see-no-evil-monkey"] + "";
    	let t7;
    	let span3;
    	let raw3_value = icons["fa:random"] + "";
    	let t8;
    	let span4;
    	let raw4_value = icons["mdi:checkbox-multiple-marked"] + "";
    	let t9;
    	let span5;
    	let raw5_value = icons["ls:checkbox"] + "";
    	let div0_style_value;
    	let t10;
    	let h21;
    	let t12;
    	let input;
    	let t13;
    	let t14;
    	let t15;
    	let div1;
    	let span6;
    	let raw6_value = icons["whh:checkboxalt"] + "";
    	let span6_style_value;
    	let t16;
    	let div2;
    	let span7;
    	let raw7_value = icons["icomoon-free:checkbox-checked"] + "";
    	let t17;
    	let span8;
    	let raw8_value = icons["mdi:format-list-checkbox"] + "";
    	let t18;
    	let span9;
    	let raw9_value = icons["mdi:checkbox-multiple-marked-circle"] + "";
    	let t19;
    	let span10;
    	let raw10_value = icons["clarity:checkbox-list-line"] + "";
    	let t20;
    	let span11;
    	let raw11_value = icons["ri:checkbox-circle-fill"] + "";
    	let t21;
    	let div3;
    	let h22;
    	let t23;
    	let html_tag;
    	let raw12_value = icons["emojione:hear-no-evil-monkey-wrong"] + "";
    	let t24;
    	let html_tag_1;
    	let raw13_value = icons["emojione-wrong:speak-no-evil-monkey"] + "";
    	let mounted;
    	let dispose;
    	let each_value = /*colors*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Apply colors through CSS";
    			t1 = space();
    			p = element("p");
    			p.textContent = "But only to monochrome icons";
    			t3 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div0 = element("div");
    			span0 = element("span");
    			t5 = space();
    			span1 = element("span");
    			t6 = space();
    			span2 = element("span");
    			t7 = space();
    			span3 = element("span");
    			t8 = space();
    			span4 = element("span");
    			t9 = space();
    			span5 = element("span");
    			t10 = space();
    			h21 = element("h2");
    			h21.textContent = "Apply sizes through CSS";
    			t12 = space();
    			input = element("input");
    			t13 = space();
    			t14 = text(/*size*/ ctx[1]);
    			t15 = space();
    			div1 = element("div");
    			span6 = element("span");
    			t16 = space();
    			div2 = element("div");
    			span7 = element("span");
    			t17 = space();
    			span8 = element("span");
    			t18 = space();
    			span9 = element("span");
    			t19 = space();
    			span10 = element("span");
    			t20 = space();
    			span11 = element("span");
    			t21 = space();
    			div3 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Deliberate errors";
    			t23 = space();
    			t24 = space();
    			add_location(h20, file, 29, 2, 570);
    			add_location(p, file, 30, 2, 607);
    			if (/*selected*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file, 31, 2, 646);
    			attr_dev(span0, "class", "size1 svelte-ehkg0e");
    			add_location(span0, file, 39, 4, 824);
    			attr_dev(span1, "class", "size1 svelte-ehkg0e");
    			add_location(span1, file, 42, 4, 916);
    			attr_dev(span2, "class", "size1 svelte-ehkg0e");
    			add_location(span2, file, 45, 4, 1009);
    			attr_dev(span3, "class", "size1 svelte-ehkg0e");
    			add_location(span3, file, 48, 4, 1100);
    			attr_dev(span4, "class", "size1 svelte-ehkg0e");
    			add_location(span4, file, 51, 4, 1173);
    			attr_dev(span5, "class", "size1 svelte-ehkg0e");
    			add_location(span5, file, 54, 4, 1265);
    			attr_dev(div0, "style", div0_style_value = "color:" + /*selected*/ ctx[0]);
    			add_location(div0, file, 37, 2, 783);
    			add_location(h21, file, 58, 2, 1348);
    			attr_dev(input, "type", "range");
    			attr_dev(input, "min", "20");
    			attr_dev(input, "max", "100");
    			add_location(input, file, 59, 2, 1384);
    			attr_dev(span6, "style", span6_style_value = "display: inline-flex; width: " + /*size*/ ctx[1] + "px !important;");
    			add_location(span6, file, 62, 4, 1468);
    			add_location(div1, file, 61, 2, 1457);
    			attr_dev(span7, "class", "size1 svelte-ehkg0e");
    			add_location(span7, file, 67, 4, 1618);
    			attr_dev(span8, "class", "size2 svelte-ehkg0e");
    			add_location(span8, file, 70, 4, 1711);
    			attr_dev(span9, "class", "size2 svelte-ehkg0e");
    			add_location(span9, file, 73, 4, 1799);
    			attr_dev(span10, "class", "size3 svelte-ehkg0e");
    			add_location(span10, file, 76, 4, 1898);
    			attr_dev(span11, "class", "size3 svelte-ehkg0e");
    			add_location(span11, file, 79, 4, 1988);
    			add_location(div2, file, 66, 2, 1607);
    			add_location(h22, file, 84, 4, 2094);
    			html_tag = new HtmlTag(t24);
    			html_tag_1 = new HtmlTag(null);
    			add_location(div3, file, 83, 2, 2083);
    			add_location(div4, file, 28, 0, 561);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h20);
    			append_dev(div4, t1);
    			append_dev(div4, p);
    			append_dev(div4, t3);
    			append_dev(div4, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*selected*/ ctx[0]);
    			append_dev(div4, t4);
    			append_dev(div4, div0);
    			append_dev(div0, span0);
    			span0.innerHTML = raw0_value;
    			append_dev(div0, t5);
    			append_dev(div0, span1);
    			span1.innerHTML = raw1_value;
    			append_dev(div0, t6);
    			append_dev(div0, span2);
    			span2.innerHTML = raw2_value;
    			append_dev(div0, t7);
    			append_dev(div0, span3);
    			span3.innerHTML = raw3_value;
    			append_dev(div0, t8);
    			append_dev(div0, span4);
    			span4.innerHTML = raw4_value;
    			append_dev(div0, t9);
    			append_dev(div0, span5);
    			span5.innerHTML = raw5_value;
    			append_dev(div4, t10);
    			append_dev(div4, h21);
    			append_dev(div4, t12);
    			append_dev(div4, input);
    			set_input_value(input, /*size*/ ctx[1]);
    			append_dev(div4, t13);
    			append_dev(div4, t14);
    			append_dev(div4, t15);
    			append_dev(div4, div1);
    			append_dev(div1, span6);
    			span6.innerHTML = raw6_value;
    			append_dev(div4, t16);
    			append_dev(div4, div2);
    			append_dev(div2, span7);
    			span7.innerHTML = raw7_value;
    			append_dev(div2, t17);
    			append_dev(div2, span8);
    			span8.innerHTML = raw8_value;
    			append_dev(div2, t18);
    			append_dev(div2, span9);
    			span9.innerHTML = raw9_value;
    			append_dev(div2, t19);
    			append_dev(div2, span10);
    			span10.innerHTML = raw10_value;
    			append_dev(div2, t20);
    			append_dev(div2, span11);
    			span11.innerHTML = raw11_value;
    			append_dev(div4, t21);
    			append_dev(div4, div3);
    			append_dev(div3, h22);
    			append_dev(div3, t23);
    			html_tag.m(raw12_value, div3);
    			append_dev(div3, t24);
    			html_tag_1.m(raw13_value, div3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[3]),
    					listen_dev(input, "change", /*input_change_input_handler*/ ctx[4]),
    					listen_dev(input, "input", /*input_change_input_handler*/ ctx[4])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*colors*/ 4) {
    				each_value = /*colors*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selected, colors*/ 5) {
    				select_option(select, /*selected*/ ctx[0]);
    			}

    			if (dirty & /*selected, colors*/ 5 && div0_style_value !== (div0_style_value = "color:" + /*selected*/ ctx[0])) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (dirty & /*size*/ 2) {
    				set_input_value(input, /*size*/ ctx[1]);
    			}

    			if (dirty & /*size*/ 2) set_data_dev(t14, /*size*/ ctx[1]);

    			if (dirty & /*size*/ 2 && span6_style_value !== (span6_style_value = "display: inline-flex; width: " + /*size*/ ctx[1] + "px !important;")) {
    				attr_dev(span6, "style", span6_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Icons1", slots, []);
    	let colors = ["red", "pink", "cyan"];
    	let selected;
    	let size = 50;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icons1> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(0, selected);
    		$$invalidate(2, colors);
    	}

    	function input_change_input_handler() {
    		size = to_number(this.value);
    		$$invalidate(1, size);
    	}

    	$$self.$capture_state = () => ({ icons, colors, selected, size });

    	$$self.$inject_state = $$props => {
    		if ("colors" in $$props) $$invalidate(2, colors = $$props.colors);
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, size, colors, select_change_handler, input_change_input_handler];
    }

    class Icons1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icons1",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /*
    This file was generated directly by 'https://github.com/Swiftaff/svelte-iconify-svg' 
    or via the rollup plugin 'https://github.com/Swiftaff/rollup-plugin-iconify-svg'.

    You can import this file to create an object of all 'iconify' icons which were found in your project.

    You can then include, e.g. {@html 'icons["fa:random]'} in your svelte file to display the icon.
    it's a bit hacky, and this file will get large for large amounts of icons.
    But it may be preferrable to using the standard iconify scripts to pull in the icons each time.

    You can regenerate this file using the packages named above which will check the contents of all files in the 'input' directories supplied  for any references to 'iconify' icons
    i.e. anything in quotes of the format alphanumericordashes:alphanumericordashes, e.g. "fa:random" or 'si-glyph:pin-location-2' />'
    and generate this file containine a list of those iconify icon references with their SVG markup.
    */

    var icons$1 = {
      "bx:bx-atom": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 24 24">
<path d="M3.102 20.898c.698.699 1.696 1.068 2.887 1.068c1.742 0 3.855-.778 6.012-2.127c2.156 1.35 4.27 2.127 6.012 2.127c1.19 0 2.188-.369 2.887-1.068c1.269-1.269 1.411-3.413.401-6.039c-.358-.932-.854-1.895-1.457-2.859a16.792 16.792 0 0 0 1.457-2.859c1.01-2.626.867-4.771-.401-6.039c-.698-.699-1.696-1.068-2.887-1.068c-1.742 0-3.855.778-6.012 2.127c-2.156-1.35-4.27-2.127-6.012-2.127c-1.19 0-2.188.369-2.887 1.068C1.833 4.371 1.69 6.515 2.7 9.141c.359.932.854 1.895 1.457 2.859A16.792 16.792 0 0 0 2.7 14.859c-1.01 2.626-.867 4.77.402 6.039zm16.331-5.321c.689 1.79.708 3.251.052 3.907c-.32.32-.815.482-1.473.482c-1.167 0-2.646-.503-4.208-1.38a26.611 26.611 0 0 0 4.783-4.784c.336.601.623 1.196.846 1.775zM12 17.417a23.568 23.568 0 0 1-2.934-2.483A23.998 23.998 0 0 1 6.566 12A23.74 23.74 0 0 1 12 6.583a23.568 23.568 0 0 1 2.934 2.483a23.998 23.998 0 0 1 2.5 2.934A23.74 23.74 0 0 1 12 17.417zm6.012-13.383c.657 0 1.152.162 1.473.482c.656.656.638 2.117-.052 3.907c-.223.579-.51 1.174-.846 1.775a26.448 26.448 0 0 0-4.783-4.784c1.562-.876 3.041-1.38 4.208-1.38zM4.567 8.423c-.689-1.79-.708-3.251-.052-3.907c.32-.32.815-.482 1.473-.482c1.167 0 2.646.503 4.208 1.38a26.448 26.448 0 0 0-4.783 4.784a13.934 13.934 0 0 1-.846-1.775zm0 7.154c.223-.579.51-1.174.846-1.775a26.448 26.448 0 0 0 4.783 4.784c-1.563.877-3.041 1.38-4.208 1.38c-.657 0-1.152-.162-1.473-.482c-.656-.656-.637-2.117.052-3.907z" fill="currentColor"/><circle cx="12" cy="12" r="2.574" fill="currentColor"/>
<rect x="0" y="0" width="24" height="24" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "emojione-v1:sports-medal": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 64 64">
<path fill="#186193" d="M50.713-.037l-16.07 49.34h4.02l16.07-49.34z"/><path fill="#d1d3d4" d="M46.691-.037l-16.06 49.34h4.02l16.07-49.34z"/><path fill="#c41c5c" d="M42.489-.037l-16.06 49.34h4.202l16.06-49.34z"/><path fill="#1c75bc" d="M9.844-.037l16.07 49.34h4.02L13.864-.037z"/><path fill="#e6e7e8" d="M13.863-.037l16.07 49.34h4.02L17.883-.037z"/><path fill="#da1c5c" d="M17.883-.037l16.07 49.34h4.201L22.094-.037z"/><path fill="#f7941e" d="M44.38 51.19c0 6.894-5.587 12.48-12.479 12.48c-6.891 0-12.478-5.587-12.478-12.48c0-6.889 5.586-12.478 12.478-12.478c6.892 0 12.479 5.589 12.479 12.478"/><path fill="#f2a755" d="M41.45 51.19a9.55 9.55 0 0 1-9.553 9.554c-5.275 0-9.551-4.275-9.551-9.554c0-5.273 4.276-9.552 9.551-9.552a9.551 9.551 0 0 1 9.553 9.552"/><g fill="#e29850"><path d="M25.462 54.11l-.338-.742c.813-.004 1.86.847 2.726 1.721c-1.526-3.363-.8-4.229-.755-4.275l.519.668c-.012.012-1.07 1.273 2.899 7.497h-.002c.12.196.132.395.025.444c-.107.053-.297-.065-.421-.262a.286.286 0 0 1-.035-.064h-.006a41.811 41.811 0 0 1-1.503-2.552c-.622-.741-2.156-2.439-3.109-2.435"/><path d="M25.796 53.691s-.173-.651-.717-.878c-.545-.229-1.227.303-1.365.658l.074.11s.149-.043.67.587c.519.629 1.161.03 1.161.03l.241-.073l.215-.101l-.279-.333"/><path d="M27.05 51.829s-.707-.62-.614-1.308c.089-.684 1.239-.977 1.783-.857l.093.144s-.163.116.275 1.058c.439.942-.767 1.146-.767 1.146l-.262.184l-.284.137l-.224-.504"/><path d="M26.941 55.55l-.194-.45c.546-.029 1.212.466 1.752.98c-.876-2.043-.35-2.605-.319-2.635l.321.398c-.01.01-.775.829 1.613 4.568h-.004c.078.117.076.239 0 .276c-.074.035-.196-.033-.271-.151c-.008-.012-.016-.023-.02-.037h-.004a22.321 22.321 0 0 1-.896-1.536c-.383-.44-1.337-1.445-1.978-1.413"/><path d="M27.18 55.27s-.087-.396-.441-.521c-.355-.124-.837.229-.943.456l.042.068s.105-.035.423.34c.322.375.777-.021.777-.021l.167-.051l.149-.073l-.174-.198"/><path d="M28.11 54.08s-.448-.363-.357-.79c.089-.432.874-.652 1.233-.596l.058.083s-.115.081.138.652s-.563.738-.563.738l-.185.124l-.196.095l-.128-.306"/><path d="M24.2 51.3l-.27-.567c.579.023 1.357.691 2 1.375c-1.211-2.575-.73-3.204-.699-3.237l.395.519c-.006.008-.713.925 2.348 5.725h-.002c.095.151.11.301.037.338c-.078.035-.215-.059-.312-.212a.213.213 0 0 1-.025-.05l-.004.002a35.991 35.991 0 0 1-1.165-1.966c-.472-.58-1.626-1.9-2.305-1.927"/><path d="M24.421 50.994s-.149-.495-.543-.682c-.396-.19-.86.19-.942.454l.054.085s.107-.028.499.463c.393.487.824.058.824.058l.17-.05l.15-.072l-.212-.256"/><path d="M25.24 49.627s-.526-.487-.487-.998c.035-.515.843-.701 1.231-.597l.072.113s-.109.081.239.804c.348.721-.501.839-.501.839l-.179.13l-.194.095l-.181-.386"/><path d="M38.34 53.998l.338-.742c-.813-.004-1.86.849-2.727 1.723c1.526-3.365.801-4.231.756-4.276l-.519.668c.01.012 1.069 1.274-2.899 7.498h.002c-.12.194-.132.394-.025.442c.107.055.298-.064.422-.26a.352.352 0 0 0 .035-.066h.006a40.116 40.116 0 0 0 1.501-2.552c.623-.742 2.155-2.439 3.11-2.435"/><path d="M38 53.57s.173-.648.717-.878c.546-.227 1.227.306 1.365.661l-.074.108s-.149-.043-.67.586c-.519.632-1.161.031-1.161.031l-.241-.071l-.215-.104l.279-.333"/><path d="M36.752 51.714s.706-.621.613-1.307c-.09-.686-1.239-.977-1.783-.86l-.093.144s.163.119-.275 1.061c-.439.939.767 1.146.767 1.146l.263.185l.283.136l.225-.505"/><path d="M36.856 55.44l.194-.45c-.546-.027-1.212.466-1.752.982c.876-2.043.35-2.605.316-2.637l-.318.399c.01.008.775.827-1.613 4.569l.004-.002c-.078.116-.076.241 0 .275c.073.035.196-.03.271-.149c.008-.014.016-.025.02-.036h.004a22.32 22.32 0 0 0 .896-1.538c.384-.439 1.338-1.445 1.978-1.413"/><path d="M36.613 55.16s.088-.398.441-.522c.355-.122.837.23.943.458l-.043.066s-.104-.033-.423.342c-.322.374-.776-.021-.776-.021l-.168-.053l-.149-.071l.175-.199"/><path d="M35.691 53.963s.448-.365.357-.792c-.09-.432-.874-.651-1.235-.595l-.057.084s.115.079-.14.65c-.25.57.565.737.565.737l.185.125l.196.097l.129-.306"/><path d="M39.599 51.18l.27-.566c-.581.021-1.359.691-2 1.375c1.212-2.577.728-3.206.699-3.237l-.395.517c.006.01.713.926-2.348 5.727l.002-.002c-.095.153-.11.303-.037.338c.076.035.216-.059.312-.21c.008-.016.02-.033.025-.051c0 0 .004 0 .004.002c.466-.735.849-1.386 1.165-1.967c.472-.579 1.625-1.901 2.305-1.926"/><path d="M39.38 50.879s.149-.497.542-.684c.397-.188.862.19.943.455l-.055.085s-.106-.027-.499.462c-.392.49-.823.059-.823.059l-.171-.049l-.149-.071l.212-.257"/><path d="M38.56 49.51s.526-.487.487-.998c-.035-.515-.843-.7-1.231-.598l-.071.112s.108.084-.239.804c-.348.723.501.84.501.84l.179.132l.194.093l.18-.385"/></g>
<rect x="0" y="0" width="64" height="64" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "emojione:sport-utility-vehicle": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 64 64">
<path d="M61.2 41.1c.1.5-.2 1-.6 1.1l-2.1.4l-2.1-12.2l1.8-.2c.5-.1 1 .2 1.1.7l1.9 10.2" fill="#3e4347"/><path d="M56.3 27.7s1.3-.5 1.3-2.7H33.7c-2.1 0-4.8-.1-7.2 4.5c-2.1 3.9-5.3 8.1-5.4 8.2c-12.4 0-15.4 6.7-16.2 7.5c-1.3 1.3-.9 9.4-.9 9.4h53.6s2.6 0 2.6-4.1c-.1-4.2-3.9-22.8-3.9-22.8" fill="#42ade2"/><g fill="#3e4347"><path d="M5.8 55.5c0 .5-.4.9-.9.9h-2c-.5 0-.9-.4-.9-.9v-4.6c0-.5.4-.9.9-.9h1.9c.5 0 .9.4.9.9l.1 4.6"/><path d="M38.9 55.5c0 .5-.4.9-.9.9H26c-.5 0-.9-.4-.9-.9v-1.8c0-.5.4-.9.9-.9h12c.5 0 .9.4.9.9v1.8"/><path d="M62 55.5c0 .5-.4.9-.9.9h-1.9c-.5 0-.9-.4-.9-.9V50c0-.5.4-.9.9-.9h1.9c.5 0 .9.4.9.9v5.5"/></g><g fill="#b4d7ee"><path d="M16.1 44.7c3.7 0 6.9 2.2 8.5 5.4c-.8-4.2-4.3-7.4-8.5-7.4s-7.7 3.2-8.5 7.4c1.6-3.3 4.8-5.4 8.5-5.4"/><path d="M47.9 44.7c3.7 0 6.8 2.2 8.4 5.4c-.7-4.2-4.2-7.4-8.4-7.4s-7.7 3.2-8.4 7.4c1.6-3.3 4.8-5.4 8.4-5.4"/></g><path d="M3.9 49.1s0-2.5.5-3c.5-.6 1.8-.8 3-.6c.9.2-.5 2.6-3.5 3.6" fill="#d6eef0"/><g fill="#3e4347"><path d="M41.7 38.2c0 .7.5 1.2 1.1 1.2H52c.6 0 1-.5.9-1.2l-1.6-8.6c-.1-.7-.7-1.2-1.3-1.2h-7.2c-.6 0-1.1.5-1.1 1.2v8.6"/><path d="M39.5 29.6c0-.7-.5-1.2-1.1-1.2h-6.1c-.6 0-1.3.5-1.6 1.1l-4.5 8.9c-.3.6 0 1.1.6 1.1h11.6c.6 0 1.1-.5 1.1-1.2v-8.7"/><ellipse cx="16.1" cy="53.7" rx="8.4" ry="8.3"/></g><ellipse cx="16.1" cy="53.7" rx="4.8" ry="4.7" fill="#e8e8e8"/><g fill="#3e4347"><path d="M17.2 51.4c-.2.6-.7 1.1-1.1 1.1s-.9-.5-1.1-1.1v-.1c-.2-.6.3-1.1 1.2-1.1c.7 0 1.2.5 1 1.2"/><path d="M14.6 51.6c.5.5.7 1.2.4 1.5c-.2.4-.9.5-1.6.4h-.1c-.7-.1-.9-.8-.4-1.6c.5-.7 1.2-.9 1.7-.3"/><path d="M13.4 53.9c.7-.1 1.4 0 1.6.4c.2.4 0 1.1-.4 1.5l-.1.1c-.5.5-1.2.3-1.6-.4c-.4-.7-.2-1.4.5-1.6"/><path d="M14.9 56c.2-.6.7-1.1 1.1-1.1s.9.5 1.1 1.1v.1c.2.6-.3 1.1-1.2 1.1c-.7.1-1.2-.5-1-1.2"/><path d="M17.5 55.8c-.5-.5-.7-1.2-.4-1.5c.2-.4.9-.5 1.6-.4h.1c.7.1.9.8.4 1.6c-.4.7-1.1.9-1.7.3"/><path d="M18.7 53.5c-.7.1-1.4 0-1.6-.4c-.2-.4 0-1.1.4-1.5l.1-.1c.5-.5 1.2-.3 1.6.4c.4.7.2 1.4-.5 1.6"/></g><g fill="#e8e8e8"><path d="M18.7 57l-1.1.6l-4.2-7.2l1.1-.6z"/><path d="M11.8 53.1h8.4v1.2h-8.4z"/><path d="M17.6 49.8l1.1.6l-4.2 7.2l-1.1-.6z"/></g><ellipse cx="47.9" cy="53.7" rx="8.4" ry="8.3" fill="#3e4347"/><ellipse cx="47.9" cy="53.7" rx="4.8" ry="4.7" fill="#e8e8e8"/><g fill="#3e4347"><path d="M49.1 51.4c-.2.6-.7 1.1-1.1 1.1s-1-.5-1.2-1.1v-.1c-.2-.6.3-1.1 1.2-1.1c.8 0 1.3.5 1.1 1.2"/><path d="M46.5 51.6c.5.5.7 1.2.4 1.5c-.2.4-.9.5-1.6.4h-.1c-.7-.1-.9-.8-.4-1.6c.4-.7 1.1-.9 1.7-.3"/><path d="M45.3 53.9c.7-.1 1.4 0 1.6.4c.2.4 0 1.1-.4 1.5l-.1.1c-.5.5-1.2.3-1.6-.4c-.4-.7-.2-1.4.5-1.6"/><path d="M46.8 56c.2-.6.7-1.1 1.1-1.1s.9.5 1.1 1.1v.1c.2.6-.3 1.1-1.2 1.1c-.7.1-1.2-.5-1-1.2"/><path d="M49.4 55.8c-.5-.5-.7-1.2-.4-1.5c.2-.4.9-.5 1.6-.4h.1c.7.1.9.8.4 1.6c-.5.7-1.2.9-1.7.3"/><path d="M50.6 53.5c-.7.1-1.4 0-1.6-.4c-.2-.4 0-1.1.4-1.5l.1-.1c.5-.5 1.2-.3 1.6.4c.4.7.2 1.4-.5 1.6"/></g><g fill="#e8e8e8"><path d="M50.6 57l-1.1.6l-4.2-7.2l1.1-.6z"/><path d="M43.7 53.1h8.4v1.2h-8.4z"/><path d="M49.5 49.8l1.1.6l-4.2 7.2l-1.1-.6z"/></g><g fill="#3e4347"><path d="M37.7 21s-2.1 1-2.1 4h2.1s-.2-2.6 1.9-4h-1.9"/><path d="M49.6 21s2.1 1 2.1 4h-2.1s.2-2.6-1.9-4h1.9"/><path d="M34.5 22h18.1c1.5 0 1.5-2 0-2H34.5c-1.5 0-1.5 2 0 2"/></g>
<rect x="0" y="0" width="64" height="64" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "fa:random": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 1792 1600">
<path d="M666 449q-60 92-137 273q-22-45-37-72.5T451.5 586t-51-56.5t-63-35T256 480H32q-14 0-23-9t-9-23V256q0-14 9-23t23-9h224q250 0 410 225zm1126 799q0 14-9 23l-320 320q-9 9-23 9q-13 0-22.5-9.5t-9.5-22.5v-192q-32 0-85 .5t-81 1t-73-1t-71-5t-64-10.5t-63-18.5t-58-28.5t-59-40t-55-53.5t-56-69.5q59-93 136-273q22 45 37 72.5t40.5 63.5t51 56.5t63 35t81.5 14.5h256V928q0-14 9-23t23-9q12 0 24 10l319 319q9 9 9 23zm0-896q0 14-9 23l-320 320q-9 9-23 9q-13 0-22.5-9.5T1408 672V480h-256q-48 0-87 15t-69 45t-51 61.5t-45 77.5q-32 62-78 171q-29 66-49.5 111t-54 105t-64 100t-74 83t-90 68.5t-106.5 42t-128 16.5H32q-14 0-23-9t-9-23v-192q0-14 9-23t23-9h224q48 0 87-15t69-45t51-61.5t45-77.5q32-62 78-171q29-66 49.5-111t54-105t64-100t74-83t90-68.5t106.5-42t128-16.5h256V32q0-14 9-23t23-9q12 0 24 10l319 319q9 9 9 23z" fill="currentColor"/>
<rect x="0" y="0" width="1792" height="1600" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "flat-color-icons:sports-mode": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 48 48">
<circle fill="#FF9800" cx="28" cy="9" r="5"/><path fill="#00796B" d="M29 27.3l-9.2-4.1c-1-.5-1.5 1-2 2s-4.1 7.2-3.8 8.3c.3.9 1.1 1.4 1.9 1.4c.2 0 .4 0 .6-.1L28.8 31c.8-.2 1.4-1 1.4-1.8s-.5-1.6-1.2-1.9z"/><path fill="#009688" d="M26.8 15.2l-2.2-1c-1.3-.6-2.9 0-3.5 1.3L9.2 41.1c-.5 1 0 2.2 1 2.7c.3.1.6.2.9.2c.8 0 1.5-.4 1.8-1.1c0 0 9.6-13.3 10.4-14.9s4.9-9.3 4.9-9.3c.5-1.3 0-2.9-1.4-3.5z"/><path fill="#FF9800" d="M40.5 15.7c-.7-.8-2-1-2.8-.3l-5 4.2l-6.4-3.5c-1.1-.6-2.6-.4-3.3.9c-.8 1.3-.4 2.9.8 3.4l8.3 3.4c.3.1.6.2.9.2c.5 0 .9-.2 1.3-.5l6-5c.8-.7.9-1.9.2-2.8z"/><path fill="#FF9800" d="M11.7 23.1l3.4-5.1l4.6.6l1.5-3.1c.4-.9 1.2-1.4 2.1-1.5h-9.2c-.7 0-1.3.3-1.7.9l-4 6c-.6.9-.4 2.2.6 2.8c.2.2.6.3 1 .3c.6 0 1.3-.3 1.7-.9z"/>
<rect x="0" y="0" width="48" height="48" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "flat-ui:weather": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 99.5 100">
<path fill="#CAA40B" d="M45.087 11.319A39.22 39.22 0 0 1 50 11c2.033 0 4.029.156 5.979.456L50.5 0l-5.413 11.319zM0 49.5l11.318 5.413A39.221 39.221 0 0 1 11 50c0-2.033.156-4.03.456-5.979L0 49.5zm19.082-23.26a39.189 39.189 0 0 1 7.766-7.621l-11.703-3.976l3.937 11.597zm62.104.34l4.67-11.937l-11.846 4.636a39.282 39.282 0 0 1 7.176 7.301zm-7.133 54.108l10.803 3.669l-3.701-10.897a39.325 39.325 0 0 1-7.102 7.228zM19.082 73.76l-3.938 11.597l10.869-4.614a39.39 39.39 0 0 1-6.931-6.983zm26.005 14.921L50.5 100l5.479-11.456c-1.95.3-3.946.456-5.979.456a39.22 39.22 0 0 1-4.913-.319z"/><path fill="#CAA40B" d="M45.087 11.319A39.22 39.22 0 0 1 50 11c2.033 0 4.029.156 5.979.456L50.5 0l-5.413 11.319zM0 49.5l11.318 5.413A39.221 39.221 0 0 1 11 50c0-2.033.156-4.03.456-5.979L0 49.5zm19.082-23.26a39.189 39.189 0 0 1 7.766-7.621l-11.703-3.976l3.937 11.597zm62.104.34l4.67-11.937l-11.846 4.636a39.282 39.282 0 0 1 7.176 7.301zm-7.133 54.108l10.803 3.669l-3.701-10.897a39.325 39.325 0 0 1-7.102 7.228zM19.082 73.76l-3.938 11.597l10.869-4.614a39.39 39.39 0 0 1-6.931-6.983zm26.005 14.921L50.5 100l5.479-11.456c-1.95.3-3.946.456-5.979.456a39.22 39.22 0 0 1-4.913-.319z"/><path fill="#F1C411" d="M33.104 7.324l-.438 7.739a38.623 38.623 0 0 1 6.484-2.522l-6.046-5.217zM13.039 37.559a38.697 38.697 0 0 1 2.591-5.997l-7.634.477l5.043 5.52zM68.561 7.014l-6.457 5.911a38.767 38.767 0 0 1 7.018 3.088l-.561-8.999zm-60 61.121l6.852-.12a38.847 38.847 0 0 1-2.254-5.22l-4.598 5.34zm25.291 24.879l5.885-5.388a38.709 38.709 0 0 1-6.365-2.346l.48 7.734zm34.945-1.518l.428-7.568a38.73 38.73 0 0 1-5.994 2.768l5.566 4.8z"/><path fill="#F1C411" d="M33.104 7.324l-.438 7.739a38.623 38.623 0 0 1 6.484-2.522l-6.046-5.217zM13.039 37.559a38.697 38.697 0 0 1 2.591-5.997l-7.634.477l5.043 5.52zM68.561 7.014l-6.457 5.911a38.767 38.767 0 0 1 7.018 3.088l-.561-8.999zm-60 61.121l6.852-.12a38.847 38.847 0 0 1-2.254-5.22l-4.598 5.34zm25.291 24.879l5.885-5.388a38.709 38.709 0 0 1-6.365-2.346l.48 7.734zm34.945-1.518l.428-7.568a38.73 38.73 0 0 1-5.994 2.768l5.566 4.8z"/><path fill="#F6D759" d="M50 14c19.882 0 36 16.117 36 36c0 19.882-16.118 36-36 36c-19.883 0-36-16.118-36-36c0-19.883 16.117-36 36-36z"/><path fill="#DDC14E" d="M54 82c-19.882 0-36-16.118-36-36c0-8.923 3.253-17.081 8.629-23.371C18.902 29.232 14 39.041 14 50c0 19.882 16.118 36 36 36c10.973 0 20.781-4.917 27.387-12.655C71.094 78.732 62.934 82 54 82z"/><path fill="#C5AE47" d="M77.387 73.345C71.094 78.733 62.934 82 53.999 82c-13.017 0-24.417-6.909-30.741-17.259l-4 4C25.582 79.091 36.982 86 49.999 86c10.972 0 20.782-4.917 27.388-12.655z"/><defs><circle id="ssvg-id-weathera" cx="50" cy="50" r="36"/></defs><clipPath id="ssvg-id-weatherb"><use xlink:href="#ssvg-id-weathera" overflow="visible"/></clipPath><path clip-path="url(#ssvg-id-weatherb)" fill="#DCC050" d="M47 41L2 86h84V41z"/><path fill="#fff" d="M95.584 49.709c.582-1.63.916-3.379.916-5.209C96.5 35.939 89.561 29 81 29c-6.523 0-12.096 4.034-14.382 9.74A12.947 12.947 0 0 0 57.5 35c-7.18 0-13 5.82-13 13c0 3.062 1.064 5.872 2.838 8.094c-3.865.564-6.838 3.884-6.838 7.906a8 8 0 0 0 8 8h38c7.18 0 13-5.82 13-13c0-3.643-1.502-6.931-3.916-9.291z"/><path fill="#fff" d="M95.584 49.709c.582-1.63.916-3.379.916-5.209C96.5 35.939 89.561 29 81 29c-6.523 0-12.096 4.034-14.382 9.74A12.947 12.947 0 0 0 57.5 35c-7.18 0-13 5.82-13 13c0 3.062 1.064 5.872 2.838 8.094c-3.865.564-6.838 3.884-6.838 7.906a8 8 0 0 0 8 8h38c7.18 0 13-5.82 13-13c0-3.643-1.502-6.931-3.916-9.291z"/>
<rect x="0" y="0" width="99.5" height="100" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "ic:sharp-card-travel": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 24 24">
<path d="M22 6h-5V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H2v15h20V6zM9 4h6v2H9V4zm11 15H4v-2h16v2zm0-5H4V8h3v2h2V8h6v2h2V8h3v6z" fill="currentColor"/>
<rect x="0" y="0" width="24" height="24" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "ion:car-sport-sharp": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 512 512">
<path d="M488 224c-3-5-32.61-17.79-32.61-17.79c5.15-2.66 8.67-3.21 8.67-14.21c0-12-.06-16-8.06-16h-27.14c-.11-.24-.23-.49-.34-.74c-17.52-38.26-19.87-47.93-46-60.95C347.47 96.88 281.76 96 256 96s-91.47.88-126.49 18.31c-26.16 13-25.51 19.69-46 60.95c0 .11-.21.4-.4.74H55.94c-7.94 0-8 4-8 16c0 11 3.52 11.55 8.67 14.21C56.61 206.21 28 220 24 224s-8 32-8 80s4 96 4 96h11.94c0 14 2.06 16 8.06 16h80c6 0 8-2 8-16h256c0 14 2 16 8 16h82c4 0 6-3 6-16h12s4-49 4-96s-5-75-8-80zm-362.74 44.94A516.94 516.94 0 0 1 70.42 272c-20.42 0-21.12 1.31-22.56-11.44a72.16 72.16 0 0 1 .51-17.51L49 240h3c12 0 23.27.51 44.55 6.78a98 98 0 0 1 30.09 15.06C131 265 132 268 132 268zm247.16 72L368 352H144s.39-.61-5-11.18c-4-7.82 1-12.82 8.91-15.66C163.23 319.64 208 304 256 304s93.66 13.48 108.5 21.16C370 328 376.83 330 372.42 341zm-257-136.53a96.23 96.23 0 0 1-9.7.07c2.61-4.64 4.06-9.81 6.61-15.21c8-17 17.15-36.24 33.44-44.35c23.54-11.72 72.33-17 110.23-17s86.69 5.24 110.23 17c16.29 8.11 25.4 27.36 33.44 44.35c2.57 5.45 4 10.66 6.68 15.33c-2 .11-4.3 0-9.79-.19zm347.72 56.11C461 273 463 272 441.58 272a516.94 516.94 0 0 1-54.84-3.06c-2.85-.51-3.66-5.32-1.38-7.1a93.84 93.84 0 0 1 30.09-15.06c21.28-6.27 33.26-7.11 45.09-6.69a3.22 3.22 0 0 1 3.09 3a70.18 70.18 0 0 1-.49 17.47z" fill="currentColor"/>
<rect x="0" y="0" width="512" height="512" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "jam:magic": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 24 24">
<path d="M15.243 8.672l3.535-3.536l-.707-.707l-3.535 3.535l.707.708zm-1.415 1.414l-.707-.707L3.93 18.57l.707.707l9.192-9.192zm4.95-7.778l2.121 2.12a1 1 0 0 1 0 1.415L5.343 21.4a1 1 0 0 1-1.414 0l-2.121-2.12a1 1 0 0 1 0-1.415L17.364 2.308a1 1 0 0 1 1.414 0zM9.586 1.6l1.393.704l1.435-.704l-.68 1.46l.68 1.368l-1.384-.664l-1.444.664l.689-1.42l-.69-1.408zm9.9 7.07l1.393.705l1.435-.704l-.68 1.46l.68 1.368l-1.384-.664l-1.445.664l.69-1.42l-.69-1.408z" fill="currentColor"/>
<rect x="0" y="0" width="24" height="24" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "ls:checkbox": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 700 677">
<path d="M517 480l74-106v303H0V87h476l-51 74H74v442l443 1V480zm66-449L347 372L182 250L99 365l280 214l321-461z" fill="currentColor"/>
<rect x="0" y="0" width="700" height="677" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "map:travel-agency": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 50 50">
<path d="M46 14H34v-3.976C34 7.173 32.159 4 29.311 4h-9.592C16.868 4 15 7.173 15 10.024V14H4c-1.1 0-2 .9-2 2v29c0 1.1.9 2 2 2h42c1.1 0 2-.9 2-2V16c0-1.1-.9-2-2-2zM30 44H19v-1.067c0-.023.613-.053.906-.088s.55-.094.761-.176c.375-.141.795-.343.948-.606S22 41.45 22 41.017v-10.23c0-.41-.248-.771-.436-1.081s-.499-.56-.78-.747c-.211-.141-.359-.275-.787-.404S19 28.343 19 28.308v-1.283l8.175-.457l-.175.263v13.957c0 .41.316.759.492 1.046s.542.501.87.642c.234.105.485.199.767.281s.871.14.871.176V44zm-9.381-23.761c0-.891.343-1.652 1.028-2.285s1.503-.949 2.452-.949s1.764.316 2.443.949s1.02 1.395 1.02 2.285s-.343 1.649-1.028 2.276s-1.497.94-2.435.94c-.949 0-1.767-.313-2.452-.94s-1.028-1.385-1.028-2.276zM31 14H18v-3.976C18 8.957 19.08 7 20.147 7h8.052C29.264 7 31 8.957 31 10.024V14z" fill="currentColor"/>
<rect x="0" y="0" width="50" height="50" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "mdi:weather-pouring": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 24 24">
<path d="M9 12c.53.14.85.69.71 1.22l-1.3 4.83c-.14.54-.69.85-1.22.71a.967.967 0 0 1-.69-1.22l1.28-4.83c.14-.54.69-.85 1.22-.71m4 0c.53.14.85.69.71 1.22l-2.07 7.73c-.14.55-.69.85-1.23.71c-.53-.16-.85-.69-.71-1.23l2.08-7.72c.14-.54.69-.85 1.22-.71m4 0c.53.14.85.69.71 1.22l-1.3 4.83c-.14.54-.69.85-1.22.71a.967.967 0 0 1-.69-1.22l1.28-4.83c.14-.54.69-.85 1.22-.71m0-2V9a5 5 0 0 0-5-5C9.5 4 7.45 5.82 7.06 8.19C6.73 8.07 6.37 8 6 8a3 3 0 0 0-3 3c0 1.11.6 2.08 1.5 2.6v-.01c.5.28.64.91.37 1.37c-.28.47-.87.64-1.37.36v.01A4.98 4.98 0 0 1 1 11a5 5 0 0 1 5-5c1-2.35 3.3-4 6-4c3.43 0 6.24 2.66 6.5 6.03L19 8a4 4 0 0 1 4 4c0 1.5-.8 2.77-2 3.46c-.5.27-1.09.11-1.37-.37c-.27-.48-.13-1.09.37-1.37v.01c.6-.34 1-.99 1-1.73a2 2 0 0 0-2-2h-2z" fill="currentColor"/>
<rect x="0" y="0" width="24" height="24" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "si-glyph:pin-location-2": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 16 16">
<g fill="currentColor" fill-rule="evenodd"><path d="M8 .031c-2.717 0-4.92 2.119-4.92 4.733c0 .675.15 1.317.414 1.898l4.59 7.321l4.422-7.321a4.563 4.563 0 0 0 .412-1.898C12.918 2.15 10.717.031 8 .031zm0 8.09a3.09 3.09 0 0 1-3.085-3.098A3.091 3.091 0 0 1 8 1.926a3.093 3.093 0 0 1 3.086 3.097A3.093 3.093 0 0 1 8 8.121zm1.977-3.138a1.981 1.981 0 0 1-1.978 1.985a1.982 1.982 0 0 1-1.977-1.985A1.98 1.98 0 0 1 7.999 3c1.092 0 1.978.889 1.978 1.983z"/><path d="M5.299 11.823c-1.717.364-2.43.842-2.43 1.379c0 .769 1.831 1.829 5.116 1.829c3.285 0 5.116-1.06 5.116-1.829c0-.535-.708-.999-2.401-1.379v-.82c1.865.366 3.254 1.101 3.254 2.199c0 1.584-3.076 2.77-5.969 2.77c-2.893 0-5.969-1.186-5.969-2.77c0-1.1 1.398-1.849 3.273-2.202l.01.823z"/></g>
<rect x="0" y="0" width="16" height="16" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "simple-line-icons:magic-wand": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 1056 1024">
<path d="M1037 429L934 276l51-179q5-18-8.5-31.5T945 57l-178 52L612 6q-15-11-32-2.5T562 31l-5 186l-147 115q-6 5-9.5 13t-1.5 17q0 3 1.5 6.5t3 6t4 5t5.5 4.5t6 3l138 49q-3 2-3 3L23 969q-6 6-8 14.5t0 16.5t8 15q10 9 23 9t23-9l530-531q3-3 5-7l54 148q7 17 25 20q3 1 5 1q16 0 26-13l113-147l184-7q9 0 16.5-4.5T1039 462q8-17-2-33zm-227-6q-15 0-24 12l-88 113l-49-134q-5-14-19-19l-134-49l112-88q4-3 6.5-6.5t4-8t1.5-9.5l5-143l118 80q13 8 27 4l137-40l-39 137q-1 3-1 6v5.5l.5 5.5l2 5.5l2.5 4.5l81 118z" fill="currentColor"/>
<rect x="0" y="0" width="1056" height="1024" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "typcn:weather-stormy": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 24 24">
<path d="M17 18a1 1 0 1 1 0-2c1.654 0 3-1.346 3-3s-1.346-3-3-3c-.238 0-.496.042-.813.131l-1.071.301l-.186-1.098A3.98 3.98 0 0 0 11 6a4.005 4.005 0 0 0-3.918 4.806l.26 1.24l-1.436-.052C4.896 12 4 12.897 4 14s.896 2 2 2a1 1 0 1 1 0 2c-2.205 0-4-1.794-4-4a4.007 4.007 0 0 1 3.002-3.874L5 10c0-3.309 2.691-6 6-6a5.967 5.967 0 0 1 5.649 4.015C19.574 7.774 22 10.127 22 13c0 2.757-2.243 5-5 5zm-4.361-4l-4.5 4.051l3 1.449l-1.5 3.5l4.5-4.05l-3-1.45z" fill="currentColor"/>
<rect x="0" y="0" width="24" height="24" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        "zondicons:travel-bus": `<svg
width="100%" 
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
aria-hidden="true"
focusable="false"
style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);
transform: rotate(360deg);"
preserveAspectRatio="xMidYMid meet"
viewBox="0 0 20 20">
<path d="M13 18H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1a2 2 0 0 1-2-2V2c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1zM4 5v6h5V5H4zm7 0v6h5V5h-5zM5 2v1h10V2H5zm.5 14a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3zm9 0a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3z" fill="currentColor"/>
<rect x="0" y="0" width="20" height="20" fill="rgba(0, 0, 0, 0)" />
</svg>`,
        };

    /* example2\src\Icons2.svelte generated by Svelte v3.29.4 */
    const file$1 = "example2\\src\\Icons2.svelte";

    function create_fragment$1(ctx) {
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let span0;
    	let raw0_value = icons$1["bx:bx-atom"] + "";
    	let t2;
    	let span1;
    	let raw1_value = icons$1["mdi:weather-pouring"] + "";
    	let t3;
    	let span2;
    	let raw2_value = icons$1["typcn:weather-stormy"] + "";
    	let t4;
    	let span3;
    	let raw3_value = icons$1["flat-ui:weather"] + "";
    	let t5;
    	let span4;
    	let raw4_value = icons$1["map:travel-agency"] + "";
    	let t6;
    	let span5;
    	let raw5_value = icons$1["zondicons:travel-bus"] + "";
    	let t7;
    	let span6;
    	let raw6_value = icons$1["ic:sharp-card-travel"] + "";
    	let t8;
    	let span7;
    	let raw7_value = icons$1["ls:checkbox"] + "";
    	let t9;
    	let span8;
    	let raw8_value = icons$1["emojione:sport-utility-vehicle"] + "";
    	let t10;
    	let span9;
    	let raw9_value = icons$1["ion:car-sport-sharp"] + "";
    	let t11;
    	let span10;
    	let raw10_value = icons$1["emojione-v1:sports-medal"] + "";
    	let t12;
    	let span11;
    	let raw11_value = icons$1["flat-color-icons:sports-mode"] + "";
    	let t13;
    	let span12;
    	let raw12_value = icons$1["jam:magic"] + "";
    	let t14;
    	let span13;
    	let raw13_value = icons$1["simple-line-icons:magic-wand"] + "";

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Other icons from Icons2.svelte";
    			t1 = space();
    			div0 = element("div");
    			span0 = element("span");
    			t2 = space();
    			span1 = element("span");
    			t3 = space();
    			span2 = element("span");
    			t4 = space();
    			span3 = element("span");
    			t5 = space();
    			span4 = element("span");
    			t6 = space();
    			span5 = element("span");
    			t7 = space();
    			span6 = element("span");
    			t8 = space();
    			span7 = element("span");
    			t9 = space();
    			span8 = element("span");
    			t10 = space();
    			span9 = element("span");
    			t11 = space();
    			span10 = element("span");
    			t12 = space();
    			span11 = element("span");
    			t13 = space();
    			span12 = element("span");
    			t14 = space();
    			span13 = element("span");
    			add_location(h2, file$1, 14, 2, 223);
    			attr_dev(span0, "class", "size1 svelte-jxtdky");
    			add_location(span0, file$1, 17, 4, 279);
    			attr_dev(span1, "class", "size1 svelte-jxtdky");
    			add_location(span1, file$1, 20, 4, 353);
    			attr_dev(span2, "class", "size1 svelte-jxtdky");
    			add_location(span2, file$1, 23, 4, 436);
    			attr_dev(span3, "class", "size1 svelte-jxtdky");
    			add_location(span3, file$1, 26, 4, 520);
    			attr_dev(span4, "class", "size1 svelte-jxtdky");
    			add_location(span4, file$1, 29, 4, 599);
    			attr_dev(span5, "class", "size1 svelte-jxtdky");
    			add_location(span5, file$1, 32, 4, 680);
    			attr_dev(span6, "class", "size1 svelte-jxtdky");
    			add_location(span6, file$1, 35, 4, 764);
    			attr_dev(span7, "class", "size1 svelte-jxtdky");
    			add_location(span7, file$1, 38, 4, 848);
    			attr_dev(span8, "class", "size1 svelte-jxtdky");
    			add_location(span8, file$1, 41, 4, 923);
    			attr_dev(span9, "class", "size1 svelte-jxtdky");
    			add_location(span9, file$1, 44, 4, 1017);
    			attr_dev(span10, "class", "size1 svelte-jxtdky");
    			add_location(span10, file$1, 47, 4, 1100);
    			attr_dev(span11, "class", "size1 svelte-jxtdky");
    			add_location(span11, file$1, 50, 4, 1188);
    			attr_dev(span12, "class", "size1 svelte-jxtdky");
    			add_location(span12, file$1, 53, 4, 1280);
    			attr_dev(span13, "class", "size1 svelte-jxtdky");
    			add_location(span13, file$1, 56, 4, 1353);
    			add_location(div0, file$1, 15, 2, 266);
    			add_location(div1, file$1, 13, 0, 214);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, span0);
    			span0.innerHTML = raw0_value;
    			append_dev(div0, t2);
    			append_dev(div0, span1);
    			span1.innerHTML = raw1_value;
    			append_dev(div0, t3);
    			append_dev(div0, span2);
    			span2.innerHTML = raw2_value;
    			append_dev(div0, t4);
    			append_dev(div0, span3);
    			span3.innerHTML = raw3_value;
    			append_dev(div0, t5);
    			append_dev(div0, span4);
    			span4.innerHTML = raw4_value;
    			append_dev(div0, t6);
    			append_dev(div0, span5);
    			span5.innerHTML = raw5_value;
    			append_dev(div0, t7);
    			append_dev(div0, span6);
    			span6.innerHTML = raw6_value;
    			append_dev(div0, t8);
    			append_dev(div0, span7);
    			span7.innerHTML = raw7_value;
    			append_dev(div0, t9);
    			append_dev(div0, span8);
    			span8.innerHTML = raw8_value;
    			append_dev(div0, t10);
    			append_dev(div0, span9);
    			span9.innerHTML = raw9_value;
    			append_dev(div0, t11);
    			append_dev(div0, span10);
    			span10.innerHTML = raw10_value;
    			append_dev(div0, t12);
    			append_dev(div0, span11);
    			span11.innerHTML = raw11_value;
    			append_dev(div0, t13);
    			append_dev(div0, span12);
    			span12.innerHTML = raw12_value;
    			append_dev(div0, t14);
    			append_dev(div0, span13);
    			span13.innerHTML = raw13_value;
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Icons2", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icons2> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ icons: icons$1 });
    	return [];
    }

    class Icons2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icons2",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* example2\src\App.svelte generated by Svelte v3.29.4 */

    function create_fragment$2(ctx) {
    	let icons1;
    	let t;
    	let icons2;
    	let current;
    	icons1 = new Icons1({ $$inline: true });
    	icons2 = new Icons2({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(icons1.$$.fragment);
    			t = space();
    			create_component(icons2.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(icons1, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(icons2, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icons1.$$.fragment, local);
    			transition_in(icons2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icons1.$$.fragment, local);
    			transition_out(icons2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icons1, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(icons2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Icons1, Icons2 });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
