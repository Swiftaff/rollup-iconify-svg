var app = (function () {
    "use strict";
    function t() {}
    function n(t) {
        return t();
    }
    function e() {
        return Object.create(null);
    }
    function r(t) {
        t.forEach(n);
    }
    function o(t) {
        return "function" == typeof t;
    }
    function s(t, n) {
        return t != t ? n == n : t !== n || (t && "object" == typeof t) || "function" == typeof t;
    }
    function i(t, n, e) {
        t.insertBefore(n, e || null);
    }
    function c(t) {
        t.parentNode.removeChild(t);
    }
    function a() {
        return (t = ""), document.createTextNode(t);
        var t;
    }
    class l {
        constructor(t = null) {
            (this.a = t), (this.e = this.n = null);
        }
        m(t, n, e = null) {
            var r;
            this.e || ((this.e = ((r = n.nodeName), document.createElement(r))), (this.t = n), this.h(t)), this.i(e);
        }
        h(t) {
            (this.e.innerHTML = t), (this.n = Array.from(this.e.childNodes));
        }
        i(t) {
            for (let n = 0; n < this.n.length; n += 1) i(this.t, this.n[n], t);
        }
        p(t) {
            this.d(), this.h(t), this.i(this.a);
        }
        d() {
            this.n.forEach(c);
        }
    }
    let u;
    function f(t) {
        u = t;
    }
    const h = [],
        d = [],
        p = [],
        m = [],
        g = Promise.resolve();
    let $ = !1;
    function q(t) {
        p.push(t);
    }
    let y = !1;
    const b = new Set();
    function x() {
        if (!y) {
            y = !0;
            do {
                for (let t = 0; t < h.length; t += 1) {
                    const n = h[t];
                    f(n), w(n.$$);
                }
                for (f(null), h.length = 0; d.length; ) d.pop()();
                for (let t = 0; t < p.length; t += 1) {
                    const n = p[t];
                    b.has(n) || (b.add(n), n());
                }
                p.length = 0;
            } while (h.length);
            for (; m.length; ) m.pop()();
            ($ = !1), (y = !1), b.clear();
        }
    }
    function w(t) {
        if (null !== t.fragment) {
            t.update(), r(t.before_update);
            const n = t.dirty;
            (t.dirty = [-1]), t.fragment && t.fragment.p(t.ctx, n), t.after_update.forEach(q);
        }
    }
    const _ = new Set();
    function v(t, n) {
        -1 === t.$$.dirty[0] && (h.push(t), $ || (($ = !0), g.then(x)), t.$$.dirty.fill(0)),
            (t.$$.dirty[(n / 31) | 0] |= 1 << n % 31);
    }
    function k(s, i, a, l, h, d, p = [-1]) {
        const m = u;
        f(s);
        const g = i.props || {},
            $ = (s.$$ = {
                fragment: null,
                ctx: null,
                props: d,
                update: t,
                not_equal: h,
                bound: e(),
                on_mount: [],
                on_destroy: [],
                before_update: [],
                after_update: [],
                context: new Map(m ? m.$$.context : []),
                callbacks: e(),
                dirty: p,
                skip_bound: !1,
            });
        let y = !1;
        if (
            (($.ctx = a
                ? a(s, g, (t, n, ...e) => {
                      const r = e.length ? e[0] : n;
                      return (
                          $.ctx &&
                              h($.ctx[t], ($.ctx[t] = r)) &&
                              (!$.skip_bound && $.bound[t] && $.bound[t](r), y && v(s, t)),
                          n
                      );
                  })
                : []),
            $.update(),
            (y = !0),
            r($.before_update),
            ($.fragment = !!l && l($.ctx)),
            i.target)
        ) {
            if (i.hydrate) {
                const t = (function (t) {
                    return Array.from(t.childNodes);
                })(i.target);
                $.fragment && $.fragment.l(t), t.forEach(c);
            } else $.fragment && $.fragment.c();
            i.intro && (b = s.$$.fragment) && b.i && (_.delete(b), b.i(w)),
                (function (t, e, s) {
                    const { fragment: i, on_mount: c, on_destroy: a, after_update: l } = t.$$;
                    i && i.m(e, s),
                        q(() => {
                            const e = c.map(n).filter(o);
                            a ? a.push(...e) : r(e), (t.$$.on_mount = []);
                        }),
                        l.forEach(q);
                })(s, i.target, i.anchor),
                x();
        }
        var b, w;
        f(m);
    }
    var E =
        '<svg\nwidth="100%" \nxmlns="http://www.w3.org/2000/svg"\nxmlns:xlink="http://www.w3.org/1999/xlink"\naria-hidden="true"\nfocusable="false"\nstyle="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg);\ntransform: rotate(360deg);"\npreserveAspectRatio="xMidYMid meet"\nviewBox="0 0 1792 1600">\n<path d="M666 449q-60 92-137 273q-22-45-37-72.5T451.5 586t-51-56.5t-63-35T256 480H32q-14 0-23-9t-9-23V256q0-14 9-23t23-9h224q250 0 410 225zm1126 799q0 14-9 23l-320 320q-9 9-23 9q-13 0-22.5-9.5t-9.5-22.5v-192q-32 0-85 .5t-81 1t-73-1t-71-5t-64-10.5t-63-18.5t-58-28.5t-59-40t-55-53.5t-56-69.5q59-93 136-273q22 45 37 72.5t40.5 63.5t51 56.5t63 35t81.5 14.5h256V928q0-14 9-23t23-9q12 0 24 10l319 319q9 9 9 23zm0-896q0 14-9 23l-320 320q-9 9-23 9q-13 0-22.5-9.5T1408 672V480h-256q-48 0-87 15t-69 45t-51 61.5t-45 77.5q-32 62-78 171q-29 66-49.5 111t-54 105t-64 100t-74 83t-90 68.5t-106.5 42t-128 16.5H32q-14 0-23-9t-9-23v-192q0-14 9-23t23-9h224q48 0 87-15t69-45t51-61.5t45-77.5q32-62 78-171q29-66 49.5-111t54-105t64-100t74-83t90-68.5t106.5-42t128-16.5h256V32q0-14 9-23t23-9q12 0 24 10l319 319q9 9 9 23z" fill="currentColor"/>\n<rect x="0" y="0" width="1792" height="1600" fill="rgba(0, 0, 0, 0)" />\n</svg>';
    function M(n) {
        let e,
            r,
            o = E + "";
        return {
            c() {
                (r = a()), (e = new l(r));
            },
            m(t, n) {
                e.m(o, t, n), i(t, r, n);
            },
            p: t,
            i: t,
            o: t,
            d(t) {
                t && c(r), t && e.d();
            },
        };
    }
    return new (class extends class {
        $destroy() {
            !(function (t, n) {
                const e = t.$$;
                null !== e.fragment &&
                    (r(e.on_destroy), e.fragment && e.fragment.d(n), (e.on_destroy = e.fragment = null), (e.ctx = []));
            })(this, 1),
                (this.$destroy = t);
        }
        $on(t, n) {
            const e = this.$$.callbacks[t] || (this.$$.callbacks[t] = []);
            return (
                e.push(n),
                () => {
                    const t = e.indexOf(n);
                    -1 !== t && e.splice(t, 1);
                }
            );
        }
        $set(t) {
            var n;
            this.$$set &&
                ((n = t), 0 !== Object.keys(n).length) &&
                ((this.$$.skip_bound = !0), this.$$set(t), (this.$$.skip_bound = !1));
        }
    } {
        constructor(t) {
            super(), k(this, t, null, M, s, {});
        }
    })({ target: document.body });
})();
//# sourceMappingURL=bundle.js.map
