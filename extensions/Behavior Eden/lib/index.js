"use strict";
var t = require("fs"),
  e = require("constants"),
  n = require("stream"),
  r = require("util"),
  i = require("assert"),
  a = require("path");
function o(t, e) {
  return (
    e.forEach(function (e) {
      e &&
        "string" != typeof e &&
        !Array.isArray(e) &&
        Object.keys(e).forEach(function (n) {
          if ("default" !== n && !(n in t)) {
            var r = Object.getOwnPropertyDescriptor(e, n);
            Object.defineProperty(
              t,
              n,
              r.get
                ? r
                : {
                    enumerable: !0,
                    get: function () {
                      return e[n];
                    },
                  }
            );
          }
        });
    }),
    Object.freeze(t)
  );
}
var s =
  "undefined" != typeof globalThis
    ? globalThis
    : "undefined" != typeof window
    ? window
    : "undefined" != typeof global
    ? global
    : "undefined" != typeof self
    ? self
    : {};
function c(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var l = { exports: {} },
  h = {},
  d = {},
  u = {};
!(function (t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), (t._registerNode = t.Konva = t.glob = void 0);
  const e = Math.PI / 180;
  (t.glob =
    void 0 !== s ? s : "undefined" != typeof window ? window : "undefined" != typeof WorkerGlobalScope ? self : {}),
    (t.Konva = {
      _global: t.glob,
      version: "9.2.1",
      isBrowser:
        "undefined" != typeof window &&
        ("[object Window]" === {}.toString.call(window) || "[object global]" === {}.toString.call(window)),
      isUnminified: /param/.test(function (t) {}.toString()),
      dblClickWindow: 400,
      getAngle: (n) => (t.Konva.angleDeg ? n * e : n),
      enableTrace: !1,
      pointerEventsEnabled: !0,
      autoDrawEnabled: !0,
      hitOnDragEnabled: !1,
      capturePointerEventsEnabled: !1,
      _mouseListenClick: !1,
      _touchListenClick: !1,
      _pointerListenClick: !1,
      _mouseInDblClickWindow: !1,
      _touchInDblClickWindow: !1,
      _pointerInDblClickWindow: !1,
      _mouseDblClickPointerId: null,
      _touchDblClickPointerId: null,
      _pointerDblClickPointerId: null,
      pixelRatio: ("undefined" != typeof window && window.devicePixelRatio) || 1,
      dragDistance: 3,
      angleDeg: !0,
      showWarnings: !0,
      dragButtons: [0, 1],
      isDragging: () => t.Konva.DD.isDragging,
      isDragReady: () => !!t.Konva.DD.node,
      releaseCanvasOnDestroy: !0,
      document: t.glob.document,
      _injectGlobal(e) {
        t.glob.Konva = e;
      },
    });
  (t._registerNode = (e) => {
    t.Konva[e.prototype.getClassName()] = e;
  }),
    t.Konva._injectGlobal(t.Konva);
})(u);
var f = {};
!(function (t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), (t.Util = t.Transform = void 0);
  const e = u;
  class n {
    constructor(t = [1, 0, 0, 1, 0, 0]) {
      (this.dirty = !1), (this.m = (t && t.slice()) || [1, 0, 0, 1, 0, 0]);
    }
    reset() {
      (this.m[0] = 1), (this.m[1] = 0), (this.m[2] = 0), (this.m[3] = 1), (this.m[4] = 0), (this.m[5] = 0);
    }
    copy() {
      return new n(this.m);
    }
    copyInto(t) {
      (t.m[0] = this.m[0]),
        (t.m[1] = this.m[1]),
        (t.m[2] = this.m[2]),
        (t.m[3] = this.m[3]),
        (t.m[4] = this.m[4]),
        (t.m[5] = this.m[5]);
    }
    point(t) {
      var e = this.m;
      return { x: e[0] * t.x + e[2] * t.y + e[4], y: e[1] * t.x + e[3] * t.y + e[5] };
    }
    translate(t, e) {
      return (this.m[4] += this.m[0] * t + this.m[2] * e), (this.m[5] += this.m[1] * t + this.m[3] * e), this;
    }
    scale(t, e) {
      return (this.m[0] *= t), (this.m[1] *= t), (this.m[2] *= e), (this.m[3] *= e), this;
    }
    rotate(t) {
      var e = Math.cos(t),
        n = Math.sin(t),
        r = this.m[0] * e + this.m[2] * n,
        i = this.m[1] * e + this.m[3] * n,
        a = this.m[0] * -n + this.m[2] * e,
        o = this.m[1] * -n + this.m[3] * e;
      return (this.m[0] = r), (this.m[1] = i), (this.m[2] = a), (this.m[3] = o), this;
    }
    getTranslation() {
      return { x: this.m[4], y: this.m[5] };
    }
    skew(t, e) {
      var n = this.m[0] + this.m[2] * e,
        r = this.m[1] + this.m[3] * e,
        i = this.m[2] + this.m[0] * t,
        a = this.m[3] + this.m[1] * t;
      return (this.m[0] = n), (this.m[1] = r), (this.m[2] = i), (this.m[3] = a), this;
    }
    multiply(t) {
      var e = this.m[0] * t.m[0] + this.m[2] * t.m[1],
        n = this.m[1] * t.m[0] + this.m[3] * t.m[1],
        r = this.m[0] * t.m[2] + this.m[2] * t.m[3],
        i = this.m[1] * t.m[2] + this.m[3] * t.m[3],
        a = this.m[0] * t.m[4] + this.m[2] * t.m[5] + this.m[4],
        o = this.m[1] * t.m[4] + this.m[3] * t.m[5] + this.m[5];
      return (this.m[0] = e), (this.m[1] = n), (this.m[2] = r), (this.m[3] = i), (this.m[4] = a), (this.m[5] = o), this;
    }
    invert() {
      var t = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]),
        e = this.m[3] * t,
        n = -this.m[1] * t,
        r = -this.m[2] * t,
        i = this.m[0] * t,
        a = t * (this.m[2] * this.m[5] - this.m[3] * this.m[4]),
        o = t * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
      return (this.m[0] = e), (this.m[1] = n), (this.m[2] = r), (this.m[3] = i), (this.m[4] = a), (this.m[5] = o), this;
    }
    getMatrix() {
      return this.m;
    }
    decompose() {
      var e = this.m[0],
        n = this.m[1],
        r = this.m[2],
        i = this.m[3],
        a = e * i - n * r;
      let o = { x: this.m[4], y: this.m[5], rotation: 0, scaleX: 0, scaleY: 0, skewX: 0, skewY: 0 };
      if (0 != e || 0 != n) {
        var s = Math.sqrt(e * e + n * n);
        (o.rotation = n > 0 ? Math.acos(e / s) : -Math.acos(e / s)),
          (o.scaleX = s),
          (o.scaleY = a / s),
          (o.skewX = (e * r + n * i) / a),
          (o.skewY = 0);
      } else if (0 != r || 0 != i) {
        var c = Math.sqrt(r * r + i * i);
        (o.rotation = Math.PI / 2 - (i > 0 ? Math.acos(-r / c) : -Math.acos(r / c))),
          (o.scaleX = a / c),
          (o.scaleY = c),
          (o.skewX = 0),
          (o.skewY = (e * r + n * i) / a);
      }
      return (o.rotation = t.Util._getRotation(o.rotation)), o;
    }
  }
  t.Transform = n;
  var r = Math.PI / 180,
    i = 180 / Math.PI,
    a = "Konva error: ",
    o = {
      aliceblue: [240, 248, 255],
      antiquewhite: [250, 235, 215],
      aqua: [0, 255, 255],
      aquamarine: [127, 255, 212],
      azure: [240, 255, 255],
      beige: [245, 245, 220],
      bisque: [255, 228, 196],
      black: [0, 0, 0],
      blanchedalmond: [255, 235, 205],
      blue: [0, 0, 255],
      blueviolet: [138, 43, 226],
      brown: [165, 42, 42],
      burlywood: [222, 184, 135],
      cadetblue: [95, 158, 160],
      chartreuse: [127, 255, 0],
      chocolate: [210, 105, 30],
      coral: [255, 127, 80],
      cornflowerblue: [100, 149, 237],
      cornsilk: [255, 248, 220],
      crimson: [220, 20, 60],
      cyan: [0, 255, 255],
      darkblue: [0, 0, 139],
      darkcyan: [0, 139, 139],
      darkgoldenrod: [184, 132, 11],
      darkgray: [169, 169, 169],
      darkgreen: [0, 100, 0],
      darkgrey: [169, 169, 169],
      darkkhaki: [189, 183, 107],
      darkmagenta: [139, 0, 139],
      darkolivegreen: [85, 107, 47],
      darkorange: [255, 140, 0],
      darkorchid: [153, 50, 204],
      darkred: [139, 0, 0],
      darksalmon: [233, 150, 122],
      darkseagreen: [143, 188, 143],
      darkslateblue: [72, 61, 139],
      darkslategray: [47, 79, 79],
      darkslategrey: [47, 79, 79],
      darkturquoise: [0, 206, 209],
      darkviolet: [148, 0, 211],
      deeppink: [255, 20, 147],
      deepskyblue: [0, 191, 255],
      dimgray: [105, 105, 105],
      dimgrey: [105, 105, 105],
      dodgerblue: [30, 144, 255],
      firebrick: [178, 34, 34],
      floralwhite: [255, 255, 240],
      forestgreen: [34, 139, 34],
      fuchsia: [255, 0, 255],
      gainsboro: [220, 220, 220],
      ghostwhite: [248, 248, 255],
      gold: [255, 215, 0],
      goldenrod: [218, 165, 32],
      gray: [128, 128, 128],
      green: [0, 128, 0],
      greenyellow: [173, 255, 47],
      grey: [128, 128, 128],
      honeydew: [240, 255, 240],
      hotpink: [255, 105, 180],
      indianred: [205, 92, 92],
      indigo: [75, 0, 130],
      ivory: [255, 255, 240],
      khaki: [240, 230, 140],
      lavender: [230, 230, 250],
      lavenderblush: [255, 240, 245],
      lawngreen: [124, 252, 0],
      lemonchiffon: [255, 250, 205],
      lightblue: [173, 216, 230],
      lightcoral: [240, 128, 128],
      lightcyan: [224, 255, 255],
      lightgoldenrodyellow: [250, 250, 210],
      lightgray: [211, 211, 211],
      lightgreen: [144, 238, 144],
      lightgrey: [211, 211, 211],
      lightpink: [255, 182, 193],
      lightsalmon: [255, 160, 122],
      lightseagreen: [32, 178, 170],
      lightskyblue: [135, 206, 250],
      lightslategray: [119, 136, 153],
      lightslategrey: [119, 136, 153],
      lightsteelblue: [176, 196, 222],
      lightyellow: [255, 255, 224],
      lime: [0, 255, 0],
      limegreen: [50, 205, 50],
      linen: [250, 240, 230],
      magenta: [255, 0, 255],
      maroon: [128, 0, 0],
      mediumaquamarine: [102, 205, 170],
      mediumblue: [0, 0, 205],
      mediumorchid: [186, 85, 211],
      mediumpurple: [147, 112, 219],
      mediumseagreen: [60, 179, 113],
      mediumslateblue: [123, 104, 238],
      mediumspringgreen: [0, 250, 154],
      mediumturquoise: [72, 209, 204],
      mediumvioletred: [199, 21, 133],
      midnightblue: [25, 25, 112],
      mintcream: [245, 255, 250],
      mistyrose: [255, 228, 225],
      moccasin: [255, 228, 181],
      navajowhite: [255, 222, 173],
      navy: [0, 0, 128],
      oldlace: [253, 245, 230],
      olive: [128, 128, 0],
      olivedrab: [107, 142, 35],
      orange: [255, 165, 0],
      orangered: [255, 69, 0],
      orchid: [218, 112, 214],
      palegoldenrod: [238, 232, 170],
      palegreen: [152, 251, 152],
      paleturquoise: [175, 238, 238],
      palevioletred: [219, 112, 147],
      papayawhip: [255, 239, 213],
      peachpuff: [255, 218, 185],
      peru: [205, 133, 63],
      pink: [255, 192, 203],
      plum: [221, 160, 203],
      powderblue: [176, 224, 230],
      purple: [128, 0, 128],
      rebeccapurple: [102, 51, 153],
      red: [255, 0, 0],
      rosybrown: [188, 143, 143],
      royalblue: [65, 105, 225],
      saddlebrown: [139, 69, 19],
      salmon: [250, 128, 114],
      sandybrown: [244, 164, 96],
      seagreen: [46, 139, 87],
      seashell: [255, 245, 238],
      sienna: [160, 82, 45],
      silver: [192, 192, 192],
      skyblue: [135, 206, 235],
      slateblue: [106, 90, 205],
      slategray: [119, 128, 144],
      slategrey: [119, 128, 144],
      snow: [255, 255, 250],
      springgreen: [0, 255, 127],
      steelblue: [70, 130, 180],
      tan: [210, 180, 140],
      teal: [0, 128, 128],
      thistle: [216, 191, 216],
      transparent: [255, 255, 255, 0],
      tomato: [255, 99, 71],
      turquoise: [64, 224, 208],
      violet: [238, 130, 238],
      wheat: [245, 222, 179],
      white: [255, 255, 255],
      whitesmoke: [245, 245, 245],
      yellow: [255, 255, 0],
      yellowgreen: [154, 205, 5],
    },
    s = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/,
    c = [];
  const l =
    ("undefined" != typeof requestAnimationFrame && requestAnimationFrame) ||
    function (t) {
      setTimeout(t, 60);
    };
  t.Util = {
    _isElement: (t) => !(!t || 1 != t.nodeType),
    _isFunction: (t) => !!(t && t.constructor && t.call && t.apply),
    _isPlainObject: (t) => !!t && t.constructor === Object,
    _isArray: (t) => "[object Array]" === Object.prototype.toString.call(t),
    _isNumber: (t) => "[object Number]" === Object.prototype.toString.call(t) && !isNaN(t) && isFinite(t),
    _isString: (t) => "[object String]" === Object.prototype.toString.call(t),
    _isBoolean: (t) => "[object Boolean]" === Object.prototype.toString.call(t),
    isObject: (t) => t instanceof Object,
    isValidSelector(t) {
      if ("string" != typeof t) return !1;
      var e = t[0];
      return "#" === e || "." === e || e === e.toUpperCase();
    },
    _sign: (t) => (0 === t || t > 0 ? 1 : -1),
    requestAnimFrame(t) {
      c.push(t),
        1 === c.length &&
          l(function () {
            const t = c;
            (c = []),
              t.forEach(function (t) {
                t();
              });
          });
    },
    createCanvasElement() {
      var t = document.createElement("canvas");
      try {
        t.style = t.style || {};
      } catch (t) {}
      return t;
    },
    createImageElement: () => document.createElement("img"),
    _isInDocument(t) {
      for (; (t = t.parentNode); ) if (t == document) return !0;
      return !1;
    },
    _urlToImage(e, n) {
      var r = t.Util.createImageElement();
      (r.onload = function () {
        n(r);
      }),
        (r.src = e);
    },
    _rgbToHex: (t, e, n) => ((1 << 24) + (t << 16) + (e << 8) + n).toString(16).slice(1),
    _hexToRgb(t) {
      t = t.replace("#", "");
      var e = parseInt(t, 16);
      return { r: (e >> 16) & 255, g: (e >> 8) & 255, b: 255 & e };
    },
    getRandomColor() {
      for (var t = ((16777215 * Math.random()) << 0).toString(16); t.length < 6; ) t = "0" + t;
      return "#" + t;
    },
    getRGB(t) {
      var e;
      return t in o
        ? { r: (e = o[t])[0], g: e[1], b: e[2] }
        : "#" === t[0]
        ? this._hexToRgb(t.substring(1))
        : "rgb(" === t.substr(0, 4)
        ? ((e = s.exec(t.replace(/ /g, ""))), { r: parseInt(e[1], 10), g: parseInt(e[2], 10), b: parseInt(e[3], 10) })
        : { r: 0, g: 0, b: 0 };
    },
    colorToRGBA: (e) => (
      (e = e || "black"),
      t.Util._namedColorToRBA(e) ||
        t.Util._hex3ColorToRGBA(e) ||
        t.Util._hex4ColorToRGBA(e) ||
        t.Util._hex6ColorToRGBA(e) ||
        t.Util._hex8ColorToRGBA(e) ||
        t.Util._rgbColorToRGBA(e) ||
        t.Util._rgbaColorToRGBA(e) ||
        t.Util._hslColorToRGBA(e)
    ),
    _namedColorToRBA(t) {
      var e = o[t.toLowerCase()];
      return e ? { r: e[0], g: e[1], b: e[2], a: 1 } : null;
    },
    _rgbColorToRGBA(t) {
      if (0 === t.indexOf("rgb(")) {
        var e = (t = t.match(/rgb\(([^)]+)\)/)[1]).split(/ *, */).map(Number);
        return { r: e[0], g: e[1], b: e[2], a: 1 };
      }
    },
    _rgbaColorToRGBA(t) {
      if (0 === t.indexOf("rgba(")) {
        var e = (t = t.match(/rgba\(([^)]+)\)/)[1])
          .split(/ *, */)
          .map((t, e) => ("%" === t.slice(-1) ? (3 === e ? parseInt(t) / 100 : (parseInt(t) / 100) * 255) : Number(t)));
        return { r: e[0], g: e[1], b: e[2], a: e[3] };
      }
    },
    _hex8ColorToRGBA(t) {
      if ("#" === t[0] && 9 === t.length)
        return {
          r: parseInt(t.slice(1, 3), 16),
          g: parseInt(t.slice(3, 5), 16),
          b: parseInt(t.slice(5, 7), 16),
          a: parseInt(t.slice(7, 9), 16) / 255,
        };
    },
    _hex6ColorToRGBA(t) {
      if ("#" === t[0] && 7 === t.length)
        return { r: parseInt(t.slice(1, 3), 16), g: parseInt(t.slice(3, 5), 16), b: parseInt(t.slice(5, 7), 16), a: 1 };
    },
    _hex4ColorToRGBA(t) {
      if ("#" === t[0] && 5 === t.length)
        return {
          r: parseInt(t[1] + t[1], 16),
          g: parseInt(t[2] + t[2], 16),
          b: parseInt(t[3] + t[3], 16),
          a: parseInt(t[4] + t[4], 16) / 255,
        };
    },
    _hex3ColorToRGBA(t) {
      if ("#" === t[0] && 4 === t.length)
        return { r: parseInt(t[1] + t[1], 16), g: parseInt(t[2] + t[2], 16), b: parseInt(t[3] + t[3], 16), a: 1 };
    },
    _hslColorToRGBA(t) {
      if (/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.test(t)) {
        const [e, ...n] = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(t),
          r = Number(n[0]) / 360,
          i = Number(n[1]) / 100,
          a = Number(n[2]) / 100;
        let o, s, c;
        if (0 === i) return (c = 255 * a), { r: Math.round(c), g: Math.round(c), b: Math.round(c), a: 1 };
        o = a < 0.5 ? a * (1 + i) : a + i - a * i;
        const l = 2 * a - o,
          h = [0, 0, 0];
        for (let t = 0; t < 3; t++)
          (s = r + (1 / 3) * -(t - 1)),
            s < 0 && s++,
            s > 1 && s--,
            (c = 6 * s < 1 ? l + 6 * (o - l) * s : 2 * s < 1 ? o : 3 * s < 2 ? l + (o - l) * (2 / 3 - s) * 6 : l),
            (h[t] = 255 * c);
        return { r: Math.round(h[0]), g: Math.round(h[1]), b: Math.round(h[2]), a: 1 };
      }
    },
    haveIntersection: (t, e) =>
      !(e.x > t.x + t.width || e.x + e.width < t.x || e.y > t.y + t.height || e.y + e.height < t.y),
    cloneObject(t) {
      var e = {};
      for (var n in t)
        this._isPlainObject(t[n])
          ? (e[n] = this.cloneObject(t[n]))
          : this._isArray(t[n])
          ? (e[n] = this.cloneArray(t[n]))
          : (e[n] = t[n]);
      return e;
    },
    cloneArray: (t) => t.slice(0),
    degToRad: (t) => t * r,
    radToDeg: (t) => t * i,
    _degToRad: (e) => (
      t.Util.warn("Util._degToRad is removed. Please use public Util.degToRad instead."), t.Util.degToRad(e)
    ),
    _radToDeg: (e) => (
      t.Util.warn("Util._radToDeg is removed. Please use public Util.radToDeg instead."), t.Util.radToDeg(e)
    ),
    _getRotation: (n) => (e.Konva.angleDeg ? t.Util.radToDeg(n) : n),
    _capitalize: (t) => t.charAt(0).toUpperCase() + t.slice(1),
    throw(t) {
      throw new Error(a + t);
    },
    error(t) {
      console.error(a + t);
    },
    warn(t) {
      e.Konva.showWarnings && console.warn("Konva warning: " + t);
    },
    each(t, e) {
      for (var n in t) e(n, t[n]);
    },
    _inRange: (t, e, n) => e <= t && t < n,
    _getProjectionToSegment(t, e, n, r, i, a) {
      var o,
        s,
        c,
        l = (t - n) * (t - n) + (e - r) * (e - r);
      if (0 == l) (o = t), (s = e), (c = (i - n) * (i - n) + (a - r) * (a - r));
      else {
        var h = ((i - t) * (n - t) + (a - e) * (r - e)) / l;
        h < 0
          ? ((o = t), (s = e), (c = (t - i) * (t - i) + (e - a) * (e - a)))
          : h > 1
          ? ((o = n), (s = r), (c = (n - i) * (n - i) + (r - a) * (r - a)))
          : (c = ((o = t + h * (n - t)) - i) * (o - i) + ((s = e + h * (r - e)) - a) * (s - a));
      }
      return [o, s, c];
    },
    _getProjectionToLine(e, n, r) {
      var i = t.Util.cloneObject(e),
        a = Number.MAX_VALUE;
      return (
        n.forEach(function (o, s) {
          if (r || s !== n.length - 1) {
            var c = n[(s + 1) % n.length],
              l = t.Util._getProjectionToSegment(o.x, o.y, c.x, c.y, e.x, e.y),
              h = l[0],
              d = l[1],
              u = l[2];
            u < a && ((i.x = h), (i.y = d), (a = u));
          }
        }),
        i
      );
    },
    _prepareArrayForTween(e, n, r) {
      var i,
        a = [],
        o = [];
      if (e.length > n.length) {
        var s = n;
        (n = e), (e = s);
      }
      for (i = 0; i < e.length; i += 2) a.push({ x: e[i], y: e[i + 1] });
      for (i = 0; i < n.length; i += 2) o.push({ x: n[i], y: n[i + 1] });
      var c = [];
      return (
        o.forEach(function (e) {
          var n = t.Util._getProjectionToLine(e, a, r);
          c.push(n.x), c.push(n.y);
        }),
        c
      );
    },
    _prepareToStringify(e) {
      var n;
      for (var r in ((e.visitedByCircularReferenceRemoval = !0), e))
        if (e.hasOwnProperty(r) && e[r] && "object" == typeof e[r])
          if (
            ((n = Object.getOwnPropertyDescriptor(e, r)),
            e[r].visitedByCircularReferenceRemoval || t.Util._isElement(e[r]))
          ) {
            if (!n.configurable) return null;
            delete e[r];
          } else if (null === t.Util._prepareToStringify(e[r])) {
            if (!n.configurable) return null;
            delete e[r];
          }
      return delete e.visitedByCircularReferenceRemoval, e;
    },
    _assign(t, e) {
      for (var n in e) t[n] = e[n];
      return t;
    },
    _getFirstPointerId: (t) => (t.touches ? t.changedTouches[0].identifier : t.pointerId || 999),
    releaseCanvas(...t) {
      e.Konva.releaseCanvasOnDestroy &&
        t.forEach((t) => {
          (t.width = 0), (t.height = 0);
        });
    },
    drawRoundedRectPath(t, e, n, r) {
      let i = 0,
        a = 0,
        o = 0,
        s = 0;
      "number" == typeof r
        ? (i = a = o = s = Math.min(r, e / 2, n / 2))
        : ((i = Math.min(r[0] || 0, e / 2, n / 2)),
          (a = Math.min(r[1] || 0, e / 2, n / 2)),
          (s = Math.min(r[2] || 0, e / 2, n / 2)),
          (o = Math.min(r[3] || 0, e / 2, n / 2))),
        t.moveTo(i, 0),
        t.lineTo(e - a, 0),
        t.arc(e - a, a, a, (3 * Math.PI) / 2, 0, !1),
        t.lineTo(e, n - s),
        t.arc(e - s, n - s, s, 0, Math.PI / 2, !1),
        t.lineTo(o, n),
        t.arc(o, n - o, o, Math.PI / 2, Math.PI, !1),
        t.lineTo(0, i),
        t.arc(i, i, i, Math.PI, (3 * Math.PI) / 2, !1);
    },
  };
})(f);
var p = {},
  g = {},
  v = {};
Object.defineProperty(v, "__esModule", { value: !0 }),
  (v.getComponentValidator =
    v.getBooleanValidator =
    v.getNumberArrayValidator =
    v.getFunctionValidator =
    v.getStringOrGradientValidator =
    v.getStringValidator =
    v.getNumberOrAutoValidator =
    v.getNumberOrArrayOfNumbersValidator =
    v.getNumberValidator =
    v.alphaComponent =
    v.RGBComponent =
      void 0);
const m = u,
  y = f;
function _(t) {
  return y.Util._isString(t)
    ? '"' + t + '"'
    : "[object Number]" === Object.prototype.toString.call(t) || y.Util._isBoolean(t)
    ? t
    : Object.prototype.toString.call(t);
}
(v.RGBComponent = function (t) {
  return t > 255 ? 255 : t < 0 ? 0 : Math.round(t);
}),
  (v.alphaComponent = function (t) {
    return t > 1 ? 1 : t < 1e-4 ? 1e-4 : t;
  }),
  (v.getNumberValidator = function () {
    if (m.Konva.isUnminified)
      return function (t, e) {
        return (
          y.Util._isNumber(t) ||
            y.Util.warn(_(t) + ' is a not valid value for "' + e + '" attribute. The value should be a number.'),
          t
        );
      };
  }),
  (v.getNumberOrArrayOfNumbersValidator = function (t) {
    if (m.Konva.isUnminified)
      return function (e, n) {
        let r = y.Util._isNumber(e),
          i = y.Util._isArray(e) && e.length == t;
        return (
          r ||
            i ||
            y.Util.warn(
              _(e) +
                ' is a not valid value for "' +
                n +
                '" attribute. The value should be a number or Array<number>(' +
                t +
                ")"
            ),
          e
        );
      };
  }),
  (v.getNumberOrAutoValidator = function () {
    if (m.Konva.isUnminified)
      return function (t, e) {
        return (
          y.Util._isNumber(t) ||
            "auto" === t ||
            y.Util.warn(
              _(t) + ' is a not valid value for "' + e + '" attribute. The value should be a number or "auto".'
            ),
          t
        );
      };
  }),
  (v.getStringValidator = function () {
    if (m.Konva.isUnminified)
      return function (t, e) {
        return (
          y.Util._isString(t) ||
            y.Util.warn(_(t) + ' is a not valid value for "' + e + '" attribute. The value should be a string.'),
          t
        );
      };
  }),
  (v.getStringOrGradientValidator = function () {
    if (m.Konva.isUnminified)
      return function (t, e) {
        const n = y.Util._isString(t),
          r = "[object CanvasGradient]" === Object.prototype.toString.call(t) || (t && t.addColorStop);
        return (
          n ||
            r ||
            y.Util.warn(
              _(t) +
                ' is a not valid value for "' +
                e +
                '" attribute. The value should be a string or a native gradient.'
            ),
          t
        );
      };
  }),
  (v.getFunctionValidator = function () {
    if (m.Konva.isUnminified)
      return function (t, e) {
        return (
          y.Util._isFunction(t) ||
            y.Util.warn(_(t) + ' is a not valid value for "' + e + '" attribute. The value should be a function.'),
          t
        );
      };
  }),
  (v.getNumberArrayValidator = function () {
    if (m.Konva.isUnminified)
      return function (t, e) {
        const n = Int8Array ? Object.getPrototypeOf(Int8Array) : null;
        return (
          (n && t instanceof n) ||
            (y.Util._isArray(t)
              ? t.forEach(function (t) {
                  y.Util._isNumber(t) ||
                    y.Util.warn(
                      '"' +
                        e +
                        '" attribute has non numeric element ' +
                        t +
                        ". Make sure that all elements are numbers."
                    );
                })
              : y.Util.warn(
                  _(t) + ' is a not valid value for "' + e + '" attribute. The value should be a array of numbers.'
                )),
          t
        );
      };
  }),
  (v.getBooleanValidator = function () {
    if (m.Konva.isUnminified)
      return function (t, e) {
        return (
          !0 === t ||
            !1 === t ||
            y.Util.warn(_(t) + ' is a not valid value for "' + e + '" attribute. The value should be a boolean.'),
          t
        );
      };
  }),
  (v.getComponentValidator = function (t) {
    if (m.Konva.isUnminified)
      return function (e, n) {
        return (
          null == e ||
            y.Util.isObject(e) ||
            y.Util.warn(
              _(e) +
                ' is a not valid value for "' +
                n +
                '" attribute. The value should be an object with properties ' +
                t
            ),
          e
        );
      };
  }),
  (function (t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), (t.Factory = void 0);
    const e = f,
      n = v;
    var r = "get",
      i = "set";
    t.Factory = {
      addGetterSetter(e, n, r, i, a) {
        t.Factory.addGetter(e, n, r), t.Factory.addSetter(e, n, i, a), t.Factory.addOverloadedGetterSetter(e, n);
      },
      addGetter(t, n, i) {
        var a = r + e.Util._capitalize(n);
        t.prototype[a] =
          t.prototype[a] ||
          function () {
            var t = this.attrs[n];
            return void 0 === t ? i : t;
          };
      },
      addSetter(n, r, a, o) {
        var s = i + e.Util._capitalize(r);
        n.prototype[s] || t.Factory.overWriteSetter(n, r, a, o);
      },
      overWriteSetter(t, n, r, a) {
        var o = i + e.Util._capitalize(n);
        t.prototype[o] = function (t) {
          return r && null != t && (t = r.call(this, t, n)), this._setAttr(n, t), a && a.call(this), this;
        };
      },
      addComponentsGetterSetter(a, o, s, c, l) {
        var h,
          d,
          u = s.length,
          f = e.Util._capitalize,
          p = r + f(o),
          g = i + f(o);
        a.prototype[p] = function () {
          var t = {};
          for (h = 0; h < u; h++) t[(d = s[h])] = this.getAttr(o + f(d));
          return t;
        };
        var v = (0, n.getComponentValidator)(s);
        (a.prototype[g] = function (t) {
          var e,
            n = this.attrs[o];
          for (e in (c && (t = c.call(this, t)), v && v.call(this, t, o), t))
            t.hasOwnProperty(e) && this._setAttr(o + f(e), t[e]);
          return (
            t ||
              s.forEach((t) => {
                this._setAttr(o + f(t), void 0);
              }),
            this._fireChangeEvent(o, n, t),
            l && l.call(this),
            this
          );
        }),
          t.Factory.addOverloadedGetterSetter(a, o);
      },
      addOverloadedGetterSetter(t, n) {
        var a = e.Util._capitalize(n),
          o = i + a,
          s = r + a;
        t.prototype[n] = function () {
          return arguments.length ? (this[o](arguments[0]), this) : this[s]();
        };
      },
      addDeprecatedGetterSetter(n, i, a, o) {
        e.Util.error("Adding deprecated " + i);
        var s = r + e.Util._capitalize(i),
          c = i + " property is deprecated and will be removed soon. Look at Konva change log for more information.";
        (n.prototype[s] = function () {
          e.Util.error(c);
          var t = this.attrs[i];
          return void 0 === t ? a : t;
        }),
          t.Factory.addSetter(n, i, o, function () {
            e.Util.error(c);
          }),
          t.Factory.addOverloadedGetterSetter(n, i);
      },
      backCompat(t, n) {
        e.Util.each(n, function (n, a) {
          var o = t.prototype[a],
            s = r + e.Util._capitalize(n),
            c = i + e.Util._capitalize(n);
          function l() {
            o.apply(this, arguments),
              e.Util.error('"' + n + '" method is deprecated and will be removed soon. Use ""' + a + '" instead.');
          }
          (t.prototype[n] = l), (t.prototype[s] = l), (t.prototype[c] = l);
        });
      },
      afterSetFilter() {
        this._filterUpToDate = !1;
      },
    };
  })(g);
var b = {},
  S = {};
Object.defineProperty(S, "__esModule", { value: !0 }), (S.HitContext = S.SceneContext = S.Context = void 0);
const w = f,
  x = u;
var C = [
  "arc",
  "arcTo",
  "beginPath",
  "bezierCurveTo",
  "clearRect",
  "clip",
  "closePath",
  "createLinearGradient",
  "createPattern",
  "createRadialGradient",
  "drawImage",
  "ellipse",
  "fill",
  "fillText",
  "getImageData",
  "createImageData",
  "lineTo",
  "moveTo",
  "putImageData",
  "quadraticCurveTo",
  "rect",
  "restore",
  "rotate",
  "save",
  "scale",
  "setLineDash",
  "setTransform",
  "stroke",
  "strokeText",
  "transform",
  "translate",
];
class k {
  constructor(t) {
    (this.canvas = t), x.Konva.enableTrace && ((this.traceArr = []), this._enableTrace());
  }
  fillShape(t) {
    t.fillEnabled() && this._fill(t);
  }
  _fill(t) {}
  strokeShape(t) {
    t.hasStroke() && this._stroke(t);
  }
  _stroke(t) {}
  fillStrokeShape(t) {
    t.attrs.fillAfterStrokeEnabled
      ? (this.strokeShape(t), this.fillShape(t))
      : (this.fillShape(t), this.strokeShape(t));
  }
  getTrace(t, e) {
    var n,
      r,
      i,
      a,
      o = this.traceArr,
      s = o.length,
      c = "";
    for (n = 0; n < s; n++)
      (i = (r = o[n]).method)
        ? ((a = r.args),
          (c += i),
          t
            ? (c += "()")
            : w.Util._isArray(a[0])
            ? (c += "([" + a.join(",") + "])")
            : (e && (a = a.map((t) => ("number" == typeof t ? Math.floor(t) : t))), (c += "(" + a.join(",") + ")")))
        : ((c += r.property), t || (c += "=" + r.val)),
        (c += ";");
    return c;
  }
  clearTrace() {
    this.traceArr = [];
  }
  _trace(t) {
    var e = this.traceArr;
    e.push(t), e.length >= 100 && e.shift();
  }
  reset() {
    var t = this.getCanvas().getPixelRatio();
    this.setTransform(1 * t, 0, 0, 1 * t, 0, 0);
  }
  getCanvas() {
    return this.canvas;
  }
  clear(t) {
    var e = this.getCanvas();
    t
      ? this.clearRect(t.x || 0, t.y || 0, t.width || 0, t.height || 0)
      : this.clearRect(0, 0, e.getWidth() / e.pixelRatio, e.getHeight() / e.pixelRatio);
  }
  _applyLineCap(t) {
    const e = t.attrs.lineCap;
    e && this.setAttr("lineCap", e);
  }
  _applyOpacity(t) {
    var e = t.getAbsoluteOpacity();
    1 !== e && this.setAttr("globalAlpha", e);
  }
  _applyLineJoin(t) {
    const e = t.attrs.lineJoin;
    e && this.setAttr("lineJoin", e);
  }
  setAttr(t, e) {
    this._context[t] = e;
  }
  arc(t, e, n, r, i, a) {
    this._context.arc(t, e, n, r, i, a);
  }
  arcTo(t, e, n, r, i) {
    this._context.arcTo(t, e, n, r, i);
  }
  beginPath() {
    this._context.beginPath();
  }
  bezierCurveTo(t, e, n, r, i, a) {
    this._context.bezierCurveTo(t, e, n, r, i, a);
  }
  clearRect(t, e, n, r) {
    this._context.clearRect(t, e, n, r);
  }
  clip(...t) {
    this._context.clip.apply(this._context, t);
  }
  closePath() {
    this._context.closePath();
  }
  createImageData(t, e) {
    var n = arguments;
    return 2 === n.length
      ? this._context.createImageData(t, e)
      : 1 === n.length
      ? this._context.createImageData(t)
      : void 0;
  }
  createLinearGradient(t, e, n, r) {
    return this._context.createLinearGradient(t, e, n, r);
  }
  createPattern(t, e) {
    return this._context.createPattern(t, e);
  }
  createRadialGradient(t, e, n, r, i, a) {
    return this._context.createRadialGradient(t, e, n, r, i, a);
  }
  drawImage(t, e, n, r, i, a, o, s, c) {
    var l = arguments,
      h = this._context;
    3 === l.length
      ? h.drawImage(t, e, n)
      : 5 === l.length
      ? h.drawImage(t, e, n, r, i)
      : 9 === l.length && h.drawImage(t, e, n, r, i, a, o, s, c);
  }
  ellipse(t, e, n, r, i, a, o, s) {
    this._context.ellipse(t, e, n, r, i, a, o, s);
  }
  isPointInPath(t, e, n, r) {
    return n ? this._context.isPointInPath(n, t, e, r) : this._context.isPointInPath(t, e, r);
  }
  fill(...t) {
    this._context.fill.apply(this._context, t);
  }
  fillRect(t, e, n, r) {
    this._context.fillRect(t, e, n, r);
  }
  strokeRect(t, e, n, r) {
    this._context.strokeRect(t, e, n, r);
  }
  fillText(t, e, n, r) {
    r ? this._context.fillText(t, e, n, r) : this._context.fillText(t, e, n);
  }
  measureText(t) {
    return this._context.measureText(t);
  }
  getImageData(t, e, n, r) {
    return this._context.getImageData(t, e, n, r);
  }
  lineTo(t, e) {
    this._context.lineTo(t, e);
  }
  moveTo(t, e) {
    this._context.moveTo(t, e);
  }
  rect(t, e, n, r) {
    this._context.rect(t, e, n, r);
  }
  putImageData(t, e, n) {
    this._context.putImageData(t, e, n);
  }
  quadraticCurveTo(t, e, n, r) {
    this._context.quadraticCurveTo(t, e, n, r);
  }
  restore() {
    this._context.restore();
  }
  rotate(t) {
    this._context.rotate(t);
  }
  save() {
    this._context.save();
  }
  scale(t, e) {
    this._context.scale(t, e);
  }
  setLineDash(t) {
    this._context.setLineDash
      ? this._context.setLineDash(t)
      : "mozDash" in this._context
      ? (this._context.mozDash = t)
      : "webkitLineDash" in this._context && (this._context.webkitLineDash = t);
  }
  getLineDash() {
    return this._context.getLineDash();
  }
  setTransform(t, e, n, r, i, a) {
    this._context.setTransform(t, e, n, r, i, a);
  }
  stroke(t) {
    t ? this._context.stroke(t) : this._context.stroke();
  }
  strokeText(t, e, n, r) {
    this._context.strokeText(t, e, n, r);
  }
  transform(t, e, n, r, i, a) {
    this._context.transform(t, e, n, r, i, a);
  }
  translate(t, e) {
    this._context.translate(t, e);
  }
  _enableTrace() {
    var t,
      e,
      n = this,
      r = C.length,
      i = this.setAttr,
      a = function (t) {
        var r,
          i = n[t];
        n[t] = function () {
          return (
            (e = (function (t) {
              var e,
                n,
                r = [],
                i = t.length,
                a = w.Util;
              for (e = 0; e < i; e++)
                (n = t[e]), a._isNumber(n) ? (n = Math.round(1e3 * n) / 1e3) : a._isString(n) || (n += ""), r.push(n);
              return r;
            })(Array.prototype.slice.call(arguments, 0))),
            (r = i.apply(n, arguments)),
            n._trace({ method: t, args: e }),
            r
          );
        };
      };
    for (t = 0; t < r; t++) a(C[t]);
    n.setAttr = function () {
      i.apply(n, arguments);
      var t = arguments[0],
        e = arguments[1];
      ("shadowOffsetX" !== t && "shadowOffsetY" !== t && "shadowBlur" !== t) || (e /= this.canvas.getPixelRatio()),
        n._trace({ property: t, val: e });
    };
  }
  _applyGlobalCompositeOperation(t) {
    const e = t.attrs.globalCompositeOperation;
    !e || "source-over" === e || this.setAttr("globalCompositeOperation", e);
  }
}
(S.Context = k),
  [
    "fillStyle",
    "strokeStyle",
    "shadowColor",
    "shadowBlur",
    "shadowOffsetX",
    "shadowOffsetY",
    "lineCap",
    "lineDashOffset",
    "lineJoin",
    "lineWidth",
    "miterLimit",
    "font",
    "textAlign",
    "textBaseline",
    "globalAlpha",
    "globalCompositeOperation",
    "imageSmoothingEnabled",
  ].forEach(function (t) {
    Object.defineProperty(k.prototype, t, {
      get() {
        return this._context[t];
      },
      set(e) {
        this._context[t] = e;
      },
    });
  });
S.SceneContext = class extends k {
  constructor(t, { willReadFrequently: e = !1 } = {}) {
    super(t), (this._context = t._canvas.getContext("2d", { willReadFrequently: e }));
  }
  _fillColor(t) {
    var e = t.fill();
    this.setAttr("fillStyle", e), t._fillFunc(this);
  }
  _fillPattern(t) {
    this.setAttr("fillStyle", t._getFillPattern()), t._fillFunc(this);
  }
  _fillLinearGradient(t) {
    var e = t._getLinearGradient();
    e && (this.setAttr("fillStyle", e), t._fillFunc(this));
  }
  _fillRadialGradient(t) {
    const e = t._getRadialGradient();
    e && (this.setAttr("fillStyle", e), t._fillFunc(this));
  }
  _fill(t) {
    const e = t.fill(),
      n = t.getFillPriority();
    if (e && "color" === n) return void this._fillColor(t);
    const r = t.getFillPatternImage();
    if (r && "pattern" === n) return void this._fillPattern(t);
    const i = t.getFillLinearGradientColorStops();
    if (i && "linear-gradient" === n) return void this._fillLinearGradient(t);
    const a = t.getFillRadialGradientColorStops();
    a && "radial-gradient" === n
      ? this._fillRadialGradient(t)
      : e
      ? this._fillColor(t)
      : r
      ? this._fillPattern(t)
      : i
      ? this._fillLinearGradient(t)
      : a && this._fillRadialGradient(t);
  }
  _strokeLinearGradient(t) {
    const e = t.getStrokeLinearGradientStartPoint(),
      n = t.getStrokeLinearGradientEndPoint(),
      r = t.getStrokeLinearGradientColorStops(),
      i = this.createLinearGradient(e.x, e.y, n.x, n.y);
    if (r) {
      for (var a = 0; a < r.length; a += 2) i.addColorStop(r[a], r[a + 1]);
      this.setAttr("strokeStyle", i);
    }
  }
  _stroke(t) {
    var e = t.dash(),
      n = t.getStrokeScaleEnabled();
    if (t.hasStroke()) {
      if (!n) {
        this.save();
        var r = this.getCanvas().getPixelRatio();
        this.setTransform(r, 0, 0, r, 0, 0);
      }
      this._applyLineCap(t),
        e && t.dashEnabled() && (this.setLineDash(e), this.setAttr("lineDashOffset", t.dashOffset())),
        this.setAttr("lineWidth", t.strokeWidth()),
        t.getShadowForStrokeEnabled() || this.setAttr("shadowColor", "rgba(0,0,0,0)"),
        t.getStrokeLinearGradientColorStops() ? this._strokeLinearGradient(t) : this.setAttr("strokeStyle", t.stroke()),
        t._strokeFunc(this),
        n || this.restore();
    }
  }
  _applyShadow(t) {
    var e,
      n,
      r,
      i = null !== (e = t.getShadowRGBA()) && void 0 !== e ? e : "black",
      a = null !== (n = t.getShadowBlur()) && void 0 !== n ? n : 5,
      o = null !== (r = t.getShadowOffset()) && void 0 !== r ? r : { x: 0, y: 0 },
      s = t.getAbsoluteScale(),
      c = this.canvas.getPixelRatio(),
      l = s.x * c,
      h = s.y * c;
    this.setAttr("shadowColor", i),
      this.setAttr("shadowBlur", a * Math.min(Math.abs(l), Math.abs(h))),
      this.setAttr("shadowOffsetX", o.x * l),
      this.setAttr("shadowOffsetY", o.y * h);
  }
};
(S.HitContext = class extends k {
  constructor(t) {
    super(t), (this._context = t._canvas.getContext("2d", { willReadFrequently: !0 }));
  }
  _fill(t) {
    this.save(), this.setAttr("fillStyle", t.colorKey), t._fillFuncHit(this), this.restore();
  }
  strokeShape(t) {
    t.hasHitStroke() && this._stroke(t);
  }
  _stroke(t) {
    if (t.hasHitStroke()) {
      const i = t.getStrokeScaleEnabled();
      if (!i) {
        this.save();
        var e = this.getCanvas().getPixelRatio();
        this.setTransform(e, 0, 0, e, 0, 0);
      }
      this._applyLineCap(t);
      var n = t.hitStrokeWidth(),
        r = "auto" === n ? t.strokeWidth() : n;
      this.setAttr("lineWidth", r),
        this.setAttr("strokeStyle", t.colorKey),
        t._strokeFuncHit(this),
        i || this.restore();
    }
  }
}),
  Object.defineProperty(b, "__esModule", { value: !0 }),
  (b.HitCanvas = b.SceneCanvas = b.Canvas = void 0);
const E = f,
  N = S,
  O = u,
  A = g,
  P = v;
var T;
class D {
  constructor(t) {
    (this.pixelRatio = 1), (this.width = 0), (this.height = 0), (this.isCache = !1);
    var e =
      (t || {}).pixelRatio ||
      O.Konva.pixelRatio ||
      (function () {
        if (T) return T;
        var t = E.Util.createCanvasElement(),
          e = t.getContext("2d");
        return (
          (T =
            (O.Konva._global.devicePixelRatio || 1) /
            (e.webkitBackingStorePixelRatio ||
              e.mozBackingStorePixelRatio ||
              e.msBackingStorePixelRatio ||
              e.oBackingStorePixelRatio ||
              e.backingStorePixelRatio ||
              1)),
          E.Util.releaseCanvas(t),
          T
        );
      })();
    (this.pixelRatio = e),
      (this._canvas = E.Util.createCanvasElement()),
      (this._canvas.style.padding = "0"),
      (this._canvas.style.margin = "0"),
      (this._canvas.style.border = "0"),
      (this._canvas.style.background = "transparent"),
      (this._canvas.style.position = "absolute"),
      (this._canvas.style.top = "0"),
      (this._canvas.style.left = "0");
  }
  getContext() {
    return this.context;
  }
  getPixelRatio() {
    return this.pixelRatio;
  }
  setPixelRatio(t) {
    var e = this.pixelRatio;
    (this.pixelRatio = t), this.setSize(this.getWidth() / e, this.getHeight() / e);
  }
  setWidth(t) {
    (this.width = this._canvas.width = t * this.pixelRatio), (this._canvas.style.width = t + "px");
    var e = this.pixelRatio;
    this.getContext()._context.scale(e, e);
  }
  setHeight(t) {
    (this.height = this._canvas.height = t * this.pixelRatio), (this._canvas.style.height = t + "px");
    var e = this.pixelRatio;
    this.getContext()._context.scale(e, e);
  }
  getWidth() {
    return this.width;
  }
  getHeight() {
    return this.height;
  }
  setSize(t, e) {
    this.setWidth(t || 0), this.setHeight(e || 0);
  }
  toDataURL(t, e) {
    try {
      return this._canvas.toDataURL(t, e);
    } catch (t) {
      try {
        return this._canvas.toDataURL();
      } catch (t) {
        return (
          E.Util.error(
            "Unable to get data URL. " +
              t.message +
              " For more info read https://konvajs.org/docs/posts/Tainted_Canvas.html."
          ),
          ""
        );
      }
    }
  }
}
(b.Canvas = D), A.Factory.addGetterSetter(D, "pixelRatio", void 0, (0, P.getNumberValidator)());
b.SceneCanvas = class extends D {
  constructor(t = { width: 0, height: 0, willReadFrequently: !1 }) {
    super(t),
      (this.context = new N.SceneContext(this, { willReadFrequently: t.willReadFrequently })),
      this.setSize(t.width, t.height);
  }
};
b.HitCanvas = class extends D {
  constructor(t = { width: 0, height: 0 }) {
    super(t), (this.hitCanvas = !0), (this.context = new N.HitContext(this)), this.setSize(t.width, t.height);
  }
};
var F = {};
!(function (t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), (t.DD = void 0);
  const e = u,
    n = f;
  (t.DD = {
    get isDragging() {
      var e = !1;
      return (
        t.DD._dragElements.forEach((t) => {
          "dragging" === t.dragStatus && (e = !0);
        }),
        e
      );
    },
    justDragged: !1,
    get node() {
      var e;
      return (
        t.DD._dragElements.forEach((t) => {
          e = t.node;
        }),
        e
      );
    },
    _dragElements: new Map(),
    _drag(e) {
      const r = [];
      t.DD._dragElements.forEach((t, i) => {
        const { node: a } = t,
          o = a.getStage();
        o.setPointersPositions(e), void 0 === t.pointerId && (t.pointerId = n.Util._getFirstPointerId(e));
        const s = o._changedPointerPositions.find((e) => e.id === t.pointerId);
        if (s) {
          if ("dragging" !== t.dragStatus) {
            var c = a.dragDistance();
            if (Math.max(Math.abs(s.x - t.startPointerPos.x), Math.abs(s.y - t.startPointerPos.y)) < c) return;
            if ((a.startDrag({ evt: e }), !a.isDragging())) return;
          }
          a._setDragPosition(e, t), r.push(a);
        }
      }),
        r.forEach((t) => {
          t.fire("dragmove", { type: "dragmove", target: t, evt: e }, !0);
        });
    },
    _endDragBefore(n) {
      const r = [];
      t.DD._dragElements.forEach((i) => {
        const { node: a } = i,
          o = a.getStage();
        n && o.setPointersPositions(n);
        if (!o._changedPointerPositions.find((t) => t.id === i.pointerId)) return;
        ("dragging" !== i.dragStatus && "stopped" !== i.dragStatus) ||
          ((t.DD.justDragged = !0),
          (e.Konva._mouseListenClick = !1),
          (e.Konva._touchListenClick = !1),
          (e.Konva._pointerListenClick = !1),
          (i.dragStatus = "stopped"));
        const s = i.node.getLayer() || (i.node instanceof e.Konva.Stage && i.node);
        s && -1 === r.indexOf(s) && r.push(s);
      }),
        r.forEach((t) => {
          t.draw();
        });
    },
    _endDragAfter(e) {
      t.DD._dragElements.forEach((n, r) => {
        "stopped" === n.dragStatus && n.node.fire("dragend", { type: "dragend", target: n.node, evt: e }, !0),
          "dragging" !== n.dragStatus && t.DD._dragElements.delete(r);
      });
    },
  }),
    e.Konva.isBrowser &&
      (window.addEventListener("mouseup", t.DD._endDragBefore, !0),
      window.addEventListener("touchend", t.DD._endDragBefore, !0),
      window.addEventListener("mousemove", t.DD._drag),
      window.addEventListener("touchmove", t.DD._drag),
      window.addEventListener("mouseup", t.DD._endDragAfter, !1),
      window.addEventListener("touchend", t.DD._endDragAfter, !1));
})(F),
  Object.defineProperty(p, "__esModule", { value: !0 }),
  (p.Node = void 0);
const M = f,
  R = g,
  L = b,
  I = u,
  G = F,
  $ = v;
var V = "absoluteOpacity",
  U = "allEventListeners",
  j = "absoluteTransform",
  B = "absoluteScale",
  H = "canvas",
  W = "listening",
  z = "mouseenter",
  K = "mouseleave",
  Y = "Shape",
  q = " ",
  X = "stage",
  J = "transform",
  Q = "visible",
  Z = [
    "xChange.konva",
    "yChange.konva",
    "scaleXChange.konva",
    "scaleYChange.konva",
    "skewXChange.konva",
    "skewYChange.konva",
    "rotationChange.konva",
    "offsetXChange.konva",
    "offsetYChange.konva",
    "transformsEnabledChange.konva",
  ].join(q);
let tt = 1;
class et {
  constructor(t) {
    (this._id = tt++),
      (this.eventListeners = {}),
      (this.attrs = {}),
      (this.index = 0),
      (this._allEventListeners = null),
      (this.parent = null),
      (this._cache = new Map()),
      (this._attachedDepsListeners = new Map()),
      (this._lastPos = null),
      (this._batchingTransformChange = !1),
      (this._needClearTransformCache = !1),
      (this._filterUpToDate = !1),
      (this._isUnderCache = !1),
      (this._dragEventId = null),
      (this._shouldFireChangeEvents = !1),
      this.setAttrs(t),
      (this._shouldFireChangeEvents = !0);
  }
  hasChildren() {
    return !1;
  }
  _clearCache(t) {
    (t !== J && t !== j) || !this._cache.get(t)
      ? t
        ? this._cache.delete(t)
        : this._cache.clear()
      : (this._cache.get(t).dirty = !0);
  }
  _getCache(t, e) {
    var n = this._cache.get(t);
    return (void 0 === n || ((t === J || t === j) && !0 === n.dirty)) && ((n = e.call(this)), this._cache.set(t, n)), n;
  }
  _calculate(t, e, n) {
    if (!this._attachedDepsListeners.get(t)) {
      const n = e.map((t) => t + "Change.konva").join(q);
      this.on(n, () => {
        this._clearCache(t);
      }),
        this._attachedDepsListeners.set(t, !0);
    }
    return this._getCache(t, n);
  }
  _getCanvasCache() {
    return this._cache.get(H);
  }
  _clearSelfAndDescendantCache(t) {
    this._clearCache(t), t === j && this.fire("absoluteTransformChange");
  }
  clearCache() {
    if (this._cache.has(H)) {
      const { scene: t, filter: e, hit: n } = this._cache.get(H);
      M.Util.releaseCanvas(t, e, n), this._cache.delete(H);
    }
    return this._clearSelfAndDescendantCache(), this._requestDraw(), this;
  }
  cache(t) {
    var e = t || {},
      n = {};
    (void 0 !== e.x && void 0 !== e.y && void 0 !== e.width && void 0 !== e.height) ||
      (n = this.getClientRect({ skipTransform: !0, relativeTo: this.getParent() || void 0 }));
    var r = Math.ceil(e.width || n.width),
      i = Math.ceil(e.height || n.height),
      a = e.pixelRatio,
      o = void 0 === e.x ? Math.floor(n.x) : e.x,
      s = void 0 === e.y ? Math.floor(n.y) : e.y,
      c = e.offset || 0,
      l = e.drawBorder || !1,
      h = e.hitCanvasPixelRatio || 1;
    if (r && i) {
      (r += 2 * c + 1), (i += 2 * c + 1), (o -= c), (s -= c);
      var d = new L.SceneCanvas({ pixelRatio: a, width: r, height: i }),
        u = new L.SceneCanvas({ pixelRatio: a, width: 0, height: 0, willReadFrequently: !0 }),
        f = new L.HitCanvas({ pixelRatio: h, width: r, height: i }),
        p = d.getContext(),
        g = f.getContext();
      return (
        (f.isCache = !0),
        (d.isCache = !0),
        this._cache.delete(H),
        (this._filterUpToDate = !1),
        !1 === e.imageSmoothingEnabled &&
          ((d.getContext()._context.imageSmoothingEnabled = !1), (u.getContext()._context.imageSmoothingEnabled = !1)),
        p.save(),
        g.save(),
        p.translate(-o, -s),
        g.translate(-o, -s),
        (this._isUnderCache = !0),
        this._clearSelfAndDescendantCache(V),
        this._clearSelfAndDescendantCache(B),
        this.drawScene(d, this),
        this.drawHit(f, this),
        (this._isUnderCache = !1),
        p.restore(),
        g.restore(),
        l &&
          (p.save(),
          p.beginPath(),
          p.rect(0, 0, r, i),
          p.closePath(),
          p.setAttr("strokeStyle", "red"),
          p.setAttr("lineWidth", 5),
          p.stroke(),
          p.restore()),
        this._cache.set(H, { scene: d, filter: u, hit: f, x: o, y: s }),
        this._requestDraw(),
        this
      );
    }
    M.Util.error("Can not cache the node. Width or height of the node equals 0. Caching is skipped.");
  }
  isCached() {
    return this._cache.has(H);
  }
  getClientRect(t) {
    throw new Error('abstract "getClientRect" method call');
  }
  _transformedRect(t, e) {
    var n = [
        { x: t.x, y: t.y },
        { x: t.x + t.width, y: t.y },
        { x: t.x + t.width, y: t.y + t.height },
        { x: t.x, y: t.y + t.height },
      ],
      r = 1 / 0,
      i = 1 / 0,
      a = -1 / 0,
      o = -1 / 0,
      s = this.getAbsoluteTransform(e);
    return (
      n.forEach(function (t) {
        var e = s.point(t);
        void 0 === r && ((r = a = e.x), (i = o = e.y)),
          (r = Math.min(r, e.x)),
          (i = Math.min(i, e.y)),
          (a = Math.max(a, e.x)),
          (o = Math.max(o, e.y));
      }),
      { x: r, y: i, width: a - r, height: o - i }
    );
  }
  _drawCachedSceneCanvas(t) {
    t.save(), t._applyOpacity(this), t._applyGlobalCompositeOperation(this);
    const e = this._getCanvasCache();
    t.translate(e.x, e.y);
    var n = this._getCachedSceneCanvas(),
      r = n.pixelRatio;
    t.drawImage(n._canvas, 0, 0, n.width / r, n.height / r), t.restore();
  }
  _drawCachedHitCanvas(t) {
    var e = this._getCanvasCache(),
      n = e.hit;
    t.save(),
      t.translate(e.x, e.y),
      t.drawImage(n._canvas, 0, 0, n.width / n.pixelRatio, n.height / n.pixelRatio),
      t.restore();
  }
  _getCachedSceneCanvas() {
    var t,
      e,
      n,
      r,
      i = this.filters(),
      a = this._getCanvasCache(),
      o = a.scene,
      s = a.filter,
      c = s.getContext();
    if (i) {
      if (!this._filterUpToDate) {
        var l = o.pixelRatio;
        s.setSize(o.width / o.pixelRatio, o.height / o.pixelRatio);
        try {
          for (
            t = i.length,
              c.clear(),
              c.drawImage(o._canvas, 0, 0, o.getWidth() / l, o.getHeight() / l),
              e = c.getImageData(0, 0, s.getWidth(), s.getHeight()),
              n = 0;
            n < t;
            n++
          )
            "function" == typeof (r = i[n])
              ? (r.call(this, e), c.putImageData(e, 0, 0))
              : M.Util.error(
                  "Filter should be type of function, but got " + typeof r + " instead. Please check correct filters"
                );
        } catch (t) {
          M.Util.error(
            "Unable to apply filter. " +
              t.message +
              " This post my help you https://konvajs.org/docs/posts/Tainted_Canvas.html."
          );
        }
        this._filterUpToDate = !0;
      }
      return s;
    }
    return o;
  }
  on(t, e) {
    if ((this._cache && this._cache.delete(U), 3 === arguments.length)) return this._delegate.apply(this, arguments);
    var n,
      r,
      i,
      a,
      o = t.split(q),
      s = o.length;
    for (n = 0; n < s; n++)
      (i = (r = o[n].split("."))[0]),
        (a = r[1] || ""),
        this.eventListeners[i] || (this.eventListeners[i] = []),
        this.eventListeners[i].push({ name: a, handler: e });
    return this;
  }
  off(t, e) {
    var n,
      r,
      i,
      a,
      o,
      s = (t || "").split(q),
      c = s.length;
    if ((this._cache && this._cache.delete(U), !t)) for (r in this.eventListeners) this._off(r);
    for (n = 0; n < c; n++)
      if (((a = (i = s[n].split("."))[0]), (o = i[1]), a)) this.eventListeners[a] && this._off(a, o, e);
      else for (r in this.eventListeners) this._off(r, o, e);
    return this;
  }
  dispatchEvent(t) {
    var e = { target: this, type: t.type, evt: t };
    return this.fire(t.type, e), this;
  }
  addEventListener(t, e) {
    return (
      this.on(t, function (t) {
        e.call(this, t.evt);
      }),
      this
    );
  }
  removeEventListener(t) {
    return this.off(t), this;
  }
  _delegate(t, e, n) {
    var r = this;
    this.on(t, function (t) {
      for (var i = t.target.findAncestors(e, !0, r), a = 0; a < i.length; a++)
        ((t = M.Util.cloneObject(t)).currentTarget = i[a]), n.call(i[a], t);
    });
  }
  remove() {
    return this.isDragging() && this.stopDrag(), G.DD._dragElements.delete(this._id), this._remove(), this;
  }
  _clearCaches() {
    this._clearSelfAndDescendantCache(j),
      this._clearSelfAndDescendantCache(V),
      this._clearSelfAndDescendantCache(B),
      this._clearSelfAndDescendantCache(X),
      this._clearSelfAndDescendantCache(Q),
      this._clearSelfAndDescendantCache(W);
  }
  _remove() {
    this._clearCaches();
    var t = this.getParent();
    t && t.children && (t.children.splice(this.index, 1), t._setChildrenIndices(), (this.parent = null));
  }
  destroy() {
    return this.remove(), this.clearCache(), this;
  }
  getAttr(t) {
    var e = "get" + M.Util._capitalize(t);
    return M.Util._isFunction(this[e]) ? this[e]() : this.attrs[t];
  }
  getAncestors() {
    for (var t = this.getParent(), e = []; t; ) e.push(t), (t = t.getParent());
    return e;
  }
  getAttrs() {
    return this.attrs || {};
  }
  setAttrs(t) {
    return (
      this._batchTransformChanges(() => {
        var e, n;
        if (!t) return this;
        for (e in t)
          "children" !== e &&
            ((n = "set" + M.Util._capitalize(e)), M.Util._isFunction(this[n]) ? this[n](t[e]) : this._setAttr(e, t[e]));
      }),
      this
    );
  }
  isListening() {
    return this._getCache(W, this._isListening);
  }
  _isListening(t) {
    if (!this.listening()) return !1;
    const e = this.getParent();
    return !e || e === t || this === t || e._isListening(t);
  }
  isVisible() {
    return this._getCache(Q, this._isVisible);
  }
  _isVisible(t) {
    if (!this.visible()) return !1;
    const e = this.getParent();
    return !e || e === t || this === t || e._isVisible(t);
  }
  shouldDrawHit(t, e = !1) {
    if (t) return this._isVisible(t) && this._isListening(t);
    var n = this.getLayer(),
      r = !1;
    G.DD._dragElements.forEach((t) => {
      "dragging" === t.dragStatus && ("Stage" === t.node.nodeType || t.node.getLayer() === n) && (r = !0);
    });
    var i = !e && !I.Konva.hitOnDragEnabled && r;
    return this.isListening() && this.isVisible() && !i;
  }
  show() {
    return this.visible(!0), this;
  }
  hide() {
    return this.visible(!1), this;
  }
  getZIndex() {
    return this.index || 0;
  }
  getAbsoluteZIndex() {
    var t,
      e,
      n,
      r,
      i = this.getDepth(),
      a = this,
      o = 0;
    const s = this.getStage();
    return (
      "Stage" !== a.nodeType &&
        s &&
        (function s(c) {
          for (t = [], e = c.length, n = 0; n < e; n++)
            (r = c[n]), o++, r.nodeType !== Y && (t = t.concat(r.getChildren().slice())), r._id === a._id && (n = e);
          t.length > 0 && t[0].getDepth() <= i && s(t);
        })(s.getChildren()),
      o
    );
  }
  getDepth() {
    for (var t = 0, e = this.parent; e; ) t++, (e = e.parent);
    return t;
  }
  _batchTransformChanges(t) {
    (this._batchingTransformChange = !0),
      t(),
      (this._batchingTransformChange = !1),
      this._needClearTransformCache && (this._clearCache(J), this._clearSelfAndDescendantCache(j)),
      (this._needClearTransformCache = !1);
  }
  setPosition(t) {
    return (
      this._batchTransformChanges(() => {
        this.x(t.x), this.y(t.y);
      }),
      this
    );
  }
  getPosition() {
    return { x: this.x(), y: this.y() };
  }
  getRelativePointerPosition() {
    const t = this.getStage();
    if (!t) return null;
    var e = t.getPointerPosition();
    if (!e) return null;
    var n = this.getAbsoluteTransform().copy();
    return n.invert(), n.point(e);
  }
  getAbsolutePosition(t) {
    let e = !1,
      n = this.parent;
    for (; n; ) {
      if (n.isCached()) {
        e = !0;
        break;
      }
      n = n.parent;
    }
    e && !t && (t = !0);
    var r = this.getAbsoluteTransform(t).getMatrix(),
      i = new M.Transform(),
      a = this.offset();
    return (i.m = r.slice()), i.translate(a.x, a.y), i.getTranslation();
  }
  setAbsolutePosition(t) {
    const { x: e, y: n, ...r } = this._clearTransform();
    (this.attrs.x = e), (this.attrs.y = n), this._clearCache(J);
    var i = this._getAbsoluteTransform().copy();
    return (
      i.invert(),
      i.translate(t.x, t.y),
      (t = { x: this.attrs.x + i.getTranslation().x, y: this.attrs.y + i.getTranslation().y }),
      this._setTransform(r),
      this.setPosition({ x: t.x, y: t.y }),
      this._clearCache(J),
      this._clearSelfAndDescendantCache(j),
      this
    );
  }
  _setTransform(t) {
    var e;
    for (e in t) this.attrs[e] = t[e];
  }
  _clearTransform() {
    var t = {
      x: this.x(),
      y: this.y(),
      rotation: this.rotation(),
      scaleX: this.scaleX(),
      scaleY: this.scaleY(),
      offsetX: this.offsetX(),
      offsetY: this.offsetY(),
      skewX: this.skewX(),
      skewY: this.skewY(),
    };
    return (
      (this.attrs.x = 0),
      (this.attrs.y = 0),
      (this.attrs.rotation = 0),
      (this.attrs.scaleX = 1),
      (this.attrs.scaleY = 1),
      (this.attrs.offsetX = 0),
      (this.attrs.offsetY = 0),
      (this.attrs.skewX = 0),
      (this.attrs.skewY = 0),
      t
    );
  }
  move(t) {
    var e = t.x,
      n = t.y,
      r = this.x(),
      i = this.y();
    return void 0 !== e && (r += e), void 0 !== n && (i += n), this.setPosition({ x: r, y: i }), this;
  }
  _eachAncestorReverse(t, e) {
    var n,
      r,
      i = [],
      a = this.getParent();
    if (!e || e._id !== this._id) {
      for (i.unshift(this); a && (!e || a._id !== e._id); ) i.unshift(a), (a = a.parent);
      for (n = i.length, r = 0; r < n; r++) t(i[r]);
    }
  }
  rotate(t) {
    return this.rotation(this.rotation() + t), this;
  }
  moveToTop() {
    if (!this.parent) return M.Util.warn("Node has no parent. moveToTop function is ignored."), !1;
    var t = this.index;
    return (
      t < this.parent.getChildren().length - 1 &&
      (this.parent.children.splice(t, 1), this.parent.children.push(this), this.parent._setChildrenIndices(), !0)
    );
  }
  moveUp() {
    if (!this.parent) return M.Util.warn("Node has no parent. moveUp function is ignored."), !1;
    var t = this.index;
    return (
      t < this.parent.getChildren().length - 1 &&
      (this.parent.children.splice(t, 1),
      this.parent.children.splice(t + 1, 0, this),
      this.parent._setChildrenIndices(),
      !0)
    );
  }
  moveDown() {
    if (!this.parent) return M.Util.warn("Node has no parent. moveDown function is ignored."), !1;
    var t = this.index;
    return (
      t > 0 &&
      (this.parent.children.splice(t, 1),
      this.parent.children.splice(t - 1, 0, this),
      this.parent._setChildrenIndices(),
      !0)
    );
  }
  moveToBottom() {
    if (!this.parent) return M.Util.warn("Node has no parent. moveToBottom function is ignored."), !1;
    var t = this.index;
    return (
      t > 0 &&
      (this.parent.children.splice(t, 1), this.parent.children.unshift(this), this.parent._setChildrenIndices(), !0)
    );
  }
  setZIndex(t) {
    if (!this.parent) return M.Util.warn("Node has no parent. zIndex parameter is ignored."), this;
    (t < 0 || t >= this.parent.children.length) &&
      M.Util.warn(
        "Unexpected value " +
          t +
          " for zIndex property. zIndex is just index of a node in children of its parent. Expected value is from 0 to " +
          (this.parent.children.length - 1) +
          "."
      );
    var e = this.index;
    return (
      this.parent.children.splice(e, 1),
      this.parent.children.splice(t, 0, this),
      this.parent._setChildrenIndices(),
      this
    );
  }
  getAbsoluteOpacity() {
    return this._getCache(V, this._getAbsoluteOpacity);
  }
  _getAbsoluteOpacity() {
    var t = this.opacity(),
      e = this.getParent();
    return e && !e._isUnderCache && (t *= e.getAbsoluteOpacity()), t;
  }
  moveTo(t) {
    return this.getParent() !== t && (this._remove(), t.add(this)), this;
  }
  toObject() {
    var t,
      e,
      n,
      r,
      i = {},
      a = this.getAttrs();
    for (t in ((i.attrs = {}), a))
      (e = a[t]),
        (M.Util.isObject(e) && !M.Util._isPlainObject(e) && !M.Util._isArray(e)) ||
          ((n = "function" == typeof this[t] && this[t]),
          delete a[t],
          (r = n ? n.call(this) : null),
          (a[t] = e),
          r !== e && (i.attrs[t] = e));
    return (i.className = this.getClassName()), M.Util._prepareToStringify(i);
  }
  toJSON() {
    return JSON.stringify(this.toObject());
  }
  getParent() {
    return this.parent;
  }
  findAncestors(t, e, n) {
    var r = [];
    e && this._isMatch(t) && r.push(this);
    for (var i = this.parent; i; ) {
      if (i === n) return r;
      i._isMatch(t) && r.push(i), (i = i.parent);
    }
    return r;
  }
  isAncestorOf(t) {
    return !1;
  }
  findAncestor(t, e, n) {
    return this.findAncestors(t, e, n)[0];
  }
  _isMatch(t) {
    if (!t) return !1;
    if ("function" == typeof t) return t(this);
    var e,
      n,
      r = t.replace(/ /g, "").split(","),
      i = r.length;
    for (e = 0; e < i; e++)
      if (
        ((n = r[e]),
        M.Util.isValidSelector(n) ||
          (M.Util.warn('Selector "' + n + '" is invalid. Allowed selectors examples are "#foo", ".bar" or "Group".'),
          M.Util.warn(
            'If you have a custom shape with such className, please change it to start with upper letter like "Triangle".'
          ),
          M.Util.warn("Konva is awesome, right?")),
        "#" === n.charAt(0))
      ) {
        if (this.id() === n.slice(1)) return !0;
      } else if ("." === n.charAt(0)) {
        if (this.hasName(n.slice(1))) return !0;
      } else if (this.className === n || this.nodeType === n) return !0;
    return !1;
  }
  getLayer() {
    var t = this.getParent();
    return t ? t.getLayer() : null;
  }
  getStage() {
    return this._getCache(X, this._getStage);
  }
  _getStage() {
    var t = this.getParent();
    return t ? t.getStage() : null;
  }
  fire(t, e = {}, n) {
    return (e.target = e.target || this), n ? this._fireAndBubble(t, e) : this._fire(t, e), this;
  }
  getAbsoluteTransform(t) {
    return t ? this._getAbsoluteTransform(t) : this._getCache(j, this._getAbsoluteTransform);
  }
  _getAbsoluteTransform(t) {
    var e;
    if (t)
      return (
        (e = new M.Transform()),
        this._eachAncestorReverse(function (t) {
          var n = t.transformsEnabled();
          "all" === n
            ? e.multiply(t.getTransform())
            : "position" === n && e.translate(t.x() - t.offsetX(), t.y() - t.offsetY());
        }, t),
        e
      );
    (e = this._cache.get(j) || new M.Transform()),
      this.parent ? this.parent.getAbsoluteTransform().copyInto(e) : e.reset();
    var n = this.transformsEnabled();
    if ("all" === n) e.multiply(this.getTransform());
    else if ("position" === n) {
      const t = this.attrs.x || 0,
        n = this.attrs.y || 0,
        r = this.attrs.offsetX || 0,
        i = this.attrs.offsetY || 0;
      e.translate(t - r, n - i);
    }
    return (e.dirty = !1), e;
  }
  getAbsoluteScale(t) {
    for (var e = this; e; ) e._isUnderCache && (t = e), (e = e.getParent());
    const n = this.getAbsoluteTransform(t).decompose();
    return { x: n.scaleX, y: n.scaleY };
  }
  getAbsoluteRotation() {
    return this.getAbsoluteTransform().decompose().rotation;
  }
  getTransform() {
    return this._getCache(J, this._getTransform);
  }
  _getTransform() {
    var t,
      e,
      n = this._cache.get(J) || new M.Transform();
    n.reset();
    var r = this.x(),
      i = this.y(),
      a = I.Konva.getAngle(this.rotation()),
      o = null !== (t = this.attrs.scaleX) && void 0 !== t ? t : 1,
      s = null !== (e = this.attrs.scaleY) && void 0 !== e ? e : 1,
      c = this.attrs.skewX || 0,
      l = this.attrs.skewY || 0,
      h = this.attrs.offsetX || 0,
      d = this.attrs.offsetY || 0;
    return (
      (0 === r && 0 === i) || n.translate(r, i),
      0 !== a && n.rotate(a),
      (0 === c && 0 === l) || n.skew(c, l),
      (1 === o && 1 === s) || n.scale(o, s),
      (0 === h && 0 === d) || n.translate(-1 * h, -1 * d),
      (n.dirty = !1),
      n
    );
  }
  clone(t) {
    var e,
      n,
      r,
      i,
      a,
      o = M.Util.cloneObject(this.attrs);
    for (e in t) o[e] = t[e];
    var s = new this.constructor(o);
    for (e in this.eventListeners)
      for (r = (n = this.eventListeners[e]).length, i = 0; i < r; i++)
        (a = n[i]).name.indexOf("konva") < 0 &&
          (s.eventListeners[e] || (s.eventListeners[e] = []), s.eventListeners[e].push(a));
    return s;
  }
  _toKonvaCanvas(t) {
    t = t || {};
    var e = this.getClientRect(),
      n = this.getStage(),
      r = void 0 !== t.x ? t.x : Math.floor(e.x),
      i = void 0 !== t.y ? t.y : Math.floor(e.y),
      a = t.pixelRatio || 1,
      o = new L.SceneCanvas({
        width: t.width || Math.ceil(e.width) || (n ? n.width() : 0),
        height: t.height || Math.ceil(e.height) || (n ? n.height() : 0),
        pixelRatio: a,
      }),
      s = o.getContext();
    return (
      !1 === t.imageSmoothingEnabled && (s._context.imageSmoothingEnabled = !1),
      s.save(),
      (r || i) && s.translate(-1 * r, -1 * i),
      this.drawScene(o),
      s.restore(),
      o
    );
  }
  toCanvas(t) {
    return this._toKonvaCanvas(t)._canvas;
  }
  toDataURL(t) {
    var e = (t = t || {}).mimeType || null,
      n = t.quality || null,
      r = this._toKonvaCanvas(t).toDataURL(e, n);
    return t.callback && t.callback(r), r;
  }
  toImage(t) {
    return new Promise((e, n) => {
      try {
        const n = null == t ? void 0 : t.callback;
        n && delete t.callback,
          M.Util._urlToImage(this.toDataURL(t), function (t) {
            e(t), null == n || n(t);
          });
      } catch (t) {
        n(t);
      }
    });
  }
  toBlob(t) {
    return new Promise((e, n) => {
      try {
        const n = null == t ? void 0 : t.callback;
        n && delete t.callback,
          this.toCanvas(t).toBlob((t) => {
            e(t), null == n || n(t);
          });
      } catch (t) {
        n(t);
      }
    });
  }
  setSize(t) {
    return this.width(t.width), this.height(t.height), this;
  }
  getSize() {
    return { width: this.width(), height: this.height() };
  }
  getClassName() {
    return this.className || this.nodeType;
  }
  getType() {
    return this.nodeType;
  }
  getDragDistance() {
    return void 0 !== this.attrs.dragDistance
      ? this.attrs.dragDistance
      : this.parent
      ? this.parent.getDragDistance()
      : I.Konva.dragDistance;
  }
  _off(t, e, n) {
    var r,
      i,
      a,
      o = this.eventListeners[t];
    for (r = 0; r < o.length; r++)
      if (
        ((i = o[r].name), (a = o[r].handler), !(("konva" === i && "konva" !== e) || (e && i !== e) || (n && n !== a)))
      ) {
        if ((o.splice(r, 1), 0 === o.length)) {
          delete this.eventListeners[t];
          break;
        }
        r--;
      }
  }
  _fireChangeEvent(t, e, n) {
    this._fire(t + "Change", { oldVal: e, newVal: n });
  }
  addName(t) {
    if (!this.hasName(t)) {
      var e = this.name(),
        n = e ? e + " " + t : t;
      this.name(n);
    }
    return this;
  }
  hasName(t) {
    if (!t) return !1;
    const e = this.name();
    return !!e && -1 !== (e || "").split(/\s/g).indexOf(t);
  }
  removeName(t) {
    var e = (this.name() || "").split(/\s/g),
      n = e.indexOf(t);
    return -1 !== n && (e.splice(n, 1), this.name(e.join(" "))), this;
  }
  setAttr(t, e) {
    var n = this["set" + M.Util._capitalize(t)];
    return M.Util._isFunction(n) ? n.call(this, e) : this._setAttr(t, e), this;
  }
  _requestDraw() {
    if (I.Konva.autoDrawEnabled) {
      const t = this.getLayer() || this.getStage();
      null == t || t.batchDraw();
    }
  }
  _setAttr(t, e) {
    var n = this.attrs[t];
    (n !== e || M.Util.isObject(e)) &&
      (null == e ? delete this.attrs[t] : (this.attrs[t] = e),
      this._shouldFireChangeEvents && this._fireChangeEvent(t, n, e),
      this._requestDraw());
  }
  _setComponentAttr(t, e, n) {
    var r;
    void 0 !== n &&
      ((r = this.attrs[t]) || (this.attrs[t] = this.getAttr(t)),
      (this.attrs[t][e] = n),
      this._fireChangeEvent(t, r, n));
  }
  _fireAndBubble(t, e, n) {
    if (
      (e && this.nodeType === Y && (e.target = this),
      !(
        (t === z || t === K) &&
        ((n && (this === n || (this.isAncestorOf && this.isAncestorOf(n)))) || ("Stage" === this.nodeType && !n))
      ))
    ) {
      this._fire(t, e);
      var r = (t === z || t === K) && n && n.isAncestorOf && n.isAncestorOf(this) && !n.isAncestorOf(this.parent);
      ((e && !e.cancelBubble) || !e) &&
        this.parent &&
        this.parent.isListening() &&
        !r &&
        (n && n.parent ? this._fireAndBubble.call(this.parent, t, e, n) : this._fireAndBubble.call(this.parent, t, e));
    }
  }
  _getProtoListeners(t) {
    var e, n, r;
    const i = null !== (e = this._cache.get(U)) && void 0 !== e ? e : {};
    let a = null == i ? void 0 : i[t];
    if (void 0 === a) {
      a = [];
      let e = Object.getPrototypeOf(this);
      for (; e; ) {
        const i =
          null !== (r = null === (n = e.eventListeners) || void 0 === n ? void 0 : n[t]) && void 0 !== r ? r : [];
        a.push(...i), (e = Object.getPrototypeOf(e));
      }
      (i[t] = a), this._cache.set(U, i);
    }
    return a;
  }
  _fire(t, e) {
    ((e = e || {}).currentTarget = this), (e.type = t);
    const n = this._getProtoListeners(t);
    if (n) for (var r = 0; r < n.length; r++) n[r].handler.call(this, e);
    const i = this.eventListeners[t];
    if (i) for (r = 0; r < i.length; r++) i[r].handler.call(this, e);
  }
  draw() {
    return this.drawScene(), this.drawHit(), this;
  }
  _createDragElement(t) {
    var e = t ? t.pointerId : void 0,
      n = this.getStage(),
      r = this.getAbsolutePosition();
    if (n) {
      var i = n._getPointerById(e) || n._changedPointerPositions[0] || r;
      G.DD._dragElements.set(this._id, {
        node: this,
        startPointerPos: i,
        offset: { x: i.x - r.x, y: i.y - r.y },
        dragStatus: "ready",
        pointerId: e,
      });
    }
  }
  startDrag(t, e = !0) {
    G.DD._dragElements.has(this._id) || this._createDragElement(t);
    (G.DD._dragElements.get(this._id).dragStatus = "dragging"),
      this.fire("dragstart", { type: "dragstart", target: this, evt: t && t.evt }, e);
  }
  _setDragPosition(t, e) {
    const n = this.getStage()._getPointerById(e.pointerId);
    if (n) {
      var r = { x: n.x - e.offset.x, y: n.y - e.offset.y },
        i = this.dragBoundFunc();
      if (void 0 !== i) {
        const e = i.call(this, r, t);
        e
          ? (r = e)
          : M.Util.warn(
              "dragBoundFunc did not return any value. That is unexpected behavior. You must return new absolute position from dragBoundFunc."
            );
      }
      (this._lastPos && this._lastPos.x === r.x && this._lastPos.y === r.y) ||
        (this.setAbsolutePosition(r), this._requestDraw()),
        (this._lastPos = r);
    }
  }
  stopDrag(t) {
    const e = G.DD._dragElements.get(this._id);
    e && (e.dragStatus = "stopped"), G.DD._endDragBefore(t), G.DD._endDragAfter(t);
  }
  setDraggable(t) {
    this._setAttr("draggable", t), this._dragChange();
  }
  isDragging() {
    const t = G.DD._dragElements.get(this._id);
    return !!t && "dragging" === t.dragStatus;
  }
  _listenDrag() {
    this._dragCleanup(),
      this.on("mousedown.konva touchstart.konva", function (t) {
        if ((!(void 0 !== t.evt.button) || I.Konva.dragButtons.indexOf(t.evt.button) >= 0) && !this.isDragging()) {
          var e = !1;
          G.DD._dragElements.forEach((t) => {
            this.isAncestorOf(t.node) && (e = !0);
          }),
            e || this._createDragElement(t);
        }
      });
  }
  _dragChange() {
    if (this.attrs.draggable) this._listenDrag();
    else {
      if ((this._dragCleanup(), !this.getStage())) return;
      const t = G.DD._dragElements.get(this._id),
        e = t && "dragging" === t.dragStatus,
        n = t && "ready" === t.dragStatus;
      e ? this.stopDrag() : n && G.DD._dragElements.delete(this._id);
    }
  }
  _dragCleanup() {
    this.off("mousedown.konva"), this.off("touchstart.konva");
  }
  isClientRectOnScreen(t = { x: 0, y: 0 }) {
    const e = this.getStage();
    if (!e) return !1;
    const n = { x: -t.x, y: -t.y, width: e.width() + 2 * t.x, height: e.height() + 2 * t.y };
    return M.Util.haveIntersection(n, this.getClientRect());
  }
  static create(t, e) {
    return M.Util._isString(t) && (t = JSON.parse(t)), this._createNode(t, e);
  }
  static _createNode(t, e) {
    var n,
      r,
      i,
      a = et.prototype.getClassName.call(t),
      o = t.children;
    e && (t.attrs.container = e),
      I.Konva[a] ||
        (M.Util.warn('Can not find a node with class name "' + a + '". Fallback to "Shape".'), (a = "Shape"));
    if (((n = new (0, I.Konva[a])(t.attrs)), o)) for (r = o.length, i = 0; i < r; i++) n.add(et._createNode(o[i]));
    return n;
  }
}
(p.Node = et),
  (et.prototype.nodeType = "Node"),
  (et.prototype._attrsAffectingSize = []),
  (et.prototype.eventListeners = {}),
  et.prototype.on.call(et.prototype, Z, function () {
    this._batchingTransformChange
      ? (this._needClearTransformCache = !0)
      : (this._clearCache(J), this._clearSelfAndDescendantCache(j));
  }),
  et.prototype.on.call(et.prototype, "visibleChange.konva", function () {
    this._clearSelfAndDescendantCache(Q);
  }),
  et.prototype.on.call(et.prototype, "listeningChange.konva", function () {
    this._clearSelfAndDescendantCache(W);
  }),
  et.prototype.on.call(et.prototype, "opacityChange.konva", function () {
    this._clearSelfAndDescendantCache(V);
  });
const nt = R.Factory.addGetterSetter;
nt(et, "zIndex"),
  nt(et, "absolutePosition"),
  nt(et, "position"),
  nt(et, "x", 0, (0, $.getNumberValidator)()),
  nt(et, "y", 0, (0, $.getNumberValidator)()),
  nt(et, "globalCompositeOperation", "source-over", (0, $.getStringValidator)()),
  nt(et, "opacity", 1, (0, $.getNumberValidator)()),
  nt(et, "name", "", (0, $.getStringValidator)()),
  nt(et, "id", "", (0, $.getStringValidator)()),
  nt(et, "rotation", 0, (0, $.getNumberValidator)()),
  R.Factory.addComponentsGetterSetter(et, "scale", ["x", "y"]),
  nt(et, "scaleX", 1, (0, $.getNumberValidator)()),
  nt(et, "scaleY", 1, (0, $.getNumberValidator)()),
  R.Factory.addComponentsGetterSetter(et, "skew", ["x", "y"]),
  nt(et, "skewX", 0, (0, $.getNumberValidator)()),
  nt(et, "skewY", 0, (0, $.getNumberValidator)()),
  R.Factory.addComponentsGetterSetter(et, "offset", ["x", "y"]),
  nt(et, "offsetX", 0, (0, $.getNumberValidator)()),
  nt(et, "offsetY", 0, (0, $.getNumberValidator)()),
  nt(et, "dragDistance", null, (0, $.getNumberValidator)()),
  nt(et, "width", 0, (0, $.getNumberValidator)()),
  nt(et, "height", 0, (0, $.getNumberValidator)()),
  nt(et, "listening", !0, (0, $.getBooleanValidator)()),
  nt(et, "preventDefault", !0, (0, $.getBooleanValidator)()),
  nt(et, "filters", null, function (t) {
    return (this._filterUpToDate = !1), t;
  }),
  nt(et, "visible", !0, (0, $.getBooleanValidator)()),
  nt(et, "transformsEnabled", "all", (0, $.getStringValidator)()),
  nt(et, "size"),
  nt(et, "dragBoundFunc"),
  nt(et, "draggable", !1, (0, $.getBooleanValidator)()),
  R.Factory.backCompat(et, { rotateDeg: "rotate", setRotationDeg: "setRotation", getRotationDeg: "getRotation" });
var rt = {};
Object.defineProperty(rt, "__esModule", { value: !0 }), (rt.Container = void 0);
const it = g,
  at = p,
  ot = v;
class st extends at.Node {
  constructor() {
    super(...arguments), (this.children = []);
  }
  getChildren(t) {
    if (!t) return this.children || [];
    const e = this.children || [];
    var n = [];
    return (
      e.forEach(function (e) {
        t(e) && n.push(e);
      }),
      n
    );
  }
  hasChildren() {
    return this.getChildren().length > 0;
  }
  removeChildren() {
    return (
      this.getChildren().forEach((t) => {
        (t.parent = null), (t.index = 0), t.remove();
      }),
      (this.children = []),
      this._requestDraw(),
      this
    );
  }
  destroyChildren() {
    return (
      this.getChildren().forEach((t) => {
        (t.parent = null), (t.index = 0), t.destroy();
      }),
      (this.children = []),
      this._requestDraw(),
      this
    );
  }
  add(...t) {
    if (0 === t.length) return this;
    if (t.length > 1) {
      for (var e = 0; e < t.length; e++) this.add(t[e]);
      return this;
    }
    const n = t[0];
    return n.getParent()
      ? (n.moveTo(this), this)
      : (this._validateAdd(n),
        (n.index = this.getChildren().length),
        (n.parent = this),
        n._clearCaches(),
        this.getChildren().push(n),
        this._fire("add", { child: n }),
        this._requestDraw(),
        this);
  }
  destroy() {
    return this.hasChildren() && this.destroyChildren(), super.destroy(), this;
  }
  find(t) {
    return this._generalFind(t, !1);
  }
  findOne(t) {
    var e = this._generalFind(t, !0);
    return e.length > 0 ? e[0] : void 0;
  }
  _generalFind(t, e) {
    var n = [];
    return (
      this._descendants((r) => {
        const i = r._isMatch(t);
        return i && n.push(r), !(!i || !e);
      }),
      n
    );
  }
  _descendants(t) {
    let e = !1;
    const n = this.getChildren();
    for (const r of n) {
      if (((e = t(r)), e)) return !0;
      if (r.hasChildren() && ((e = r._descendants(t)), e)) return !0;
    }
    return !1;
  }
  toObject() {
    var t = at.Node.prototype.toObject.call(this);
    return (
      (t.children = []),
      this.getChildren().forEach((e) => {
        t.children.push(e.toObject());
      }),
      t
    );
  }
  isAncestorOf(t) {
    for (var e = t.getParent(); e; ) {
      if (e._id === this._id) return !0;
      e = e.getParent();
    }
    return !1;
  }
  clone(t) {
    var e = at.Node.prototype.clone.call(this, t);
    return (
      this.getChildren().forEach(function (t) {
        e.add(t.clone());
      }),
      e
    );
  }
  getAllIntersections(t) {
    var e = [];
    return (
      this.find("Shape").forEach((n) => {
        n.isVisible() && n.intersects(t) && e.push(n);
      }),
      e
    );
  }
  _clearSelfAndDescendantCache(t) {
    var e;
    super._clearSelfAndDescendantCache(t),
      this.isCached() ||
        null === (e = this.children) ||
        void 0 === e ||
        e.forEach(function (e) {
          e._clearSelfAndDescendantCache(t);
        });
  }
  _setChildrenIndices() {
    var t;
    null === (t = this.children) ||
      void 0 === t ||
      t.forEach(function (t, e) {
        t.index = e;
      }),
      this._requestDraw();
  }
  drawScene(t, e) {
    var n = this.getLayer(),
      r = t || (n && n.getCanvas()),
      i = r && r.getContext(),
      a = this._getCanvasCache(),
      o = a && a.scene,
      s = r && r.isCache;
    if (!this.isVisible() && !s) return this;
    if (o) {
      i.save();
      var c = this.getAbsoluteTransform(e).getMatrix();
      i.transform(c[0], c[1], c[2], c[3], c[4], c[5]), this._drawCachedSceneCanvas(i), i.restore();
    } else this._drawChildren("drawScene", r, e);
    return this;
  }
  drawHit(t, e) {
    if (!this.shouldDrawHit(e)) return this;
    var n = this.getLayer(),
      r = t || (n && n.hitCanvas),
      i = r && r.getContext(),
      a = this._getCanvasCache();
    if (a && a.hit) {
      i.save();
      var o = this.getAbsoluteTransform(e).getMatrix();
      i.transform(o[0], o[1], o[2], o[3], o[4], o[5]), this._drawCachedHitCanvas(i), i.restore();
    } else this._drawChildren("drawHit", r, e);
    return this;
  }
  _drawChildren(t, e, n) {
    var r,
      i = e && e.getContext(),
      a = this.clipWidth(),
      o = this.clipHeight(),
      s = this.clipFunc(),
      c = (a && o) || s;
    const l = n === this;
    if (c) {
      i.save();
      var h = this.getAbsoluteTransform(n),
        d = h.getMatrix();
      let t;
      if ((i.transform(d[0], d[1], d[2], d[3], d[4], d[5]), i.beginPath(), s)) t = s.call(this, i, this);
      else {
        var u = this.clipX(),
          f = this.clipY();
        i.rect(u, f, a, o);
      }
      i.clip.apply(i, t), (d = h.copy().invert().getMatrix()), i.transform(d[0], d[1], d[2], d[3], d[4], d[5]);
    }
    var p = !l && "source-over" !== this.globalCompositeOperation() && "drawScene" === t;
    p && (i.save(), i._applyGlobalCompositeOperation(this)),
      null === (r = this.children) ||
        void 0 === r ||
        r.forEach(function (r) {
          r[t](e, n);
        }),
      p && i.restore(),
      c && i.restore();
  }
  getClientRect(t = {}) {
    var e,
      n,
      r,
      i,
      a,
      o = t.skipTransform,
      s = t.relativeTo,
      c = { x: 1 / 0, y: 1 / 0, width: 0, height: 0 },
      l = this;
    null === (e = this.children) ||
      void 0 === e ||
      e.forEach(function (e) {
        if (e.visible()) {
          var o = e.getClientRect({ relativeTo: l, skipShadow: t.skipShadow, skipStroke: t.skipStroke });
          (0 === o.width && 0 === o.height) ||
            (void 0 === n
              ? ((n = o.x), (r = o.y), (i = o.x + o.width), (a = o.y + o.height))
              : ((n = Math.min(n, o.x)),
                (r = Math.min(r, o.y)),
                (i = Math.max(i, o.x + o.width)),
                (a = Math.max(a, o.y + o.height))));
        }
      });
    for (var h = this.find("Shape"), d = !1, u = 0; u < h.length; u++) {
      if (h[u]._isVisible(this)) {
        d = !0;
        break;
      }
    }
    return (
      (c = d && void 0 !== n ? { x: n, y: r, width: i - n, height: a - r } : { x: 0, y: 0, width: 0, height: 0 }),
      o ? c : this._transformedRect(c, s)
    );
  }
}
(rt.Container = st),
  it.Factory.addComponentsGetterSetter(st, "clip", ["x", "y", "width", "height"]),
  it.Factory.addGetterSetter(st, "clipX", void 0, (0, ot.getNumberValidator)()),
  it.Factory.addGetterSetter(st, "clipY", void 0, (0, ot.getNumberValidator)()),
  it.Factory.addGetterSetter(st, "clipWidth", void 0, (0, ot.getNumberValidator)()),
  it.Factory.addGetterSetter(st, "clipHeight", void 0, (0, ot.getNumberValidator)()),
  it.Factory.addGetterSetter(st, "clipFunc");
var ct = {},
  lt = {};
Object.defineProperty(lt, "__esModule", { value: !0 }),
  (lt.releaseCapture = lt.setPointerCapture = lt.hasPointerCapture = lt.createEvent = lt.getCapturedShape = void 0);
const ht = u,
  dt = new Map(),
  ut = void 0 !== ht.Konva._global.PointerEvent;
function ft(t) {
  return { evt: t, pointerId: t.pointerId };
}
function pt(t, e) {
  const n = dt.get(t);
  if (!n) return;
  const r = n.getStage();
  r && r.content, dt.delete(t), ut && n._fire("lostpointercapture", ft(new PointerEvent("lostpointercapture")));
}
(lt.getCapturedShape = function (t) {
  return dt.get(t);
}),
  (lt.createEvent = ft),
  (lt.hasPointerCapture = function (t, e) {
    return dt.get(t) === e;
  }),
  (lt.setPointerCapture = function (t, e) {
    pt(t),
      e.getStage() && (dt.set(t, e), ut && e._fire("gotpointercapture", ft(new PointerEvent("gotpointercapture"))));
  }),
  (lt.releaseCapture = pt),
  (function (t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), (t.Stage = t.stages = void 0);
    const e = f,
      n = g,
      r = rt,
      i = u,
      a = b,
      o = F,
      s = u,
      c = lt;
    var l = "mouseleave",
      h = "mouseover",
      d = "mouseenter",
      p = "mousemove",
      v = "mousedown",
      m = "mouseup",
      y = "pointermove",
      _ = "pointerdown",
      S = "pointerup",
      w = "pointercancel",
      x = "pointerout",
      C = "pointerleave",
      k = "pointerover",
      E = "pointerenter",
      N = "contextmenu",
      O = "touchstart",
      A = "touchend",
      P = "touchmove",
      T = "touchcancel",
      D = "wheel",
      M = [
        [d, "_pointerenter"],
        [v, "_pointerdown"],
        [p, "_pointermove"],
        [m, "_pointerup"],
        [l, "_pointerleave"],
        [O, "_pointerdown"],
        [P, "_pointermove"],
        [A, "_pointerup"],
        [T, "_pointercancel"],
        [h, "_pointerover"],
        [D, "_wheel"],
        [N, "_contextmenu"],
        [_, "_pointerdown"],
        [y, "_pointermove"],
        [S, "_pointerup"],
        [w, "_pointercancel"],
        ["lostpointercapture", "_lostpointercapture"],
      ];
    const R = {
        mouse: {
          [x]: "mouseout",
          [C]: l,
          [k]: h,
          [E]: d,
          [y]: p,
          [_]: v,
          [S]: m,
          [w]: "mousecancel",
          pointerclick: "click",
          pointerdblclick: "dblclick",
        },
        touch: {
          [x]: "touchout",
          [C]: "touchleave",
          [k]: "touchover",
          [E]: "touchenter",
          [y]: P,
          [_]: O,
          [S]: A,
          [w]: T,
          pointerclick: "tap",
          pointerdblclick: "dbltap",
        },
        pointer: {
          [x]: x,
          [C]: C,
          [k]: k,
          [E]: E,
          [y]: y,
          [_]: _,
          [S]: S,
          [w]: w,
          pointerclick: "pointerclick",
          pointerdblclick: "pointerdblclick",
        },
      },
      L = (t) => (t.indexOf("pointer") >= 0 ? "pointer" : t.indexOf("touch") >= 0 ? "touch" : "mouse"),
      I = (t) => {
        const e = L(t);
        return "pointer" === e
          ? i.Konva.pointerEventsEnabled && R.pointer
          : "touch" === e
          ? R.touch
          : "mouse" === e
          ? R.mouse
          : void 0;
      };
    function G(t = {}) {
      return (
        (t.clipFunc || t.clipWidth || t.clipHeight) &&
          e.Util.warn("Stage does not support clipping. Please use clip for Layers or Groups."),
        t
      );
    }
    t.stages = [];
    class $ extends r.Container {
      constructor(e) {
        super(G(e)),
          (this._pointerPositions = []),
          (this._changedPointerPositions = []),
          this._buildDOM(),
          this._bindContentEvents(),
          t.stages.push(this),
          this.on("widthChange.konva heightChange.konva", this._resizeDOM),
          this.on("visibleChange.konva", this._checkVisibility),
          this.on("clipWidthChange.konva clipHeightChange.konva clipFuncChange.konva", () => {
            G(this.attrs);
          }),
          this._checkVisibility();
      }
      _validateAdd(t) {
        const n = "Layer" === t.getType(),
          r = "FastLayer" === t.getType();
        n || r || e.Util.throw("You may only add layers to the stage.");
      }
      _checkVisibility() {
        if (!this.content) return;
        const t = this.visible() ? "" : "none";
        this.content.style.display = t;
      }
      setContainer(t) {
        if ("string" == typeof t) {
          if ("." === t.charAt(0)) {
            var e = t.slice(1);
            t = document.getElementsByClassName(e)[0];
          } else {
            var n;
            (n = "#" !== t.charAt(0) ? t : t.slice(1)), (t = document.getElementById(n));
          }
          if (!t) throw "Can not find container in document with id " + n;
        }
        return (
          this._setAttr("container", t),
          this.content &&
            (this.content.parentElement && this.content.parentElement.removeChild(this.content),
            t.appendChild(this.content)),
          this
        );
      }
      shouldDrawHit() {
        return !0;
      }
      clear() {
        var t,
          e = this.children,
          n = e.length;
        for (t = 0; t < n; t++) e[t].clear();
        return this;
      }
      clone(t) {
        return (
          t || (t = {}),
          (t.container = "undefined" != typeof document && document.createElement("div")),
          r.Container.prototype.clone.call(this, t)
        );
      }
      destroy() {
        super.destroy();
        var n = this.content;
        n && e.Util._isInDocument(n) && this.container().removeChild(n);
        var r = t.stages.indexOf(this);
        return (
          r > -1 && t.stages.splice(r, 1),
          e.Util.releaseCanvas(this.bufferCanvas._canvas, this.bufferHitCanvas._canvas),
          this
        );
      }
      getPointerPosition() {
        const t = this._pointerPositions[0] || this._changedPointerPositions[0];
        return t
          ? { x: t.x, y: t.y }
          : (e.Util.warn(
              "Pointer position is missing and not registered by the stage. Looks like it is outside of the stage container. You can set it manually from event: stage.setPointersPositions(event);"
            ),
            null);
      }
      _getPointerById(t) {
        return this._pointerPositions.find((e) => e.id === t);
      }
      getPointersPositions() {
        return this._pointerPositions;
      }
      getStage() {
        return this;
      }
      getContent() {
        return this.content;
      }
      _toKonvaCanvas(t) {
        ((t = t || {}).x = t.x || 0),
          (t.y = t.y || 0),
          (t.width = t.width || this.width()),
          (t.height = t.height || this.height());
        var e = new a.SceneCanvas({ width: t.width, height: t.height, pixelRatio: t.pixelRatio || 1 }),
          n = e.getContext()._context,
          r = this.children;
        return (
          (t.x || t.y) && n.translate(-1 * t.x, -1 * t.y),
          r.forEach(function (e) {
            if (e.isVisible()) {
              var r = e._toKonvaCanvas(t);
              n.drawImage(r._canvas, t.x, t.y, r.getWidth() / r.getPixelRatio(), r.getHeight() / r.getPixelRatio());
            }
          }),
          e
        );
      }
      getIntersection(t) {
        if (!t) return null;
        var e,
          n = this.children;
        for (e = n.length - 1; e >= 0; e--) {
          const r = n[e].getIntersection(t);
          if (r) return r;
        }
        return null;
      }
      _resizeDOM() {
        var t = this.width(),
          e = this.height();
        this.content && ((this.content.style.width = t + "px"), (this.content.style.height = e + "px")),
          this.bufferCanvas.setSize(t, e),
          this.bufferHitCanvas.setSize(t, e),
          this.children.forEach((n) => {
            n.setSize({ width: t, height: e }), n.draw();
          });
      }
      add(t, ...n) {
        if (arguments.length > 1) {
          for (var r = 0; r < arguments.length; r++) this.add(arguments[r]);
          return this;
        }
        super.add(t);
        var a = this.children.length;
        return (
          a > 5 &&
            e.Util.warn(
              "The stage has " +
                a +
                " layers. Recommended maximum number of layers is 3-5. Adding more layers into the stage may drop the performance. Rethink your tree structure, you can use Konva.Group."
            ),
          t.setSize({ width: this.width(), height: this.height() }),
          t.draw(),
          i.Konva.isBrowser && this.content.appendChild(t.canvas._canvas),
          this
        );
      }
      getParent() {
        return null;
      }
      getLayer() {
        return null;
      }
      hasPointerCapture(t) {
        return c.hasPointerCapture(t, this);
      }
      setPointerCapture(t) {
        c.setPointerCapture(t, this);
      }
      releaseCapture(t) {
        c.releaseCapture(t, this);
      }
      getLayers() {
        return this.children;
      }
      _bindContentEvents() {
        i.Konva.isBrowser &&
          M.forEach(([t, e]) => {
            this.content.addEventListener(
              t,
              (t) => {
                this[e](t);
              },
              { passive: !1 }
            );
          });
      }
      _pointerenter(t) {
        this.setPointersPositions(t);
        const e = I(t.type);
        e && this._fire(e.pointerenter, { evt: t, target: this, currentTarget: this });
      }
      _pointerover(t) {
        this.setPointersPositions(t);
        const e = I(t.type);
        e && this._fire(e.pointerover, { evt: t, target: this, currentTarget: this });
      }
      _getTargetShape(t) {
        let e = this[t + "targetShape"];
        return e && !e.getStage() && (e = null), e;
      }
      _pointerleave(t) {
        const e = I(t.type),
          n = L(t.type);
        if (e) {
          this.setPointersPositions(t);
          var r = this._getTargetShape(n),
            a = !o.DD.isDragging || i.Konva.hitOnDragEnabled;
          r && a
            ? (r._fireAndBubble(e.pointerout, { evt: t }),
              r._fireAndBubble(e.pointerleave, { evt: t }),
              this._fire(e.pointerleave, { evt: t, target: this, currentTarget: this }),
              (this[n + "targetShape"] = null))
            : a &&
              (this._fire(e.pointerleave, { evt: t, target: this, currentTarget: this }),
              this._fire(e.pointerout, { evt: t, target: this, currentTarget: this })),
            (this.pointerPos = null),
            (this._pointerPositions = []);
        }
      }
      _pointerdown(t) {
        const e = I(t.type),
          n = L(t.type);
        if (e) {
          this.setPointersPositions(t);
          var r = !1;
          this._changedPointerPositions.forEach((a) => {
            var s = this.getIntersection(a);
            if (((o.DD.justDragged = !1), (i.Konva["_" + n + "ListenClick"] = !0), !s || !s.isListening())) return;
            i.Konva.capturePointerEventsEnabled && s.setPointerCapture(a.id),
              (this[n + "ClickStartShape"] = s),
              s._fireAndBubble(e.pointerdown, { evt: t, pointerId: a.id }),
              (r = !0);
            const c = t.type.indexOf("touch") >= 0;
            s.preventDefault() && t.cancelable && c && t.preventDefault();
          }),
            r ||
              this._fire(e.pointerdown, {
                evt: t,
                target: this,
                currentTarget: this,
                pointerId: this._pointerPositions[0].id,
              });
        }
      }
      _pointermove(t) {
        const e = I(t.type),
          n = L(t.type);
        if (!e) return;
        if (
          (o.DD.isDragging && o.DD.node.preventDefault() && t.cancelable && t.preventDefault(),
          this.setPointersPositions(t),
          !(!o.DD.isDragging || i.Konva.hitOnDragEnabled))
        )
          return;
        var r = {};
        let a = !1;
        var s = this._getTargetShape(n);
        this._changedPointerPositions.forEach((i) => {
          const o = c.getCapturedShape(i.id) || this.getIntersection(i),
            l = i.id,
            h = { evt: t, pointerId: l };
          var d = s !== o;
          if (
            (d && s && (s._fireAndBubble(e.pointerout, { ...h }, o), s._fireAndBubble(e.pointerleave, { ...h }, o)), o)
          ) {
            if (r[o._id]) return;
            r[o._id] = !0;
          }
          o && o.isListening()
            ? ((a = !0),
              d &&
                (o._fireAndBubble(e.pointerover, { ...h }, s),
                o._fireAndBubble(e.pointerenter, { ...h }, s),
                (this[n + "targetShape"] = o)),
              o._fireAndBubble(e.pointermove, { ...h }))
            : s &&
              (this._fire(e.pointerover, { evt: t, target: this, currentTarget: this, pointerId: l }),
              (this[n + "targetShape"] = null));
        }),
          a ||
            this._fire(e.pointermove, {
              evt: t,
              target: this,
              currentTarget: this,
              pointerId: this._changedPointerPositions[0].id,
            });
      }
      _pointerup(t) {
        const e = I(t.type),
          n = L(t.type);
        if (!e) return;
        this.setPointersPositions(t);
        const r = this[n + "ClickStartShape"],
          a = this[n + "ClickEndShape"];
        var s = {};
        let l = !1;
        this._changedPointerPositions.forEach((h) => {
          const d = c.getCapturedShape(h.id) || this.getIntersection(h);
          if (d) {
            if ((d.releaseCapture(h.id), s[d._id])) return;
            s[d._id] = !0;
          }
          const u = h.id,
            f = { evt: t, pointerId: u };
          let p = !1;
          i.Konva["_" + n + "InDblClickWindow"]
            ? ((p = !0), clearTimeout(this[n + "DblTimeout"]))
            : o.DD.justDragged || ((i.Konva["_" + n + "InDblClickWindow"] = !0), clearTimeout(this[n + "DblTimeout"])),
            (this[n + "DblTimeout"] = setTimeout(function () {
              i.Konva["_" + n + "InDblClickWindow"] = !1;
            }, i.Konva.dblClickWindow)),
            d && d.isListening()
              ? ((l = !0),
                (this[n + "ClickEndShape"] = d),
                d._fireAndBubble(e.pointerup, { ...f }),
                i.Konva["_" + n + "ListenClick"] &&
                  r &&
                  r === d &&
                  (d._fireAndBubble(e.pointerclick, { ...f }),
                  p && a && a === d && d._fireAndBubble(e.pointerdblclick, { ...f })))
              : ((this[n + "ClickEndShape"] = null),
                i.Konva["_" + n + "ListenClick"] &&
                  this._fire(e.pointerclick, { evt: t, target: this, currentTarget: this, pointerId: u }),
                p && this._fire(e.pointerdblclick, { evt: t, target: this, currentTarget: this, pointerId: u }));
        }),
          l ||
            this._fire(e.pointerup, {
              evt: t,
              target: this,
              currentTarget: this,
              pointerId: this._changedPointerPositions[0].id,
            }),
          (i.Konva["_" + n + "ListenClick"] = !1),
          t.cancelable && "touch" !== n && t.preventDefault();
      }
      _contextmenu(t) {
        this.setPointersPositions(t);
        var e = this.getIntersection(this.getPointerPosition());
        e && e.isListening()
          ? e._fireAndBubble(N, { evt: t })
          : this._fire(N, { evt: t, target: this, currentTarget: this });
      }
      _wheel(t) {
        this.setPointersPositions(t);
        var e = this.getIntersection(this.getPointerPosition());
        e && e.isListening()
          ? e._fireAndBubble(D, { evt: t })
          : this._fire(D, { evt: t, target: this, currentTarget: this });
      }
      _pointercancel(t) {
        this.setPointersPositions(t);
        const e = c.getCapturedShape(t.pointerId) || this.getIntersection(this.getPointerPosition());
        e && e._fireAndBubble(S, c.createEvent(t)), c.releaseCapture(t.pointerId);
      }
      _lostpointercapture(t) {
        c.releaseCapture(t.pointerId);
      }
      setPointersPositions(t) {
        var n = this._getContentPosition(),
          r = null,
          i = null;
        void 0 !== (t = t || window.event).touches
          ? ((this._pointerPositions = []),
            (this._changedPointerPositions = []),
            Array.prototype.forEach.call(t.touches, (t) => {
              this._pointerPositions.push({
                id: t.identifier,
                x: (t.clientX - n.left) / n.scaleX,
                y: (t.clientY - n.top) / n.scaleY,
              });
            }),
            Array.prototype.forEach.call(t.changedTouches || t.touches, (t) => {
              this._changedPointerPositions.push({
                id: t.identifier,
                x: (t.clientX - n.left) / n.scaleX,
                y: (t.clientY - n.top) / n.scaleY,
              });
            }))
          : ((r = (t.clientX - n.left) / n.scaleX),
            (i = (t.clientY - n.top) / n.scaleY),
            (this.pointerPos = { x: r, y: i }),
            (this._pointerPositions = [{ x: r, y: i, id: e.Util._getFirstPointerId(t) }]),
            (this._changedPointerPositions = [{ x: r, y: i, id: e.Util._getFirstPointerId(t) }]));
      }
      _setPointerPosition(t) {
        e.Util.warn('Method _setPointerPosition is deprecated. Use "stage.setPointersPositions(event)" instead.'),
          this.setPointersPositions(t);
      }
      _getContentPosition() {
        if (!this.content || !this.content.getBoundingClientRect) return { top: 0, left: 0, scaleX: 1, scaleY: 1 };
        var t = this.content.getBoundingClientRect();
        return {
          top: t.top,
          left: t.left,
          scaleX: t.width / this.content.clientWidth || 1,
          scaleY: t.height / this.content.clientHeight || 1,
        };
      }
      _buildDOM() {
        if (
          ((this.bufferCanvas = new a.SceneCanvas({ width: this.width(), height: this.height() })),
          (this.bufferHitCanvas = new a.HitCanvas({ pixelRatio: 1, width: this.width(), height: this.height() })),
          i.Konva.isBrowser)
        ) {
          var t = this.container();
          if (!t) throw "Stage has no container. A container is required.";
          (t.innerHTML = ""),
            (this.content = document.createElement("div")),
            (this.content.style.position = "relative"),
            (this.content.style.userSelect = "none"),
            (this.content.className = "konvajs-content"),
            this.content.setAttribute("role", "presentation"),
            t.appendChild(this.content),
            this._resizeDOM();
        }
      }
      cache() {
        return (
          e.Util.warn("Cache function is not allowed for stage. You may use cache only for layers, groups and shapes."),
          this
        );
      }
      clearCache() {
        return this;
      }
      batchDraw() {
        return (
          this.getChildren().forEach(function (t) {
            t.batchDraw();
          }),
          this
        );
      }
    }
    (t.Stage = $), ($.prototype.nodeType = "Stage"), (0, s._registerNode)($), n.Factory.addGetterSetter($, "container");
  })(ct);
var gt = {},
  vt = {};
!(function (t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), (t.Shape = t.shapes = void 0);
  const e = u,
    n = f,
    r = g,
    i = p,
    a = v,
    o = u,
    s = lt;
  var c = "hasShadow",
    l = "shadowRGBA",
    h = "patternImage",
    d = "linearGradient",
    m = "radialGradient";
  let y;
  function _() {
    return y || ((y = n.Util.createCanvasElement().getContext("2d")), y);
  }
  t.shapes = {};
  class b extends i.Node {
    constructor(e) {
      let r;
      for (super(e); (r = n.Util.getRandomColor()), !r || r in t.shapes; );
      (this.colorKey = r), (t.shapes[r] = this);
    }
    getContext() {
      return (
        n.Util.warn("shape.getContext() method is deprecated. Please do not use it."), this.getLayer().getContext()
      );
    }
    getCanvas() {
      return n.Util.warn("shape.getCanvas() method is deprecated. Please do not use it."), this.getLayer().getCanvas();
    }
    getSceneFunc() {
      return this.attrs.sceneFunc || this._sceneFunc;
    }
    getHitFunc() {
      return this.attrs.hitFunc || this._hitFunc;
    }
    hasShadow() {
      return this._getCache(c, this._hasShadow);
    }
    _hasShadow() {
      return (
        this.shadowEnabled() &&
        0 !== this.shadowOpacity() &&
        !!(this.shadowColor() || this.shadowBlur() || this.shadowOffsetX() || this.shadowOffsetY())
      );
    }
    _getFillPattern() {
      return this._getCache(h, this.__getFillPattern);
    }
    __getFillPattern() {
      if (this.fillPatternImage()) {
        const t = _().createPattern(this.fillPatternImage(), this.fillPatternRepeat() || "repeat");
        if (t && t.setTransform) {
          const r = new n.Transform();
          r.translate(this.fillPatternX(), this.fillPatternY()),
            r.rotate(e.Konva.getAngle(this.fillPatternRotation())),
            r.scale(this.fillPatternScaleX(), this.fillPatternScaleY()),
            r.translate(-1 * this.fillPatternOffsetX(), -1 * this.fillPatternOffsetY());
          const i = r.getMatrix(),
            a =
              "undefined" == typeof DOMMatrix
                ? { a: i[0], b: i[1], c: i[2], d: i[3], e: i[4], f: i[5] }
                : new DOMMatrix(i);
          t.setTransform(a);
        }
        return t;
      }
    }
    _getLinearGradient() {
      return this._getCache(d, this.__getLinearGradient);
    }
    __getLinearGradient() {
      var t = this.fillLinearGradientColorStops();
      if (t) {
        for (
          var e = _(),
            n = this.fillLinearGradientStartPoint(),
            r = this.fillLinearGradientEndPoint(),
            i = e.createLinearGradient(n.x, n.y, r.x, r.y),
            a = 0;
          a < t.length;
          a += 2
        )
          i.addColorStop(t[a], t[a + 1]);
        return i;
      }
    }
    _getRadialGradient() {
      return this._getCache(m, this.__getRadialGradient);
    }
    __getRadialGradient() {
      var t = this.fillRadialGradientColorStops();
      if (t) {
        for (
          var e = _(),
            n = this.fillRadialGradientStartPoint(),
            r = this.fillRadialGradientEndPoint(),
            i = e.createRadialGradient(
              n.x,
              n.y,
              this.fillRadialGradientStartRadius(),
              r.x,
              r.y,
              this.fillRadialGradientEndRadius()
            ),
            a = 0;
          a < t.length;
          a += 2
        )
          i.addColorStop(t[a], t[a + 1]);
        return i;
      }
    }
    getShadowRGBA() {
      return this._getCache(l, this._getShadowRGBA);
    }
    _getShadowRGBA() {
      if (this.hasShadow()) {
        var t = n.Util.colorToRGBA(this.shadowColor());
        return t ? "rgba(" + t.r + "," + t.g + "," + t.b + "," + t.a * (this.shadowOpacity() || 1) + ")" : void 0;
      }
    }
    hasFill() {
      return this._calculate(
        "hasFill",
        ["fillEnabled", "fill", "fillPatternImage", "fillLinearGradientColorStops", "fillRadialGradientColorStops"],
        () =>
          this.fillEnabled() &&
          !!(
            this.fill() ||
            this.fillPatternImage() ||
            this.fillLinearGradientColorStops() ||
            this.fillRadialGradientColorStops()
          )
      );
    }
    hasStroke() {
      return this._calculate(
        "hasStroke",
        ["strokeEnabled", "strokeWidth", "stroke", "strokeLinearGradientColorStops"],
        () => this.strokeEnabled() && this.strokeWidth() && !(!this.stroke() && !this.strokeLinearGradientColorStops())
      );
    }
    hasHitStroke() {
      const t = this.hitStrokeWidth();
      return "auto" === t ? this.hasStroke() : this.strokeEnabled() && !!t;
    }
    intersects(t) {
      var e = this.getStage();
      if (!e) return !1;
      const n = e.bufferHitCanvas;
      n.getContext().clear(), this.drawHit(n, void 0, !0);
      return n.context.getImageData(Math.round(t.x), Math.round(t.y), 1, 1).data[3] > 0;
    }
    destroy() {
      return i.Node.prototype.destroy.call(this), delete t.shapes[this.colorKey], delete this.colorKey, this;
    }
    _useBufferCanvas(t) {
      var e;
      if (!this.getStage()) return !1;
      if (!(null === (e = this.attrs.perfectDrawEnabled) || void 0 === e || e)) return !1;
      const n = t || this.hasFill(),
        r = this.hasStroke(),
        i = 1 !== this.getAbsoluteOpacity();
      if (n && r && i) return !0;
      const a = this.hasShadow(),
        o = this.shadowForStrokeEnabled();
      return !!(n && r && a && o);
    }
    setStrokeHitEnabled(t) {
      n.Util.warn("strokeHitEnabled property is deprecated. Please use hitStrokeWidth instead."),
        t ? this.hitStrokeWidth("auto") : this.hitStrokeWidth(0);
    }
    getStrokeHitEnabled() {
      return 0 !== this.hitStrokeWidth();
    }
    getSelfRect() {
      var t = this.size();
      return {
        x: this._centroid ? -t.width / 2 : 0,
        y: this._centroid ? -t.height / 2 : 0,
        width: t.width,
        height: t.height,
      };
    }
    getClientRect(t = {}) {
      const e = t.skipTransform,
        n = t.relativeTo,
        r = this.getSelfRect(),
        i = (!t.skipStroke && this.hasStroke() && this.strokeWidth()) || 0,
        a = r.width + i,
        o = r.height + i,
        s = !t.skipShadow && this.hasShadow(),
        c = s ? this.shadowOffsetX() : 0,
        l = s ? this.shadowOffsetY() : 0,
        h = a + Math.abs(c),
        d = o + Math.abs(l),
        u = (s && this.shadowBlur()) || 0,
        f = {
          width: h + 2 * u,
          height: d + 2 * u,
          x: -(i / 2 + u) + Math.min(c, 0) + r.x,
          y: -(i / 2 + u) + Math.min(l, 0) + r.y,
        };
      return e ? f : this._transformedRect(f, n);
    }
    drawScene(t, e) {
      var n,
        r,
        i = this.getLayer(),
        a = t || i.getCanvas(),
        o = a.getContext(),
        s = this._getCanvasCache(),
        c = this.getSceneFunc(),
        l = this.hasShadow(),
        h = a.isCache,
        d = e === this;
      if (!this.isVisible() && !d) return this;
      if (s) {
        o.save();
        var u = this.getAbsoluteTransform(e).getMatrix();
        return o.transform(u[0], u[1], u[2], u[3], u[4], u[5]), this._drawCachedSceneCanvas(o), o.restore(), this;
      }
      if (!c) return this;
      if ((o.save(), this._useBufferCanvas() && !h)) {
        (r = (n = this.getStage().bufferCanvas).getContext()).clear(), r.save(), r._applyLineJoin(this);
        var f = this.getAbsoluteTransform(e).getMatrix();
        r.transform(f[0], f[1], f[2], f[3], f[4], f[5]), c.call(this, r, this), r.restore();
        var p = n.pixelRatio;
        l && o._applyShadow(this),
          o._applyOpacity(this),
          o._applyGlobalCompositeOperation(this),
          o.drawImage(n._canvas, 0, 0, n.width / p, n.height / p);
      } else {
        if ((o._applyLineJoin(this), !d)) {
          f = this.getAbsoluteTransform(e).getMatrix();
          o.transform(f[0], f[1], f[2], f[3], f[4], f[5]),
            o._applyOpacity(this),
            o._applyGlobalCompositeOperation(this);
        }
        l && o._applyShadow(this), c.call(this, o, this);
      }
      return o.restore(), this;
    }
    drawHit(t, e, r = !1) {
      if (!this.shouldDrawHit(e, r)) return this;
      var i = this.getLayer(),
        a = t || i.hitCanvas,
        o = a && a.getContext(),
        s = this.hitFunc() || this.sceneFunc(),
        c = this._getCanvasCache(),
        l = c && c.hit;
      if (
        (this.colorKey ||
          n.Util.warn(
            "Looks like your canvas has a destroyed shape in it. Do not reuse shape after you destroyed it. If you want to reuse shape you should call remove() instead of destroy()"
          ),
        l)
      ) {
        o.save();
        var h = this.getAbsoluteTransform(e).getMatrix();
        return o.transform(h[0], h[1], h[2], h[3], h[4], h[5]), this._drawCachedHitCanvas(o), o.restore(), this;
      }
      if (!s) return this;
      o.save(), o._applyLineJoin(this);
      if (!(this === e)) {
        var d = this.getAbsoluteTransform(e).getMatrix();
        o.transform(d[0], d[1], d[2], d[3], d[4], d[5]);
      }
      return s.call(this, o, this), o.restore(), this;
    }
    drawHitFromCache(t = 0) {
      var e,
        r,
        i,
        a,
        o,
        s = this._getCanvasCache(),
        c = this._getCachedSceneCanvas(),
        l = s.hit,
        h = l.getContext(),
        d = l.getWidth(),
        u = l.getHeight();
      h.clear(), h.drawImage(c._canvas, 0, 0, d, u);
      try {
        for (
          i = (r = (e = h.getImageData(0, 0, d, u)).data).length, a = n.Util._hexToRgb(this.colorKey), o = 0;
          o < i;
          o += 4
        )
          r[o + 3] > t ? ((r[o] = a.r), (r[o + 1] = a.g), (r[o + 2] = a.b), (r[o + 3] = 255)) : (r[o + 3] = 0);
        h.putImageData(e, 0, 0);
      } catch (t) {
        n.Util.error("Unable to draw hit graph from cached scene canvas. " + t.message);
      }
      return this;
    }
    hasPointerCapture(t) {
      return s.hasPointerCapture(t, this);
    }
    setPointerCapture(t) {
      s.setPointerCapture(t, this);
    }
    releaseCapture(t) {
      s.releaseCapture(t, this);
    }
  }
  (t.Shape = b),
    (b.prototype._fillFunc = function (t) {
      const e = this.attrs.fillRule;
      e ? t.fill(e) : t.fill();
    }),
    (b.prototype._strokeFunc = function (t) {
      t.stroke();
    }),
    (b.prototype._fillFuncHit = function (t) {
      t.fill();
    }),
    (b.prototype._strokeFuncHit = function (t) {
      t.stroke();
    }),
    (b.prototype._centroid = !1),
    (b.prototype.nodeType = "Shape"),
    (0, o._registerNode)(b),
    (b.prototype.eventListeners = {}),
    b.prototype.on.call(
      b.prototype,
      "shadowColorChange.konva shadowBlurChange.konva shadowOffsetChange.konva shadowOpacityChange.konva shadowEnabledChange.konva",
      function () {
        this._clearCache(c);
      }
    ),
    b.prototype.on.call(
      b.prototype,
      "shadowColorChange.konva shadowOpacityChange.konva shadowEnabledChange.konva",
      function () {
        this._clearCache(l);
      }
    ),
    b.prototype.on.call(
      b.prototype,
      "fillPriorityChange.konva fillPatternImageChange.konva fillPatternRepeatChange.konva fillPatternScaleXChange.konva fillPatternScaleYChange.konva fillPatternOffsetXChange.konva fillPatternOffsetYChange.konva fillPatternXChange.konva fillPatternYChange.konva fillPatternRotationChange.konva",
      function () {
        this._clearCache(h);
      }
    ),
    b.prototype.on.call(
      b.prototype,
      "fillPriorityChange.konva fillLinearGradientColorStopsChange.konva fillLinearGradientStartPointXChange.konva fillLinearGradientStartPointYChange.konva fillLinearGradientEndPointXChange.konva fillLinearGradientEndPointYChange.konva",
      function () {
        this._clearCache(d);
      }
    ),
    b.prototype.on.call(
      b.prototype,
      "fillPriorityChange.konva fillRadialGradientColorStopsChange.konva fillRadialGradientStartPointXChange.konva fillRadialGradientStartPointYChange.konva fillRadialGradientEndPointXChange.konva fillRadialGradientEndPointYChange.konva fillRadialGradientStartRadiusChange.konva fillRadialGradientEndRadiusChange.konva",
      function () {
        this._clearCache(m);
      }
    ),
    r.Factory.addGetterSetter(b, "stroke", void 0, (0, a.getStringOrGradientValidator)()),
    r.Factory.addGetterSetter(b, "strokeWidth", 2, (0, a.getNumberValidator)()),
    r.Factory.addGetterSetter(b, "fillAfterStrokeEnabled", !1),
    r.Factory.addGetterSetter(b, "hitStrokeWidth", "auto", (0, a.getNumberOrAutoValidator)()),
    r.Factory.addGetterSetter(b, "strokeHitEnabled", !0, (0, a.getBooleanValidator)()),
    r.Factory.addGetterSetter(b, "perfectDrawEnabled", !0, (0, a.getBooleanValidator)()),
    r.Factory.addGetterSetter(b, "shadowForStrokeEnabled", !0, (0, a.getBooleanValidator)()),
    r.Factory.addGetterSetter(b, "lineJoin"),
    r.Factory.addGetterSetter(b, "lineCap"),
    r.Factory.addGetterSetter(b, "sceneFunc"),
    r.Factory.addGetterSetter(b, "hitFunc"),
    r.Factory.addGetterSetter(b, "dash"),
    r.Factory.addGetterSetter(b, "dashOffset", 0, (0, a.getNumberValidator)()),
    r.Factory.addGetterSetter(b, "shadowColor", void 0, (0, a.getStringValidator)()),
    r.Factory.addGetterSetter(b, "shadowBlur", 0, (0, a.getNumberValidator)()),
    r.Factory.addGetterSetter(b, "shadowOpacity", 1, (0, a.getNumberValidator)()),
    r.Factory.addComponentsGetterSetter(b, "shadowOffset", ["x", "y"]),
    r.Factory.addGetterSetter(b, "shadowOffsetX", 0, (0, a.getNumberValidator)()),
    r.Factory.addGetterSetter(b, "shadowOffsetY", 0, (0, a.getNumberValidator)()),
    r.Factory.addGetterSetter(b, "fillPatternImage"),
    r.Factory.addGetterSetter(b, "fill", void 0, (0, a.getStringOrGradientValidator)()),
    r.Factory.addGetterSetter(b, "fillPatternX", 0, (0, a.getNumberValidator)()),
    r.Factory.addGetterSetter(b, "fillPatternY", 0, (0, a.getNumberValidator)()),
    r.Factory.addGetterSetter(b, "fillLinearGradientColorStops"),
    r.Factory.addGetterSetter(b, "strokeLinearGradientColorStops"),
    r.Factory.addGetterSetter(b, "fillRadialGradientStartRadius", 0),
    r.Factory.addGetterSetter(b, "fillRadialGradientEndRadius", 0),
    r.Factory.addGetterSetter(b, "fillRadialGradientColorStops"),
    r.Factory.addGetterSetter(b, "fillPatternRepeat", "repeat"),
    r.Factory.addGetterSetter(b, "fillEnabled", !0),
    r.Factory.addGetterSetter(b, "strokeEnabled", !0),
    r.Factory.addGetterSetter(b, "shadowEnabled", !0),
    r.Factory.addGetterSetter(b, "dashEnabled", !0),
    r.Factory.addGetterSetter(b, "strokeScaleEnabled", !0),
    r.Factory.addGetterSetter(b, "fillPriority", "color"),
    r.Factory.addComponentsGetterSetter(b, "fillPatternOffset", ["x", "y"]),
    r.Factory.addGetterSetter(b, "fillPatternOffsetX", 0, (0, a.getNumberValidator)()),
    r.Factory.addGetterSetter(b, "fillPatternOffsetY", 0, (0, a.getNumberValidator)()),
    r.Factory.addComponentsGetterSetter(b, "fillPatternScale", ["x", "y"]),
    r.Factory.addGetterSetter(b, "fillPatternScaleX", 1, (0, a.getNumberValidator)()),
    r.Factory.addGetterSetter(b, "fillPatternScaleY", 1, (0, a.getNumberValidator)()),
    r.Factory.addComponentsGetterSetter(b, "fillLinearGradientStartPoint", ["x", "y"]),
    r.Factory.addComponentsGetterSetter(b, "strokeLinearGradientStartPoint", ["x", "y"]),
    r.Factory.addGetterSetter(b, "fillLinearGradientStartPointX", 0),
    r.Factory.addGetterSetter(b, "strokeLinearGradientStartPointX", 0),
    r.Factory.addGetterSetter(b, "fillLinearGradientStartPointY", 0),
    r.Factory.addGetterSetter(b, "strokeLinearGradientStartPointY", 0),
    r.Factory.addComponentsGetterSetter(b, "fillLinearGradientEndPoint", ["x", "y"]),
    r.Factory.addComponentsGetterSetter(b, "strokeLinearGradientEndPoint", ["x", "y"]),
    r.Factory.addGetterSetter(b, "fillLinearGradientEndPointX", 0),
    r.Factory.addGetterSetter(b, "strokeLinearGradientEndPointX", 0),
    r.Factory.addGetterSetter(b, "fillLinearGradientEndPointY", 0),
    r.Factory.addGetterSetter(b, "strokeLinearGradientEndPointY", 0),
    r.Factory.addComponentsGetterSetter(b, "fillRadialGradientStartPoint", ["x", "y"]),
    r.Factory.addGetterSetter(b, "fillRadialGradientStartPointX", 0),
    r.Factory.addGetterSetter(b, "fillRadialGradientStartPointY", 0),
    r.Factory.addComponentsGetterSetter(b, "fillRadialGradientEndPoint", ["x", "y"]),
    r.Factory.addGetterSetter(b, "fillRadialGradientEndPointX", 0),
    r.Factory.addGetterSetter(b, "fillRadialGradientEndPointY", 0),
    r.Factory.addGetterSetter(b, "fillPatternRotation", 0),
    r.Factory.addGetterSetter(b, "fillRule", void 0, (0, a.getStringValidator)()),
    r.Factory.backCompat(b, {
      dashArray: "dash",
      getDashArray: "getDash",
      setDashArray: "getDash",
      drawFunc: "sceneFunc",
      getDrawFunc: "getSceneFunc",
      setDrawFunc: "setSceneFunc",
      drawHitFunc: "hitFunc",
      getDrawHitFunc: "getHitFunc",
      setDrawHitFunc: "setHitFunc",
    });
})(vt),
  Object.defineProperty(gt, "__esModule", { value: !0 }),
  (gt.Layer = void 0);
const mt = f,
  yt = rt,
  _t = p,
  bt = g,
  St = b,
  wt = v,
  xt = vt,
  Ct = u;
var kt = [
    { x: 0, y: 0 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
  ],
  Et = kt.length;
class Nt extends yt.Container {
  constructor(t) {
    super(t),
      (this.canvas = new St.SceneCanvas()),
      (this.hitCanvas = new St.HitCanvas({ pixelRatio: 1 })),
      (this._waitingForDraw = !1),
      this.on("visibleChange.konva", this._checkVisibility),
      this._checkVisibility(),
      this.on("imageSmoothingEnabledChange.konva", this._setSmoothEnabled),
      this._setSmoothEnabled();
  }
  createPNGStream() {
    return this.canvas._canvas.createPNGStream();
  }
  getCanvas() {
    return this.canvas;
  }
  getNativeCanvasElement() {
    return this.canvas._canvas;
  }
  getHitCanvas() {
    return this.hitCanvas;
  }
  getContext() {
    return this.getCanvas().getContext();
  }
  clear(t) {
    return this.getContext().clear(t), this.getHitCanvas().getContext().clear(t), this;
  }
  setZIndex(t) {
    super.setZIndex(t);
    var e = this.getStage();
    return (
      e &&
        e.content &&
        (e.content.removeChild(this.getNativeCanvasElement()),
        t < e.children.length - 1
          ? e.content.insertBefore(this.getNativeCanvasElement(), e.children[t + 1].getCanvas()._canvas)
          : e.content.appendChild(this.getNativeCanvasElement())),
      this
    );
  }
  moveToTop() {
    _t.Node.prototype.moveToTop.call(this);
    var t = this.getStage();
    return (
      t &&
        t.content &&
        (t.content.removeChild(this.getNativeCanvasElement()), t.content.appendChild(this.getNativeCanvasElement())),
      !0
    );
  }
  moveUp() {
    if (!_t.Node.prototype.moveUp.call(this)) return !1;
    var t = this.getStage();
    return (
      !(!t || !t.content) &&
      (t.content.removeChild(this.getNativeCanvasElement()),
      this.index < t.children.length - 1
        ? t.content.insertBefore(this.getNativeCanvasElement(), t.children[this.index + 1].getCanvas()._canvas)
        : t.content.appendChild(this.getNativeCanvasElement()),
      !0)
    );
  }
  moveDown() {
    if (_t.Node.prototype.moveDown.call(this)) {
      var t = this.getStage();
      if (t) {
        var e = t.children;
        t.content &&
          (t.content.removeChild(this.getNativeCanvasElement()),
          t.content.insertBefore(this.getNativeCanvasElement(), e[this.index + 1].getCanvas()._canvas));
      }
      return !0;
    }
    return !1;
  }
  moveToBottom() {
    if (_t.Node.prototype.moveToBottom.call(this)) {
      var t = this.getStage();
      if (t) {
        var e = t.children;
        t.content &&
          (t.content.removeChild(this.getNativeCanvasElement()),
          t.content.insertBefore(this.getNativeCanvasElement(), e[1].getCanvas()._canvas));
      }
      return !0;
    }
    return !1;
  }
  getLayer() {
    return this;
  }
  remove() {
    var t = this.getNativeCanvasElement();
    return (
      _t.Node.prototype.remove.call(this),
      t && t.parentNode && mt.Util._isInDocument(t) && t.parentNode.removeChild(t),
      this
    );
  }
  getStage() {
    return this.parent;
  }
  setSize({ width: t, height: e }) {
    return this.canvas.setSize(t, e), this.hitCanvas.setSize(t, e), this._setSmoothEnabled(), this;
  }
  _validateAdd(t) {
    var e = t.getType();
    "Group" !== e && "Shape" !== e && mt.Util.throw("You may only add groups and shapes to a layer.");
  }
  _toKonvaCanvas(t) {
    return (
      ((t = t || {}).width = t.width || this.getWidth()),
      (t.height = t.height || this.getHeight()),
      (t.x = void 0 !== t.x ? t.x : this.x()),
      (t.y = void 0 !== t.y ? t.y : this.y()),
      _t.Node.prototype._toKonvaCanvas.call(this, t)
    );
  }
  _checkVisibility() {
    const t = this.visible();
    this.canvas._canvas.style.display = t ? "block" : "none";
  }
  _setSmoothEnabled() {
    this.getContext()._context.imageSmoothingEnabled = this.imageSmoothingEnabled();
  }
  getWidth() {
    if (this.parent) return this.parent.width();
  }
  setWidth() {
    mt.Util.warn('Can not change width of layer. Use "stage.width(value)" function instead.');
  }
  getHeight() {
    if (this.parent) return this.parent.height();
  }
  setHeight() {
    mt.Util.warn('Can not change height of layer. Use "stage.height(value)" function instead.');
  }
  batchDraw() {
    return (
      this._waitingForDraw ||
        ((this._waitingForDraw = !0),
        mt.Util.requestAnimFrame(() => {
          this.draw(), (this._waitingForDraw = !1);
        })),
      this
    );
  }
  getIntersection(t) {
    if (!this.isListening() || !this.isVisible()) return null;
    for (var e = 1, n = !1; ; ) {
      for (let r = 0; r < Et; r++) {
        const i = kt[r],
          a = this._getIntersection({ x: t.x + i.x * e, y: t.y + i.y * e }),
          o = a.shape;
        if (o) return o;
        if (((n = !!a.antialiased), !a.antialiased)) break;
      }
      if (!n) return null;
      e += 1;
    }
  }
  _getIntersection(t) {
    const e = this.hitCanvas.pixelRatio,
      n = this.hitCanvas.context.getImageData(Math.round(t.x * e), Math.round(t.y * e), 1, 1).data,
      r = n[3];
    if (255 === r) {
      const t = mt.Util._rgbToHex(n[0], n[1], n[2]),
        e = xt.shapes["#" + t];
      return e ? { shape: e } : { antialiased: !0 };
    }
    return r > 0 ? { antialiased: !0 } : {};
  }
  drawScene(t, e) {
    var n = this.getLayer(),
      r = t || (n && n.getCanvas());
    return (
      this._fire("beforeDraw", { node: this }),
      this.clearBeforeDraw() && r.getContext().clear(),
      yt.Container.prototype.drawScene.call(this, r, e),
      this._fire("draw", { node: this }),
      this
    );
  }
  drawHit(t, e) {
    var n = this.getLayer(),
      r = t || (n && n.hitCanvas);
    return (
      n && n.clearBeforeDraw() && n.getHitCanvas().getContext().clear(),
      yt.Container.prototype.drawHit.call(this, r, e),
      this
    );
  }
  enableHitGraph() {
    return this.hitGraphEnabled(!0), this;
  }
  disableHitGraph() {
    return this.hitGraphEnabled(!1), this;
  }
  setHitGraphEnabled(t) {
    mt.Util.warn("hitGraphEnabled method is deprecated. Please use layer.listening() instead."), this.listening(t);
  }
  getHitGraphEnabled(t) {
    return (
      mt.Util.warn("hitGraphEnabled method is deprecated. Please use layer.listening() instead."), this.listening()
    );
  }
  toggleHitCanvas() {
    if (this.parent && this.parent.content) {
      var t = this.parent;
      !!this.hitCanvas._canvas.parentNode
        ? t.content.removeChild(this.hitCanvas._canvas)
        : t.content.appendChild(this.hitCanvas._canvas);
    }
  }
  destroy() {
    return mt.Util.releaseCanvas(this.getNativeCanvasElement(), this.getHitCanvas()._canvas), super.destroy();
  }
}
(gt.Layer = Nt),
  (Nt.prototype.nodeType = "Layer"),
  (0, Ct._registerNode)(Nt),
  bt.Factory.addGetterSetter(Nt, "imageSmoothingEnabled", !0),
  bt.Factory.addGetterSetter(Nt, "clearBeforeDraw", !0),
  bt.Factory.addGetterSetter(Nt, "hitGraphEnabled", !0, (0, wt.getBooleanValidator)());
var Ot = {};
Object.defineProperty(Ot, "__esModule", { value: !0 }), (Ot.FastLayer = void 0);
const At = f,
  Pt = gt,
  Tt = u;
class Dt extends Pt.Layer {
  constructor(t) {
    super(t),
      this.listening(!1),
      At.Util.warn('Konva.Fast layer is deprecated. Please use "new Konva.Layer({ listening: false })" instead.');
  }
}
(Ot.FastLayer = Dt), (Dt.prototype.nodeType = "FastLayer"), (0, Tt._registerNode)(Dt);
var Ft = {};
Object.defineProperty(Ft, "__esModule", { value: !0 }), (Ft.Group = void 0);
const Mt = f,
  Rt = rt,
  Lt = u;
class It extends Rt.Container {
  _validateAdd(t) {
    var e = t.getType();
    "Group" !== e && "Shape" !== e && Mt.Util.throw("You may only add groups and shapes to groups.");
  }
}
(Ft.Group = It), (It.prototype.nodeType = "Group"), (0, Lt._registerNode)(It);
var Gt = {};
Object.defineProperty(Gt, "__esModule", { value: !0 }), (Gt.Animation = void 0);
const $t = u,
  Vt = f,
  Ut =
    $t.glob.performance && $t.glob.performance.now
      ? function () {
          return $t.glob.performance.now();
        }
      : function () {
          return new Date().getTime();
        };
class jt {
  constructor(t, e) {
    (this.id = jt.animIdCounter++),
      (this.frame = { time: 0, timeDiff: 0, lastTime: Ut(), frameRate: 0 }),
      (this.func = t),
      this.setLayers(e);
  }
  setLayers(t) {
    let e = [];
    return t && (e = Array.isArray(t) ? t : [t]), (this.layers = e), this;
  }
  getLayers() {
    return this.layers;
  }
  addLayer(t) {
    const e = this.layers,
      n = e.length;
    for (let r = 0; r < n; r++) if (e[r]._id === t._id) return !1;
    return this.layers.push(t), !0;
  }
  isRunning() {
    const t = jt.animations,
      e = t.length;
    for (let n = 0; n < e; n++) if (t[n].id === this.id) return !0;
    return !1;
  }
  start() {
    return this.stop(), (this.frame.timeDiff = 0), (this.frame.lastTime = Ut()), jt._addAnimation(this), this;
  }
  stop() {
    return jt._removeAnimation(this), this;
  }
  _updateFrameObject(t) {
    (this.frame.timeDiff = t - this.frame.lastTime),
      (this.frame.lastTime = t),
      (this.frame.time += this.frame.timeDiff),
      (this.frame.frameRate = 1e3 / this.frame.timeDiff);
  }
  static _addAnimation(t) {
    this.animations.push(t), this._handleAnimation();
  }
  static _removeAnimation(t) {
    const e = t.id,
      n = this.animations,
      r = n.length;
    for (let t = 0; t < r; t++)
      if (n[t].id === e) {
        this.animations.splice(t, 1);
        break;
      }
  }
  static _runFrames() {
    const t = {},
      e = this.animations;
    for (let n = 0; n < e.length; n++) {
      const r = e[n],
        i = r.layers,
        a = r.func;
      r._updateFrameObject(Ut());
      const o = i.length;
      let s;
      if (((s = !a || !1 !== a.call(r, r.frame)), s))
        for (let e = 0; e < o; e++) {
          const n = i[e];
          void 0 !== n._id && (t[n._id] = n);
        }
    }
    for (let e in t) t.hasOwnProperty(e) && t[e].batchDraw();
  }
  static _animationLoop() {
    const t = jt;
    t.animations.length ? (t._runFrames(), Vt.Util.requestAnimFrame(t._animationLoop)) : (t.animRunning = !1);
  }
  static _handleAnimation() {
    this.animRunning || ((this.animRunning = !0), Vt.Util.requestAnimFrame(this._animationLoop));
  }
}
(Gt.Animation = jt), (jt.animations = []), (jt.animIdCounter = 0), (jt.animRunning = !1);
var Bt = {};
!(function (t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), (t.Easings = t.Tween = void 0);
  const e = f,
    n = Gt,
    r = p,
    i = u;
  var a = { node: 1, duration: 1, easing: 1, onFinish: 1, yoyo: 1 },
    o = 0,
    s = ["fill", "stroke", "shadowColor"];
  class c {
    constructor(t, e, n, r, i, a, o) {
      (this.prop = t),
        (this.propFunc = e),
        (this.begin = r),
        (this._pos = r),
        (this.duration = a),
        (this._change = 0),
        (this.prevPos = 0),
        (this.yoyo = o),
        (this._time = 0),
        (this._position = 0),
        (this._startTime = 0),
        (this._finish = 0),
        (this.func = n),
        (this._change = i - this.begin),
        this.pause();
    }
    fire(t) {
      var e = this[t];
      e && e();
    }
    setTime(t) {
      t > this.duration
        ? this.yoyo
          ? ((this._time = this.duration), this.reverse())
          : this.finish()
        : t < 0
        ? this.yoyo
          ? ((this._time = 0), this.play())
          : this.reset()
        : ((this._time = t), this.update());
    }
    getTime() {
      return this._time;
    }
    setPosition(t) {
      (this.prevPos = this._pos), this.propFunc(t), (this._pos = t);
    }
    getPosition(t) {
      return void 0 === t && (t = this._time), this.func(t, this.begin, this._change, this.duration);
    }
    play() {
      (this.state = 2), (this._startTime = this.getTimer() - this._time), this.onEnterFrame(), this.fire("onPlay");
    }
    reverse() {
      (this.state = 3),
        (this._time = this.duration - this._time),
        (this._startTime = this.getTimer() - this._time),
        this.onEnterFrame(),
        this.fire("onReverse");
    }
    seek(t) {
      this.pause(), (this._time = t), this.update(), this.fire("onSeek");
    }
    reset() {
      this.pause(), (this._time = 0), this.update(), this.fire("onReset");
    }
    finish() {
      this.pause(), (this._time = this.duration), this.update(), this.fire("onFinish");
    }
    update() {
      this.setPosition(this.getPosition(this._time)), this.fire("onUpdate");
    }
    onEnterFrame() {
      var t = this.getTimer() - this._startTime;
      2 === this.state ? this.setTime(t) : 3 === this.state && this.setTime(this.duration - t);
    }
    pause() {
      (this.state = 1), this.fire("onPause");
    }
    getTimer() {
      return new Date().getTime();
    }
  }
  class l {
    constructor(r) {
      var s,
        h,
        d = this,
        u = r.node,
        f = u._id,
        p = r.easing || t.Easings.Linear,
        g = !!r.yoyo;
      (s = void 0 === r.duration ? 0.3 : 0 === r.duration ? 0.001 : r.duration), (this.node = u), (this._id = o++);
      var v = u.getLayer() || (u instanceof i.Konva.Stage ? u.getLayers() : null);
      for (h in (v ||
        e.Util.error("Tween constructor have `node` that is not in a layer. Please add node into layer first."),
      (this.anim = new n.Animation(function () {
        d.tween.onEnterFrame();
      }, v)),
      (this.tween = new c(
        h,
        function (t) {
          d._tweenFunc(t);
        },
        p,
        0,
        1,
        1e3 * s,
        g
      )),
      this._addListeners(),
      l.attrs[f] || (l.attrs[f] = {}),
      l.attrs[f][this._id] || (l.attrs[f][this._id] = {}),
      l.tweens[f] || (l.tweens[f] = {}),
      r))
        void 0 === a[h] && this._addAttr(h, r[h]);
      this.reset(), (this.onFinish = r.onFinish), (this.onReset = r.onReset), (this.onUpdate = r.onUpdate);
    }
    _addAttr(t, n) {
      var r,
        i,
        a,
        o,
        c,
        h,
        d,
        u,
        f = this.node,
        p = f._id;
      if (((a = l.tweens[p][t]) && delete l.attrs[p][a][t], (r = f.getAttr(t)), e.Util._isArray(n)))
        if (
          ((i = []),
          (c = Math.max(n.length, r.length)),
          "points" === t &&
            n.length !== r.length &&
            (n.length > r.length
              ? ((d = r), (r = e.Util._prepareArrayForTween(r, n, f.closed())))
              : ((h = n), (n = e.Util._prepareArrayForTween(n, r, f.closed())))),
          0 === t.indexOf("fill"))
        )
          for (o = 0; o < c; o++)
            if (o % 2 == 0) i.push(n[o] - r[o]);
            else {
              var g = e.Util.colorToRGBA(r[o]);
              (u = e.Util.colorToRGBA(n[o])),
                (r[o] = g),
                i.push({ r: u.r - g.r, g: u.g - g.g, b: u.b - g.b, a: u.a - g.a });
            }
        else for (o = 0; o < c; o++) i.push(n[o] - r[o]);
      else
        -1 !== s.indexOf(t)
          ? ((r = e.Util.colorToRGBA(r)),
            (i = { r: (u = e.Util.colorToRGBA(n)).r - r.r, g: u.g - r.g, b: u.b - r.b, a: u.a - r.a }))
          : (i = n - r);
      (l.attrs[p][this._id][t] = { start: r, diff: i, end: n, trueEnd: h, trueStart: d }), (l.tweens[p][t] = this._id);
    }
    _tweenFunc(t) {
      var n,
        r,
        i,
        a,
        o,
        c,
        h,
        d,
        u = this.node,
        f = l.attrs[u._id][this._id];
      for (n in f) {
        if (((i = (r = f[n]).start), (a = r.diff), (d = r.end), e.Util._isArray(i)))
          if (((o = []), (h = Math.max(i.length, d.length)), 0 === n.indexOf("fill")))
            for (c = 0; c < h; c++)
              c % 2 == 0
                ? o.push((i[c] || 0) + a[c] * t)
                : o.push(
                    "rgba(" +
                      Math.round(i[c].r + a[c].r * t) +
                      "," +
                      Math.round(i[c].g + a[c].g * t) +
                      "," +
                      Math.round(i[c].b + a[c].b * t) +
                      "," +
                      (i[c].a + a[c].a * t) +
                      ")"
                  );
          else for (c = 0; c < h; c++) o.push((i[c] || 0) + a[c] * t);
        else
          o =
            -1 !== s.indexOf(n)
              ? "rgba(" +
                Math.round(i.r + a.r * t) +
                "," +
                Math.round(i.g + a.g * t) +
                "," +
                Math.round(i.b + a.b * t) +
                "," +
                (i.a + a.a * t) +
                ")"
              : i + a * t;
        u.setAttr(n, o);
      }
    }
    _addListeners() {
      (this.tween.onPlay = () => {
        this.anim.start();
      }),
        (this.tween.onReverse = () => {
          this.anim.start();
        }),
        (this.tween.onPause = () => {
          this.anim.stop();
        }),
        (this.tween.onFinish = () => {
          var t = this.node,
            e = l.attrs[t._id][this._id];
          e.points && e.points.trueEnd && t.setAttr("points", e.points.trueEnd),
            this.onFinish && this.onFinish.call(this);
        }),
        (this.tween.onReset = () => {
          var t = this.node,
            e = l.attrs[t._id][this._id];
          e.points && e.points.trueStart && t.points(e.points.trueStart), this.onReset && this.onReset();
        }),
        (this.tween.onUpdate = () => {
          this.onUpdate && this.onUpdate.call(this);
        });
    }
    play() {
      return this.tween.play(), this;
    }
    reverse() {
      return this.tween.reverse(), this;
    }
    reset() {
      return this.tween.reset(), this;
    }
    seek(t) {
      return this.tween.seek(1e3 * t), this;
    }
    pause() {
      return this.tween.pause(), this;
    }
    finish() {
      return this.tween.finish(), this;
    }
    destroy() {
      var t,
        e = this.node._id,
        n = this._id,
        r = l.tweens[e];
      for (t in (this.pause(), r)) delete l.tweens[e][t];
      delete l.attrs[e][n];
    }
  }
  (t.Tween = l),
    (l.attrs = {}),
    (l.tweens = {}),
    (r.Node.prototype.to = function (t) {
      var e = t.onFinish;
      (t.node = this),
        (t.onFinish = function () {
          this.destroy(), e && e();
        }),
        new l(t).play();
    }),
    (t.Easings = {
      BackEaseIn(t, e, n, r) {
        var i = 1.70158;
        return n * (t /= r) * t * ((i + 1) * t - i) + e;
      },
      BackEaseOut(t, e, n, r) {
        var i = 1.70158;
        return n * ((t = t / r - 1) * t * ((i + 1) * t + i) + 1) + e;
      },
      BackEaseInOut(t, e, n, r) {
        var i = 1.70158;
        return (t /= r / 2) < 1
          ? (n / 2) * (t * t * ((1 + (i *= 1.525)) * t - i)) + e
          : (n / 2) * ((t -= 2) * t * ((1 + (i *= 1.525)) * t + i) + 2) + e;
      },
      ElasticEaseIn(t, e, n, r, i, a) {
        var o = 0;
        return 0 === t
          ? e
          : 1 == (t /= r)
          ? e + n
          : (a || (a = 0.3 * r),
            !i || i < Math.abs(n) ? ((i = n), (o = a / 4)) : (o = (a / (2 * Math.PI)) * Math.asin(n / i)),
            -i * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t * r - o) * (2 * Math.PI)) / a) + e);
      },
      ElasticEaseOut(t, e, n, r, i, a) {
        var o = 0;
        return 0 === t
          ? e
          : 1 == (t /= r)
          ? e + n
          : (a || (a = 0.3 * r),
            !i || i < Math.abs(n) ? ((i = n), (o = a / 4)) : (o = (a / (2 * Math.PI)) * Math.asin(n / i)),
            i * Math.pow(2, -10 * t) * Math.sin(((t * r - o) * (2 * Math.PI)) / a) + n + e);
      },
      ElasticEaseInOut(t, e, n, r, i, a) {
        var o = 0;
        return 0 === t
          ? e
          : 2 == (t /= r / 2)
          ? e + n
          : (a || (a = r * (0.3 * 1.5)),
            !i || i < Math.abs(n) ? ((i = n), (o = a / 4)) : (o = (a / (2 * Math.PI)) * Math.asin(n / i)),
            t < 1
              ? i * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t * r - o) * (2 * Math.PI)) / a) * -0.5 + e
              : i * Math.pow(2, -10 * (t -= 1)) * Math.sin(((t * r - o) * (2 * Math.PI)) / a) * 0.5 + n + e);
      },
      BounceEaseOut: (t, e, n, r) =>
        (t /= r) < 1 / 2.75
          ? n * (7.5625 * t * t) + e
          : t < 2 / 2.75
          ? n * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + e
          : t < 2.5 / 2.75
          ? n * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + e
          : n * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + e,
      BounceEaseIn: (e, n, r, i) => r - t.Easings.BounceEaseOut(i - e, 0, r, i) + n,
      BounceEaseInOut: (e, n, r, i) =>
        e < i / 2
          ? 0.5 * t.Easings.BounceEaseIn(2 * e, 0, r, i) + n
          : 0.5 * t.Easings.BounceEaseOut(2 * e - i, 0, r, i) + 0.5 * r + n,
      EaseIn: (t, e, n, r) => n * (t /= r) * t + e,
      EaseOut: (t, e, n, r) => -n * (t /= r) * (t - 2) + e,
      EaseInOut: (t, e, n, r) => ((t /= r / 2) < 1 ? (n / 2) * t * t + e : (-n / 2) * (--t * (t - 2) - 1) + e),
      StrongEaseIn: (t, e, n, r) => n * (t /= r) * t * t * t * t + e,
      StrongEaseOut: (t, e, n, r) => n * ((t = t / r - 1) * t * t * t * t + 1) + e,
      StrongEaseInOut: (t, e, n, r) =>
        (t /= r / 2) < 1 ? (n / 2) * t * t * t * t * t + e : (n / 2) * ((t -= 2) * t * t * t * t + 2) + e,
      Linear: (t, e, n, r) => (n * t) / r + e,
    });
})(Bt),
  (function (t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), (t.Konva = void 0);
    const e = u,
      n = f,
      r = p,
      i = rt,
      a = ct,
      o = gt,
      s = Ot,
      c = Ft,
      l = F,
      h = vt,
      d = Gt,
      g = Bt,
      v = S,
      m = b;
    (t.Konva = n.Util._assign(e.Konva, {
      Util: n.Util,
      Transform: n.Transform,
      Node: r.Node,
      Container: i.Container,
      Stage: a.Stage,
      stages: a.stages,
      Layer: o.Layer,
      FastLayer: s.FastLayer,
      Group: c.Group,
      DD: l.DD,
      Shape: h.Shape,
      shapes: h.shapes,
      Animation: d.Animation,
      Tween: g.Tween,
      Easings: g.Easings,
      Context: v.Context,
      Canvas: m.Canvas,
    })),
      (t.default = t.Konva);
  })(d);
var Ht = {};
Object.defineProperty(Ht, "__esModule", { value: !0 }), (Ht.Arc = void 0);
const Wt = g,
  zt = vt,
  Kt = u,
  Yt = v,
  qt = u;
class Xt extends zt.Shape {
  _sceneFunc(t) {
    var e = Kt.Konva.getAngle(this.angle()),
      n = this.clockwise();
    t.beginPath(),
      t.arc(0, 0, this.outerRadius(), 0, e, n),
      t.arc(0, 0, this.innerRadius(), e, 0, !n),
      t.closePath(),
      t.fillStrokeShape(this);
  }
  getWidth() {
    return 2 * this.outerRadius();
  }
  getHeight() {
    return 2 * this.outerRadius();
  }
  setWidth(t) {
    this.outerRadius(t / 2);
  }
  setHeight(t) {
    this.outerRadius(t / 2);
  }
  getSelfRect() {
    const t = this.innerRadius(),
      e = this.outerRadius(),
      n = this.clockwise(),
      r = Kt.Konva.getAngle(n ? 360 - this.angle() : this.angle()),
      i = Math.cos(Math.min(r, Math.PI)),
      a = Math.sin(Math.min(Math.max(Math.PI, r), (3 * Math.PI) / 2)),
      o = Math.sin(Math.min(r, Math.PI / 2)),
      s = i * (i > 0 ? t : e),
      c = a * (a > 0 ? t : e),
      l = o * (o > 0 ? e : t);
    return { x: s, y: n ? -1 * l : c, width: 1 * e - s, height: l - c };
  }
}
(Ht.Arc = Xt),
  (Xt.prototype._centroid = !0),
  (Xt.prototype.className = "Arc"),
  (Xt.prototype._attrsAffectingSize = ["innerRadius", "outerRadius"]),
  (0, qt._registerNode)(Xt),
  Wt.Factory.addGetterSetter(Xt, "innerRadius", 0, (0, Yt.getNumberValidator)()),
  Wt.Factory.addGetterSetter(Xt, "outerRadius", 0, (0, Yt.getNumberValidator)()),
  Wt.Factory.addGetterSetter(Xt, "angle", 0, (0, Yt.getNumberValidator)()),
  Wt.Factory.addGetterSetter(Xt, "clockwise", !1, (0, Yt.getBooleanValidator)());
var Jt = {},
  Qt = {};
Object.defineProperty(Qt, "__esModule", { value: !0 }), (Qt.Line = void 0);
const Zt = g,
  te = vt,
  ee = v,
  ne = u;
function re(t, e, n, r, i, a, o) {
  var s = Math.sqrt(Math.pow(n - t, 2) + Math.pow(r - e, 2)),
    c = Math.sqrt(Math.pow(i - n, 2) + Math.pow(a - r, 2)),
    l = (o * s) / (s + c),
    h = (o * c) / (s + c);
  return [n - l * (i - t), r - l * (a - e), n + h * (i - t), r + h * (a - e)];
}
function ie(t, e) {
  var n,
    r,
    i = t.length,
    a = [];
  for (n = 2; n < i - 2; n += 2)
    (r = re(t[n - 2], t[n - 1], t[n], t[n + 1], t[n + 2], t[n + 3], e)),
      isNaN(r[0]) || (a.push(r[0]), a.push(r[1]), a.push(t[n]), a.push(t[n + 1]), a.push(r[2]), a.push(r[3]));
  return a;
}
class ae extends te.Shape {
  constructor(t) {
    super(t),
      this.on("pointsChange.konva tensionChange.konva closedChange.konva bezierChange.konva", function () {
        this._clearCache("tensionPoints");
      });
  }
  _sceneFunc(t) {
    var e,
      n,
      r,
      i = this.points(),
      a = i.length,
      o = this.tension(),
      s = this.closed(),
      c = this.bezier();
    if (a) {
      if ((t.beginPath(), t.moveTo(i[0], i[1]), 0 !== o && a > 4)) {
        for (
          n = (e = this.getTensionPoints()).length, r = s ? 0 : 4, s || t.quadraticCurveTo(e[0], e[1], e[2], e[3]);
          r < n - 2;

        )
          t.bezierCurveTo(e[r++], e[r++], e[r++], e[r++], e[r++], e[r++]);
        s || t.quadraticCurveTo(e[n - 2], e[n - 1], i[a - 2], i[a - 1]);
      } else if (c) for (r = 2; r < a; ) t.bezierCurveTo(i[r++], i[r++], i[r++], i[r++], i[r++], i[r++]);
      else for (r = 2; r < a; r += 2) t.lineTo(i[r], i[r + 1]);
      s ? (t.closePath(), t.fillStrokeShape(this)) : t.strokeShape(this);
    }
  }
  getTensionPoints() {
    return this._getCache("tensionPoints", this._getTensionPoints);
  }
  _getTensionPoints() {
    return this.closed() ? this._getTensionPointsClosed() : ie(this.points(), this.tension());
  }
  _getTensionPointsClosed() {
    var t = this.points(),
      e = t.length,
      n = this.tension(),
      r = re(t[e - 2], t[e - 1], t[0], t[1], t[2], t[3], n),
      i = re(t[e - 4], t[e - 3], t[e - 2], t[e - 1], t[0], t[1], n),
      a = ie(t, n);
    return [r[2], r[3]].concat(a).concat([i[0], i[1], t[e - 2], t[e - 1], i[2], i[3], r[0], r[1], t[0], t[1]]);
  }
  getWidth() {
    return this.getSelfRect().width;
  }
  getHeight() {
    return this.getSelfRect().height;
  }
  getSelfRect() {
    var t = this.points();
    if (t.length < 4) return { x: t[0] || 0, y: t[1] || 0, width: 0, height: 0 };
    for (
      var e,
        n,
        r = (t =
          0 !== this.tension()
            ? [t[0], t[1], ...this._getTensionPoints(), t[t.length - 2], t[t.length - 1]]
            : this.points())[0],
        i = t[0],
        a = t[1],
        o = t[1],
        s = 0;
      s < t.length / 2;
      s++
    )
      (e = t[2 * s]),
        (n = t[2 * s + 1]),
        (r = Math.min(r, e)),
        (i = Math.max(i, e)),
        (a = Math.min(a, n)),
        (o = Math.max(o, n));
    return { x: r, y: a, width: i - r, height: o - a };
  }
}
(Qt.Line = ae),
  (ae.prototype.className = "Line"),
  (ae.prototype._attrsAffectingSize = ["points", "bezier", "tension"]),
  (0, ne._registerNode)(ae),
  Zt.Factory.addGetterSetter(ae, "closed", !1),
  Zt.Factory.addGetterSetter(ae, "bezier", !1),
  Zt.Factory.addGetterSetter(ae, "tension", 0, (0, ee.getNumberValidator)()),
  Zt.Factory.addGetterSetter(ae, "points", [], (0, ee.getNumberArrayValidator)());
var oe = {},
  se = {};
!(function (t) {
  Object.defineProperty(t, "__esModule", { value: !0 }),
    (t.t2length =
      t.getQuadraticArcLength =
      t.getCubicArcLength =
      t.binomialCoefficients =
      t.cValues =
      t.tValues =
        void 0),
    (t.tValues = [
      [],
      [],
      [-0.5773502691896257, 0.5773502691896257],
      [0, -0.7745966692414834, 0.7745966692414834],
      [-0.33998104358485626, 0.33998104358485626, -0.8611363115940526, 0.8611363115940526],
      [0, -0.5384693101056831, 0.5384693101056831, -0.906179845938664, 0.906179845938664],
      [
        0.6612093864662645, -0.6612093864662645, -0.2386191860831969, 0.2386191860831969, -0.932469514203152,
        0.932469514203152,
      ],
      [
        0, 0.4058451513773972, -0.4058451513773972, -0.7415311855993945, 0.7415311855993945, -0.9491079123427585,
        0.9491079123427585,
      ],
      [
        -0.1834346424956498, 0.1834346424956498, -0.525532409916329, 0.525532409916329, -0.7966664774136267,
        0.7966664774136267, -0.9602898564975363, 0.9602898564975363,
      ],
      [
        0, -0.8360311073266358, 0.8360311073266358, -0.9681602395076261, 0.9681602395076261, -0.3242534234038089,
        0.3242534234038089, -0.6133714327005904, 0.6133714327005904,
      ],
      [
        -0.14887433898163122, 0.14887433898163122, -0.4333953941292472, 0.4333953941292472, -0.6794095682990244,
        0.6794095682990244, -0.8650633666889845, 0.8650633666889845, -0.9739065285171717, 0.9739065285171717,
      ],
      [
        0, -0.26954315595234496, 0.26954315595234496, -0.5190961292068118, 0.5190961292068118, -0.7301520055740494,
        0.7301520055740494, -0.8870625997680953, 0.8870625997680953, -0.978228658146057, 0.978228658146057,
      ],
      [
        -0.1252334085114689, 0.1252334085114689, -0.3678314989981802, 0.3678314989981802, -0.5873179542866175,
        0.5873179542866175, -0.7699026741943047, 0.7699026741943047, -0.9041172563704749, 0.9041172563704749,
        -0.9815606342467192, 0.9815606342467192,
      ],
      [
        0, -0.2304583159551348, 0.2304583159551348, -0.44849275103644687, 0.44849275103644687, -0.6423493394403402,
        0.6423493394403402, -0.8015780907333099, 0.8015780907333099, -0.9175983992229779, 0.9175983992229779,
        -0.9841830547185881, 0.9841830547185881,
      ],
      [
        -0.10805494870734367, 0.10805494870734367, -0.31911236892788974, 0.31911236892788974, -0.5152486363581541,
        0.5152486363581541, -0.6872929048116855, 0.6872929048116855, -0.827201315069765, 0.827201315069765,
        -0.9284348836635735, 0.9284348836635735, -0.9862838086968123, 0.9862838086968123,
      ],
      [
        0, -0.20119409399743451, 0.20119409399743451, -0.3941513470775634, 0.3941513470775634, -0.5709721726085388,
        0.5709721726085388, -0.7244177313601701, 0.7244177313601701, -0.8482065834104272, 0.8482065834104272,
        -0.937273392400706, 0.937273392400706, -0.9879925180204854, 0.9879925180204854,
      ],
      [
        -0.09501250983763744, 0.09501250983763744, -0.2816035507792589, 0.2816035507792589, -0.45801677765722737,
        0.45801677765722737, -0.6178762444026438, 0.6178762444026438, -0.755404408355003, 0.755404408355003,
        -0.8656312023878318, 0.8656312023878318, -0.9445750230732326, 0.9445750230732326, -0.9894009349916499,
        0.9894009349916499,
      ],
      [
        0, -0.17848418149584785, 0.17848418149584785, -0.3512317634538763, 0.3512317634538763, -0.5126905370864769,
        0.5126905370864769, -0.6576711592166907, 0.6576711592166907, -0.7815140038968014, 0.7815140038968014,
        -0.8802391537269859, 0.8802391537269859, -0.9506755217687678, 0.9506755217687678, -0.9905754753144174,
        0.9905754753144174,
      ],
      [
        -0.0847750130417353, 0.0847750130417353, -0.2518862256915055, 0.2518862256915055, -0.41175116146284263,
        0.41175116146284263, -0.5597708310739475, 0.5597708310739475, -0.6916870430603532, 0.6916870430603532,
        -0.8037049589725231, 0.8037049589725231, -0.8926024664975557, 0.8926024664975557, -0.9558239495713977,
        0.9558239495713977, -0.9915651684209309, 0.9915651684209309,
      ],
      [
        0, -0.16035864564022537, 0.16035864564022537, -0.31656409996362983, 0.31656409996362983, -0.46457074137596094,
        0.46457074137596094, -0.600545304661681, 0.600545304661681, -0.7209661773352294, 0.7209661773352294,
        -0.8227146565371428, 0.8227146565371428, -0.9031559036148179, 0.9031559036148179, -0.96020815213483,
        0.96020815213483, -0.9924068438435844, 0.9924068438435844,
      ],
      [
        -0.07652652113349734, 0.07652652113349734, -0.22778585114164507, 0.22778585114164507, -0.37370608871541955,
        0.37370608871541955, -0.5108670019508271, 0.5108670019508271, -0.636053680726515, 0.636053680726515,
        -0.7463319064601508, 0.7463319064601508, -0.8391169718222188, 0.8391169718222188, -0.912234428251326,
        0.912234428251326, -0.9639719272779138, 0.9639719272779138, -0.9931285991850949, 0.9931285991850949,
      ],
      [
        0, -0.1455618541608951, 0.1455618541608951, -0.2880213168024011, 0.2880213168024011, -0.4243421202074388,
        0.4243421202074388, -0.5516188358872198, 0.5516188358872198, -0.6671388041974123, 0.6671388041974123,
        -0.7684399634756779, 0.7684399634756779, -0.8533633645833173, 0.8533633645833173, -0.9200993341504008,
        0.9200993341504008, -0.9672268385663063, 0.9672268385663063, -0.9937521706203895, 0.9937521706203895,
      ],
      [
        -0.06973927331972223, 0.06973927331972223, -0.20786042668822127, 0.20786042668822127, -0.34193582089208424,
        0.34193582089208424, -0.469355837986757, 0.469355837986757, -0.5876404035069116, 0.5876404035069116,
        -0.6944872631866827, 0.6944872631866827, -0.7878168059792081, 0.7878168059792081, -0.8658125777203002,
        0.8658125777203002, -0.926956772187174, 0.926956772187174, -0.9700604978354287, 0.9700604978354287,
        -0.9942945854823992, 0.9942945854823992,
      ],
      [
        0, -0.1332568242984661, 0.1332568242984661, -0.26413568097034495, 0.26413568097034495, -0.3903010380302908,
        0.3903010380302908, -0.5095014778460075, 0.5095014778460075, -0.6196098757636461, 0.6196098757636461,
        -0.7186613631319502, 0.7186613631319502, -0.8048884016188399, 0.8048884016188399, -0.8767523582704416,
        0.8767523582704416, -0.9329710868260161, 0.9329710868260161, -0.9725424712181152, 0.9725424712181152,
        -0.9947693349975522, 0.9947693349975522,
      ],
      [
        -0.06405689286260563, 0.06405689286260563, -0.1911188674736163, 0.1911188674736163, -0.3150426796961634,
        0.3150426796961634, -0.4337935076260451, 0.4337935076260451, -0.5454214713888396, 0.5454214713888396,
        -0.6480936519369755, 0.6480936519369755, -0.7401241915785544, 0.7401241915785544, -0.820001985973903,
        0.820001985973903, -0.8864155270044011, 0.8864155270044011, -0.9382745520027328, 0.9382745520027328,
        -0.9747285559713095, 0.9747285559713095, -0.9951872199970213, 0.9951872199970213,
      ],
    ]),
    (t.cValues = [
      [],
      [],
      [1, 1],
      [0.8888888888888888, 0.5555555555555556, 0.5555555555555556],
      [0.6521451548625461, 0.6521451548625461, 0.34785484513745385, 0.34785484513745385],
      [0.5688888888888889, 0.47862867049936647, 0.47862867049936647, 0.23692688505618908, 0.23692688505618908],
      [
        0.3607615730481386, 0.3607615730481386, 0.46791393457269104, 0.46791393457269104, 0.17132449237917036,
        0.17132449237917036,
      ],
      [
        0.4179591836734694, 0.3818300505051189, 0.3818300505051189, 0.27970539148927664, 0.27970539148927664,
        0.1294849661688697, 0.1294849661688697,
      ],
      [
        0.362683783378362, 0.362683783378362, 0.31370664587788727, 0.31370664587788727, 0.22238103445337448,
        0.22238103445337448, 0.10122853629037626, 0.10122853629037626,
      ],
      [
        0.3302393550012598, 0.1806481606948574, 0.1806481606948574, 0.08127438836157441, 0.08127438836157441,
        0.31234707704000286, 0.31234707704000286, 0.26061069640293544, 0.26061069640293544,
      ],
      [
        0.29552422471475287, 0.29552422471475287, 0.26926671930999635, 0.26926671930999635, 0.21908636251598204,
        0.21908636251598204, 0.1494513491505806, 0.1494513491505806, 0.06667134430868814, 0.06667134430868814,
      ],
      [
        0.2729250867779006, 0.26280454451024665, 0.26280454451024665, 0.23319376459199048, 0.23319376459199048,
        0.18629021092773426, 0.18629021092773426, 0.1255803694649046, 0.1255803694649046, 0.05566856711617366,
        0.05566856711617366,
      ],
      [
        0.24914704581340277, 0.24914704581340277, 0.2334925365383548, 0.2334925365383548, 0.20316742672306592,
        0.20316742672306592, 0.16007832854334622, 0.16007832854334622, 0.10693932599531843, 0.10693932599531843,
        0.04717533638651183, 0.04717533638651183,
      ],
      [
        0.2325515532308739, 0.22628318026289723, 0.22628318026289723, 0.2078160475368885, 0.2078160475368885,
        0.17814598076194574, 0.17814598076194574, 0.13887351021978725, 0.13887351021978725, 0.09212149983772845,
        0.09212149983772845, 0.04048400476531588, 0.04048400476531588,
      ],
      [
        0.2152638534631578, 0.2152638534631578, 0.2051984637212956, 0.2051984637212956, 0.18553839747793782,
        0.18553839747793782, 0.15720316715819355, 0.15720316715819355, 0.12151857068790319, 0.12151857068790319,
        0.08015808715976021, 0.08015808715976021, 0.03511946033175186, 0.03511946033175186,
      ],
      [
        0.2025782419255613, 0.19843148532711158, 0.19843148532711158, 0.1861610000155622, 0.1861610000155622,
        0.16626920581699392, 0.16626920581699392, 0.13957067792615432, 0.13957067792615432, 0.10715922046717194,
        0.10715922046717194, 0.07036604748810812, 0.07036604748810812, 0.03075324199611727, 0.03075324199611727,
      ],
      [
        0.1894506104550685, 0.1894506104550685, 0.18260341504492358, 0.18260341504492358, 0.16915651939500254,
        0.16915651939500254, 0.14959598881657674, 0.14959598881657674, 0.12462897125553388, 0.12462897125553388,
        0.09515851168249279, 0.09515851168249279, 0.062253523938647894, 0.062253523938647894, 0.027152459411754096,
        0.027152459411754096,
      ],
      [
        0.17944647035620653, 0.17656270536699264, 0.17656270536699264, 0.16800410215645004, 0.16800410215645004,
        0.15404576107681028, 0.15404576107681028, 0.13513636846852548, 0.13513636846852548, 0.11188384719340397,
        0.11188384719340397, 0.08503614831717918, 0.08503614831717918, 0.0554595293739872, 0.0554595293739872,
        0.02414830286854793, 0.02414830286854793,
      ],
      [
        0.1691423829631436, 0.1691423829631436, 0.16427648374583273, 0.16427648374583273, 0.15468467512626524,
        0.15468467512626524, 0.14064291467065065, 0.14064291467065065, 0.12255520671147846, 0.12255520671147846,
        0.10094204410628717, 0.10094204410628717, 0.07642573025488905, 0.07642573025488905, 0.0497145488949698,
        0.0497145488949698, 0.02161601352648331, 0.02161601352648331,
      ],
      [
        0.1610544498487837, 0.15896884339395434, 0.15896884339395434, 0.15276604206585967, 0.15276604206585967,
        0.1426067021736066, 0.1426067021736066, 0.12875396253933621, 0.12875396253933621, 0.11156664554733399,
        0.11156664554733399, 0.09149002162245, 0.09149002162245, 0.06904454273764123, 0.06904454273764123,
        0.0448142267656996, 0.0448142267656996, 0.019461788229726478, 0.019461788229726478,
      ],
      [
        0.15275338713072584, 0.15275338713072584, 0.14917298647260374, 0.14917298647260374, 0.14209610931838204,
        0.14209610931838204, 0.13168863844917664, 0.13168863844917664, 0.11819453196151841, 0.11819453196151841,
        0.10193011981724044, 0.10193011981724044, 0.08327674157670475, 0.08327674157670475, 0.06267204833410907,
        0.06267204833410907, 0.04060142980038694, 0.04060142980038694, 0.017614007139152118, 0.017614007139152118,
      ],
      [
        0.14608113364969041, 0.14452440398997005, 0.14452440398997005, 0.13988739479107315, 0.13988739479107315,
        0.13226893863333747, 0.13226893863333747, 0.12183141605372853, 0.12183141605372853, 0.10879729916714838,
        0.10879729916714838, 0.09344442345603386, 0.09344442345603386, 0.0761001136283793, 0.0761001136283793,
        0.057134425426857205, 0.057134425426857205, 0.036953789770852494, 0.036953789770852494, 0.016017228257774335,
        0.016017228257774335,
      ],
      [
        0.13925187285563198, 0.13925187285563198, 0.13654149834601517, 0.13654149834601517, 0.13117350478706238,
        0.13117350478706238, 0.12325237681051242, 0.12325237681051242, 0.11293229608053922, 0.11293229608053922,
        0.10041414444288096, 0.10041414444288096, 0.08594160621706773, 0.08594160621706773, 0.06979646842452049,
        0.06979646842452049, 0.052293335152683286, 0.052293335152683286, 0.03377490158481415, 0.03377490158481415,
        0.0146279952982722, 0.0146279952982722,
      ],
      [
        0.13365457218610619, 0.1324620394046966, 0.1324620394046966, 0.12890572218808216, 0.12890572218808216,
        0.12304908430672953, 0.12304908430672953, 0.11499664022241136, 0.11499664022241136, 0.10489209146454141,
        0.10489209146454141, 0.09291576606003515, 0.09291576606003515, 0.07928141177671895, 0.07928141177671895,
        0.06423242140852585, 0.06423242140852585, 0.04803767173108467, 0.04803767173108467, 0.030988005856979445,
        0.030988005856979445, 0.013411859487141771, 0.013411859487141771,
      ],
      [
        0.12793819534675216, 0.12793819534675216, 0.1258374563468283, 0.1258374563468283, 0.12167047292780339,
        0.12167047292780339, 0.1155056680537256, 0.1155056680537256, 0.10744427011596563, 0.10744427011596563,
        0.09761865210411388, 0.09761865210411388, 0.08619016153195327, 0.08619016153195327, 0.0733464814110803,
        0.0733464814110803, 0.05929858491543678, 0.05929858491543678, 0.04427743881741981, 0.04427743881741981,
        0.028531388628933663, 0.028531388628933663, 0.0123412297999872, 0.0123412297999872,
      ],
    ]),
    (t.binomialCoefficients = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]]);
  t.getCubicArcLength = (n, r, i) => {
    let a, o, s;
    (a = i / 2), (o = 0);
    for (let i = 0; i < 20; i++) (s = a * t.tValues[20][i] + a), (o += t.cValues[20][i] * e(n, r, s));
    return a * o;
  };
  function e(t, e, r) {
    const i = n(1, r, t),
      a = n(1, r, e),
      o = i * i + a * a;
    return Math.sqrt(o);
  }
  t.getQuadraticArcLength = (t, e, n) => {
    void 0 === n && (n = 1);
    const r = t[0] - 2 * t[1] + t[2],
      i = e[0] - 2 * e[1] + e[2],
      a = 2 * t[1] - 2 * t[0],
      o = 2 * e[1] - 2 * e[0],
      s = 4 * (r * r + i * i),
      c = 4 * (r * a + i * o),
      l = a * a + o * o;
    if (0 === s) return n * Math.sqrt(Math.pow(t[2] - t[0], 2) + Math.pow(e[2] - e[0], 2));
    const h = c / (2 * s),
      d = n + h,
      u = l / s - h * h,
      f = d * d + u > 0 ? Math.sqrt(d * d + u) : 0,
      p = h * h + u > 0 ? Math.sqrt(h * h + u) : 0,
      g = h + Math.sqrt(h * h + u) !== 0 ? u * Math.log(Math.abs((d + f) / (h + p))) : 0;
    return (Math.sqrt(s) / 2) * (d * f - h * p + g);
  };
  const n = (e, r, i) => {
    const a = i.length - 1;
    let o, s;
    if (0 === a) return 0;
    if (0 === e) {
      s = 0;
      for (let e = 0; e <= a; e++) s += t.binomialCoefficients[a][e] * Math.pow(1 - r, a - e) * Math.pow(r, e) * i[e];
      return s;
    }
    o = new Array(a);
    for (let t = 0; t < a; t++) o[t] = a * (i[t + 1] - i[t]);
    return n(e - 1, r, o);
  };
  t.t2length = (t, e, n) => {
    let r = 1,
      i = t / e,
      a = (t - n(i)) / e,
      o = 0;
    for (; r > 0.001; ) {
      const s = n(i + a),
        c = Math.abs(t - s) / e;
      if (c < r) (r = c), (i += a);
      else {
        const o = n(i - a),
          s = Math.abs(t - o) / e;
        s < r ? ((r = s), (i -= a)) : (a /= 2);
      }
      if ((o++, o > 500)) break;
    }
    return i;
  };
})(se),
  Object.defineProperty(oe, "__esModule", { value: !0 }),
  (oe.Path = void 0);
const ce = g,
  le = vt,
  he = u,
  de = se;
class ue extends le.Shape {
  constructor(t) {
    super(t),
      (this.dataArray = []),
      (this.pathLength = 0),
      this._readDataAttribute(),
      this.on("dataChange.konva", function () {
        this._readDataAttribute();
      });
  }
  _readDataAttribute() {
    (this.dataArray = ue.parsePathData(this.data())), (this.pathLength = ue.getPathLength(this.dataArray));
  }
  _sceneFunc(t) {
    var e = this.dataArray;
    t.beginPath();
    for (var n = !1, r = 0; r < e.length; r++) {
      var i = e[r].command,
        a = e[r].points;
      switch (i) {
        case "L":
          t.lineTo(a[0], a[1]);
          break;
        case "M":
          t.moveTo(a[0], a[1]);
          break;
        case "C":
          t.bezierCurveTo(a[0], a[1], a[2], a[3], a[4], a[5]);
          break;
        case "Q":
          t.quadraticCurveTo(a[0], a[1], a[2], a[3]);
          break;
        case "A":
          var o = a[0],
            s = a[1],
            c = a[2],
            l = a[3],
            h = a[4],
            d = a[5],
            u = a[6],
            f = a[7],
            p = c > l ? c : l,
            g = c > l ? 1 : c / l,
            v = c > l ? l / c : 1;
          t.translate(o, s),
            t.rotate(u),
            t.scale(g, v),
            t.arc(0, 0, p, h, h + d, 1 - f),
            t.scale(1 / g, 1 / v),
            t.rotate(-u),
            t.translate(-o, -s);
          break;
        case "z":
          (n = !0), t.closePath();
      }
    }
    n || this.hasFill() ? t.fillStrokeShape(this) : t.strokeShape(this);
  }
  getSelfRect() {
    var t = [];
    this.dataArray.forEach(function (e) {
      if ("A" === e.command) {
        var n = e.points[4],
          r = e.points[5],
          i = e.points[4] + r,
          a = Math.PI / 180;
        if ((Math.abs(n - i) < a && (a = Math.abs(n - i)), r < 0))
          for (let r = n - a; r > i; r -= a) {
            const n = ue.getPointOnEllipticalArc(e.points[0], e.points[1], e.points[2], e.points[3], r, 0);
            t.push(n.x, n.y);
          }
        else
          for (let r = n + a; r < i; r += a) {
            const n = ue.getPointOnEllipticalArc(e.points[0], e.points[1], e.points[2], e.points[3], r, 0);
            t.push(n.x, n.y);
          }
      } else if ("C" === e.command)
        for (let n = 0; n <= 1; n += 0.01) {
          const r = ue.getPointOnCubicBezier(
            n,
            e.start.x,
            e.start.y,
            e.points[0],
            e.points[1],
            e.points[2],
            e.points[3],
            e.points[4],
            e.points[5]
          );
          t.push(r.x, r.y);
        }
      else t = t.concat(e.points);
    });
    for (var e, n, r = t[0], i = t[0], a = t[1], o = t[1], s = 0; s < t.length / 2; s++)
      (e = t[2 * s]),
        (n = t[2 * s + 1]),
        isNaN(e) || ((r = Math.min(r, e)), (i = Math.max(i, e))),
        isNaN(n) || ((a = Math.min(a, n)), (o = Math.max(o, n)));
    return { x: r, y: a, width: i - r, height: o - a };
  }
  getLength() {
    return this.pathLength;
  }
  getPointAtLength(t) {
    return ue.getPointAtLengthOfDataArray(t, this.dataArray);
  }
  static getLineLength(t, e, n, r) {
    return Math.sqrt((n - t) * (n - t) + (r - e) * (r - e));
  }
  static getPathLength(t) {
    let e = 0;
    for (var n = 0; n < t.length; ++n) e += t[n].pathLength;
    return e;
  }
  static getPointAtLengthOfDataArray(t, e) {
    var n,
      r = 0,
      i = e.length;
    if (!i) return null;
    for (; r < i && t > e[r].pathLength; ) (t -= e[r].pathLength), ++r;
    if (r === i) return { x: (n = e[r - 1].points.slice(-2))[0], y: n[1] };
    if (t < 0.01) return { x: (n = e[r].points.slice(0, 2))[0], y: n[1] };
    var a = e[r],
      o = a.points;
    switch (a.command) {
      case "L":
        return ue.getPointOnLine(t, a.start.x, a.start.y, o[0], o[1]);
      case "C":
        return ue.getPointOnCubicBezier(
          (0, de.t2length)(t, ue.getPathLength(e), (t) =>
            (0, de.getCubicArcLength)([a.start.x, o[0], o[2], o[4]], [a.start.y, o[1], o[3], o[5]], t)
          ),
          a.start.x,
          a.start.y,
          o[0],
          o[1],
          o[2],
          o[3],
          o[4],
          o[5]
        );
      case "Q":
        return ue.getPointOnQuadraticBezier(
          (0, de.t2length)(t, ue.getPathLength(e), (t) =>
            (0, de.getQuadraticArcLength)([a.start.x, o[0], o[2]], [a.start.y, o[1], o[3]], t)
          ),
          a.start.x,
          a.start.y,
          o[0],
          o[1],
          o[2],
          o[3]
        );
      case "A":
        var s = o[0],
          c = o[1],
          l = o[2],
          h = o[3],
          d = o[4],
          u = o[5],
          f = o[6];
        return (d += (u * t) / a.pathLength), ue.getPointOnEllipticalArc(s, c, l, h, d, f);
    }
    return null;
  }
  static getPointOnLine(t, e, n, r, i, a, o) {
    void 0 === a && (a = e), void 0 === o && (o = n);
    var s = (i - n) / (r - e + 1e-8),
      c = Math.sqrt((t * t) / (1 + s * s));
    r < e && (c *= -1);
    var l,
      h = s * c;
    if (r === e) l = { x: a, y: o + h };
    else if ((o - n) / (a - e + 1e-8) === s) l = { x: a + c, y: o + h };
    else {
      var d,
        u,
        f = this.getLineLength(e, n, r, i),
        p = (a - e) * (r - e) + (o - n) * (i - n);
      (d = e + (p /= f * f) * (r - e)), (u = n + p * (i - n));
      var g = this.getLineLength(a, o, d, u),
        v = Math.sqrt(t * t - g * g);
      (c = Math.sqrt((v * v) / (1 + s * s))), r < e && (c *= -1), (l = { x: d + c, y: u + (h = s * c) });
    }
    return l;
  }
  static getPointOnCubicBezier(t, e, n, r, i, a, o, s, c) {
    function l(t) {
      return t * t * t;
    }
    function h(t) {
      return 3 * t * t * (1 - t);
    }
    function d(t) {
      return 3 * t * (1 - t) * (1 - t);
    }
    function u(t) {
      return (1 - t) * (1 - t) * (1 - t);
    }
    return { x: s * l(t) + a * h(t) + r * d(t) + e * u(t), y: c * l(t) + o * h(t) + i * d(t) + n * u(t) };
  }
  static getPointOnQuadraticBezier(t, e, n, r, i, a, o) {
    function s(t) {
      return t * t;
    }
    function c(t) {
      return 2 * t * (1 - t);
    }
    function l(t) {
      return (1 - t) * (1 - t);
    }
    return { x: a * s(t) + r * c(t) + e * l(t), y: o * s(t) + i * c(t) + n * l(t) };
  }
  static getPointOnEllipticalArc(t, e, n, r, i, a) {
    var o = Math.cos(a),
      s = Math.sin(a),
      c = n * Math.cos(i),
      l = r * Math.sin(i);
    return { x: t + (c * o - l * s), y: e + (c * s + l * o) };
  }
  static parsePathData(t) {
    if (!t) return [];
    var e = t,
      n = ["m", "M", "l", "L", "v", "V", "h", "H", "z", "Z", "c", "C", "q", "Q", "t", "T", "s", "S", "a", "A"];
    e = e.replace(new RegExp(" ", "g"), ",");
    for (var r = 0; r < n.length; r++) e = e.replace(new RegExp(n[r], "g"), "|" + n[r]);
    var i,
      a = e.split("|"),
      o = [],
      s = [],
      c = 0,
      l = 0,
      h = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:e[-+]?\d+)?)/gi;
    for (r = 1; r < a.length; r++) {
      var d = a[r],
        u = d.charAt(0);
      for (d = d.slice(1), s.length = 0; (i = h.exec(d)); ) s.push(i[0]);
      for (var f = [], p = 0, g = s.length; p < g; p++)
        if ("00" !== s[p]) {
          var v = parseFloat(s[p]);
          isNaN(v) ? f.push(0) : f.push(v);
        } else f.push(0, 0);
      for (; f.length > 0 && !isNaN(f[0]); ) {
        var m,
          y,
          _,
          b,
          S,
          w,
          x,
          C,
          k,
          E,
          N = "",
          O = [],
          A = c,
          P = l;
        switch (u) {
          case "l":
            (c += f.shift()), (l += f.shift()), (N = "L"), O.push(c, l);
            break;
          case "L":
            (c = f.shift()), (l = f.shift()), O.push(c, l);
            break;
          case "m":
            var T = f.shift(),
              D = f.shift();
            if (((c += T), (l += D), (N = "M"), o.length > 2 && "z" === o[o.length - 1].command))
              for (var F = o.length - 2; F >= 0; F--)
                if ("M" === o[F].command) {
                  (c = o[F].points[0] + T), (l = o[F].points[1] + D);
                  break;
                }
            O.push(c, l), (u = "l");
            break;
          case "M":
            (c = f.shift()), (l = f.shift()), (N = "M"), O.push(c, l), (u = "L");
            break;
          case "h":
            (c += f.shift()), (N = "L"), O.push(c, l);
            break;
          case "H":
            (c = f.shift()), (N = "L"), O.push(c, l);
            break;
          case "v":
            (l += f.shift()), (N = "L"), O.push(c, l);
            break;
          case "V":
            (l = f.shift()), (N = "L"), O.push(c, l);
            break;
          case "C":
            O.push(f.shift(), f.shift(), f.shift(), f.shift()), (c = f.shift()), (l = f.shift()), O.push(c, l);
            break;
          case "c":
            O.push(c + f.shift(), l + f.shift(), c + f.shift(), l + f.shift()),
              (c += f.shift()),
              (l += f.shift()),
              (N = "C"),
              O.push(c, l);
            break;
          case "S":
            (y = c),
              (_ = l),
              "C" === (m = o[o.length - 1]).command && ((y = c + (c - m.points[2])), (_ = l + (l - m.points[3]))),
              O.push(y, _, f.shift(), f.shift()),
              (c = f.shift()),
              (l = f.shift()),
              (N = "C"),
              O.push(c, l);
            break;
          case "s":
            (y = c),
              (_ = l),
              "C" === (m = o[o.length - 1]).command && ((y = c + (c - m.points[2])), (_ = l + (l - m.points[3]))),
              O.push(y, _, c + f.shift(), l + f.shift()),
              (c += f.shift()),
              (l += f.shift()),
              (N = "C"),
              O.push(c, l);
            break;
          case "Q":
            O.push(f.shift(), f.shift()), (c = f.shift()), (l = f.shift()), O.push(c, l);
            break;
          case "q":
            O.push(c + f.shift(), l + f.shift()), (c += f.shift()), (l += f.shift()), (N = "Q"), O.push(c, l);
            break;
          case "T":
            (y = c),
              (_ = l),
              "Q" === (m = o[o.length - 1]).command && ((y = c + (c - m.points[0])), (_ = l + (l - m.points[1]))),
              (c = f.shift()),
              (l = f.shift()),
              (N = "Q"),
              O.push(y, _, c, l);
            break;
          case "t":
            (y = c),
              (_ = l),
              "Q" === (m = o[o.length - 1]).command && ((y = c + (c - m.points[0])), (_ = l + (l - m.points[1]))),
              (c += f.shift()),
              (l += f.shift()),
              (N = "Q"),
              O.push(y, _, c, l);
            break;
          case "A":
            (b = f.shift()),
              (S = f.shift()),
              (w = f.shift()),
              (x = f.shift()),
              (C = f.shift()),
              (k = c),
              (E = l),
              (c = f.shift()),
              (l = f.shift()),
              (N = "A"),
              (O = this.convertEndpointToCenterParameterization(k, E, c, l, x, C, b, S, w));
            break;
          case "a":
            (b = f.shift()),
              (S = f.shift()),
              (w = f.shift()),
              (x = f.shift()),
              (C = f.shift()),
              (k = c),
              (E = l),
              (c += f.shift()),
              (l += f.shift()),
              (N = "A"),
              (O = this.convertEndpointToCenterParameterization(k, E, c, l, x, C, b, S, w));
        }
        o.push({ command: N || u, points: O, start: { x: A, y: P }, pathLength: this.calcLength(A, P, N || u, O) });
      }
      ("z" !== u && "Z" !== u) || o.push({ command: "z", points: [], start: void 0, pathLength: 0 });
    }
    return o;
  }
  static calcLength(t, e, n, r) {
    var i,
      a,
      o,
      s,
      c = ue;
    switch (n) {
      case "L":
        return c.getLineLength(t, e, r[0], r[1]);
      case "C":
        return (0, de.getCubicArcLength)([t, r[0], r[2], r[4]], [e, r[1], r[3], r[5]], 1);
      case "Q":
        return (0, de.getQuadraticArcLength)([t, r[0], r[2]], [e, r[1], r[3]], 1);
      case "A":
        i = 0;
        var l = r[4],
          h = r[5],
          d = r[4] + h,
          u = Math.PI / 180;
        if (
          (Math.abs(l - d) < u && (u = Math.abs(l - d)),
          (a = c.getPointOnEllipticalArc(r[0], r[1], r[2], r[3], l, 0)),
          h < 0)
        )
          for (s = l - u; s > d; s -= u)
            (o = c.getPointOnEllipticalArc(r[0], r[1], r[2], r[3], s, 0)),
              (i += c.getLineLength(a.x, a.y, o.x, o.y)),
              (a = o);
        else
          for (s = l + u; s < d; s += u)
            (o = c.getPointOnEllipticalArc(r[0], r[1], r[2], r[3], s, 0)),
              (i += c.getLineLength(a.x, a.y, o.x, o.y)),
              (a = o);
        return (
          (o = c.getPointOnEllipticalArc(r[0], r[1], r[2], r[3], d, 0)), (i += c.getLineLength(a.x, a.y, o.x, o.y))
        );
    }
    return 0;
  }
  static convertEndpointToCenterParameterization(t, e, n, r, i, a, o, s, c) {
    var l = c * (Math.PI / 180),
      h = (Math.cos(l) * (t - n)) / 2 + (Math.sin(l) * (e - r)) / 2,
      d = (-1 * Math.sin(l) * (t - n)) / 2 + (Math.cos(l) * (e - r)) / 2,
      u = (h * h) / (o * o) + (d * d) / (s * s);
    u > 1 && ((o *= Math.sqrt(u)), (s *= Math.sqrt(u)));
    var f = Math.sqrt((o * o * (s * s) - o * o * (d * d) - s * s * (h * h)) / (o * o * (d * d) + s * s * (h * h)));
    i === a && (f *= -1), isNaN(f) && (f = 0);
    var p = (f * o * d) / s,
      g = (f * -s * h) / o,
      v = (t + n) / 2 + Math.cos(l) * p - Math.sin(l) * g,
      m = (e + r) / 2 + Math.sin(l) * p + Math.cos(l) * g,
      y = function (t) {
        return Math.sqrt(t[0] * t[0] + t[1] * t[1]);
      },
      _ = function (t, e) {
        return (t[0] * e[0] + t[1] * e[1]) / (y(t) * y(e));
      },
      b = function (t, e) {
        return (t[0] * e[1] < t[1] * e[0] ? -1 : 1) * Math.acos(_(t, e));
      },
      S = b([1, 0], [(h - p) / o, (d - g) / s]),
      w = [(h - p) / o, (d - g) / s],
      x = [(-1 * h - p) / o, (-1 * d - g) / s],
      C = b(w, x);
    return (
      _(w, x) <= -1 && (C = Math.PI),
      _(w, x) >= 1 && (C = 0),
      0 === a && C > 0 && (C -= 2 * Math.PI),
      1 === a && C < 0 && (C += 2 * Math.PI),
      [v, m, o, s, S, C, l, a]
    );
  }
}
(oe.Path = ue),
  (ue.prototype.className = "Path"),
  (ue.prototype._attrsAffectingSize = ["data"]),
  (0, he._registerNode)(ue),
  ce.Factory.addGetterSetter(ue, "data"),
  Object.defineProperty(Jt, "__esModule", { value: !0 }),
  (Jt.Arrow = void 0);
const fe = g,
  pe = Qt,
  ge = v,
  ve = u,
  me = oe;
class ye extends pe.Line {
  _sceneFunc(t) {
    super._sceneFunc(t);
    var e = 2 * Math.PI,
      n = this.points(),
      r = n,
      i = 0 !== this.tension() && n.length > 4;
    i && (r = this.getTensionPoints());
    var a,
      o,
      s = this.pointerLength(),
      c = n.length;
    if (i) {
      const t = [r[r.length - 4], r[r.length - 3], r[r.length - 2], r[r.length - 1], n[c - 2], n[c - 1]],
        e = me.Path.calcLength(r[r.length - 4], r[r.length - 3], "C", t),
        i = me.Path.getPointOnQuadraticBezier(Math.min(1, 1 - s / e), t[0], t[1], t[2], t[3], t[4], t[5]);
      (a = n[c - 2] - i.x), (o = n[c - 1] - i.y);
    } else (a = n[c - 2] - n[c - 4]), (o = n[c - 1] - n[c - 3]);
    var l = (Math.atan2(o, a) + e) % e,
      h = this.pointerWidth();
    this.pointerAtEnding() &&
      (t.save(),
      t.beginPath(),
      t.translate(n[c - 2], n[c - 1]),
      t.rotate(l),
      t.moveTo(0, 0),
      t.lineTo(-s, h / 2),
      t.lineTo(-s, -h / 2),
      t.closePath(),
      t.restore(),
      this.__fillStroke(t)),
      this.pointerAtBeginning() &&
        (t.save(),
        t.beginPath(),
        t.translate(n[0], n[1]),
        i ? ((a = (r[0] + r[2]) / 2 - n[0]), (o = (r[1] + r[3]) / 2 - n[1])) : ((a = n[2] - n[0]), (o = n[3] - n[1])),
        t.rotate((Math.atan2(-o, -a) + e) % e),
        t.moveTo(0, 0),
        t.lineTo(-s, h / 2),
        t.lineTo(-s, -h / 2),
        t.closePath(),
        t.restore(),
        this.__fillStroke(t));
  }
  __fillStroke(t) {
    var e = this.dashEnabled();
    e && ((this.attrs.dashEnabled = !1), t.setLineDash([])),
      t.fillStrokeShape(this),
      e && (this.attrs.dashEnabled = !0);
  }
  getSelfRect() {
    const t = super.getSelfRect(),
      e = this.pointerWidth() / 2;
    return { x: t.x - e, y: t.y - e, width: t.width + 2 * e, height: t.height + 2 * e };
  }
}
(Jt.Arrow = ye),
  (ye.prototype.className = "Arrow"),
  (0, ve._registerNode)(ye),
  fe.Factory.addGetterSetter(ye, "pointerLength", 10, (0, ge.getNumberValidator)()),
  fe.Factory.addGetterSetter(ye, "pointerWidth", 10, (0, ge.getNumberValidator)()),
  fe.Factory.addGetterSetter(ye, "pointerAtBeginning", !1),
  fe.Factory.addGetterSetter(ye, "pointerAtEnding", !0);
var _e = {};
Object.defineProperty(_e, "__esModule", { value: !0 }), (_e.Circle = void 0);
const be = g,
  Se = vt,
  we = v,
  xe = u;
class Ce extends Se.Shape {
  _sceneFunc(t) {
    t.beginPath(), t.arc(0, 0, this.attrs.radius || 0, 0, 2 * Math.PI, !1), t.closePath(), t.fillStrokeShape(this);
  }
  getWidth() {
    return 2 * this.radius();
  }
  getHeight() {
    return 2 * this.radius();
  }
  setWidth(t) {
    this.radius() !== t / 2 && this.radius(t / 2);
  }
  setHeight(t) {
    this.radius() !== t / 2 && this.radius(t / 2);
  }
}
(_e.Circle = Ce),
  (Ce.prototype._centroid = !0),
  (Ce.prototype.className = "Circle"),
  (Ce.prototype._attrsAffectingSize = ["radius"]),
  (0, xe._registerNode)(Ce),
  be.Factory.addGetterSetter(Ce, "radius", 0, (0, we.getNumberValidator)());
var ke = {};
Object.defineProperty(ke, "__esModule", { value: !0 }), (ke.Ellipse = void 0);
const Ee = g,
  Ne = vt,
  Oe = v,
  Ae = u;
class Pe extends Ne.Shape {
  _sceneFunc(t) {
    var e = this.radiusX(),
      n = this.radiusY();
    t.beginPath(),
      t.save(),
      e !== n && t.scale(1, n / e),
      t.arc(0, 0, e, 0, 2 * Math.PI, !1),
      t.restore(),
      t.closePath(),
      t.fillStrokeShape(this);
  }
  getWidth() {
    return 2 * this.radiusX();
  }
  getHeight() {
    return 2 * this.radiusY();
  }
  setWidth(t) {
    this.radiusX(t / 2);
  }
  setHeight(t) {
    this.radiusY(t / 2);
  }
}
(ke.Ellipse = Pe),
  (Pe.prototype.className = "Ellipse"),
  (Pe.prototype._centroid = !0),
  (Pe.prototype._attrsAffectingSize = ["radiusX", "radiusY"]),
  (0, Ae._registerNode)(Pe),
  Ee.Factory.addComponentsGetterSetter(Pe, "radius", ["x", "y"]),
  Ee.Factory.addGetterSetter(Pe, "radiusX", 0, (0, Oe.getNumberValidator)()),
  Ee.Factory.addGetterSetter(Pe, "radiusY", 0, (0, Oe.getNumberValidator)());
var Te = {};
Object.defineProperty(Te, "__esModule", { value: !0 }), (Te.Image = void 0);
const De = f,
  Fe = g,
  Me = vt,
  Re = u,
  Le = v;
class Ie extends Me.Shape {
  constructor(t) {
    super(t),
      this.on("imageChange.konva", () => {
        this._setImageLoad();
      }),
      this._setImageLoad();
  }
  _setImageLoad() {
    const t = this.image();
    (t && t.complete) ||
      (t && 4 === t.readyState) ||
      (t &&
        t.addEventListener &&
        t.addEventListener("load", () => {
          this._requestDraw();
        }));
  }
  _useBufferCanvas() {
    return super._useBufferCanvas(!0);
  }
  _sceneFunc(t) {
    const e = this.getWidth(),
      n = this.getHeight(),
      r = this.cornerRadius(),
      i = this.attrs.image;
    let a;
    if (i) {
      const t = this.attrs.cropWidth,
        r = this.attrs.cropHeight;
      a = t && r ? [i, this.cropX(), this.cropY(), t, r, 0, 0, e, n] : [i, 0, 0, e, n];
    }
    (this.hasFill() || this.hasStroke() || r) &&
      (t.beginPath(),
      r ? De.Util.drawRoundedRectPath(t, e, n, r) : t.rect(0, 0, e, n),
      t.closePath(),
      t.fillStrokeShape(this)),
      i && (r && t.clip(), t.drawImage.apply(t, a));
  }
  _hitFunc(t) {
    var e = this.width(),
      n = this.height(),
      r = this.cornerRadius();
    t.beginPath(),
      r ? De.Util.drawRoundedRectPath(t, e, n, r) : t.rect(0, 0, e, n),
      t.closePath(),
      t.fillStrokeShape(this);
  }
  getWidth() {
    var t, e;
    return null !== (t = this.attrs.width) && void 0 !== t
      ? t
      : null === (e = this.image()) || void 0 === e
      ? void 0
      : e.width;
  }
  getHeight() {
    var t, e;
    return null !== (t = this.attrs.height) && void 0 !== t
      ? t
      : null === (e = this.image()) || void 0 === e
      ? void 0
      : e.height;
  }
  static fromURL(t, e, n = null) {
    var r = De.Util.createImageElement();
    (r.onload = function () {
      var t = new Ie({ image: r });
      e(t);
    }),
      (r.onerror = n),
      (r.crossOrigin = "Anonymous"),
      (r.src = t);
  }
}
(Te.Image = Ie),
  (Ie.prototype.className = "Image"),
  (0, Re._registerNode)(Ie),
  Fe.Factory.addGetterSetter(Ie, "cornerRadius", 0, (0, Le.getNumberOrArrayOfNumbersValidator)(4)),
  Fe.Factory.addGetterSetter(Ie, "image"),
  Fe.Factory.addComponentsGetterSetter(Ie, "crop", ["x", "y", "width", "height"]),
  Fe.Factory.addGetterSetter(Ie, "cropX", 0, (0, Le.getNumberValidator)()),
  Fe.Factory.addGetterSetter(Ie, "cropY", 0, (0, Le.getNumberValidator)()),
  Fe.Factory.addGetterSetter(Ie, "cropWidth", 0, (0, Le.getNumberValidator)()),
  Fe.Factory.addGetterSetter(Ie, "cropHeight", 0, (0, Le.getNumberValidator)());
var Ge = {};
Object.defineProperty(Ge, "__esModule", { value: !0 }), (Ge.Tag = Ge.Label = void 0);
const $e = g,
  Ve = vt,
  Ue = Ft,
  je = v,
  Be = u;
var He = [
    "fontFamily",
    "fontSize",
    "fontStyle",
    "padding",
    "lineHeight",
    "text",
    "width",
    "height",
    "pointerDirection",
    "pointerWidth",
    "pointerHeight",
  ],
  We = "up",
  ze = "right",
  Ke = "down",
  Ye = "left",
  qe = He.length;
class Xe extends Ue.Group {
  constructor(t) {
    super(t),
      this.on("add.konva", function (t) {
        this._addListeners(t.child), this._sync();
      });
  }
  getText() {
    return this.find("Text")[0];
  }
  getTag() {
    return this.find("Tag")[0];
  }
  _addListeners(t) {
    var e,
      n = this,
      r = function () {
        n._sync();
      };
    for (e = 0; e < qe; e++) t.on(He[e] + "Change.konva", r);
  }
  getWidth() {
    return this.getText().width();
  }
  getHeight() {
    return this.getText().height();
  }
  _sync() {
    var t,
      e,
      n,
      r,
      i,
      a,
      o,
      s = this.getText(),
      c = this.getTag();
    if (s && c) {
      switch (
        ((t = s.width()),
        (e = s.height()),
        (n = c.pointerDirection()),
        (r = c.pointerWidth()),
        (o = c.pointerHeight()),
        (i = 0),
        (a = 0),
        n)
      ) {
        case We:
          (i = t / 2), (a = -1 * o);
          break;
        case ze:
          (i = t + r), (a = e / 2);
          break;
        case Ke:
          (i = t / 2), (a = e + o);
          break;
        case Ye:
          (i = -1 * r), (a = e / 2);
      }
      c.setAttrs({ x: -1 * i, y: -1 * a, width: t, height: e }), s.setAttrs({ x: -1 * i, y: -1 * a });
    }
  }
}
(Ge.Label = Xe), (Xe.prototype.className = "Label"), (0, Be._registerNode)(Xe);
class Je extends Ve.Shape {
  _sceneFunc(t) {
    var e = this.width(),
      n = this.height(),
      r = this.pointerDirection(),
      i = this.pointerWidth(),
      a = this.pointerHeight(),
      o = this.cornerRadius();
    let s = 0,
      c = 0,
      l = 0,
      h = 0;
    "number" == typeof o
      ? (s = c = l = h = Math.min(o, e / 2, n / 2))
      : ((s = Math.min(o[0] || 0, e / 2, n / 2)),
        (c = Math.min(o[1] || 0, e / 2, n / 2)),
        (h = Math.min(o[2] || 0, e / 2, n / 2)),
        (l = Math.min(o[3] || 0, e / 2, n / 2))),
      t.beginPath(),
      t.moveTo(s, 0),
      r === We && (t.lineTo((e - i) / 2, 0), t.lineTo(e / 2, -1 * a), t.lineTo((e + i) / 2, 0)),
      t.lineTo(e - c, 0),
      t.arc(e - c, c, c, (3 * Math.PI) / 2, 0, !1),
      r === ze && (t.lineTo(e, (n - a) / 2), t.lineTo(e + i, n / 2), t.lineTo(e, (n + a) / 2)),
      t.lineTo(e, n - h),
      t.arc(e - h, n - h, h, 0, Math.PI / 2, !1),
      r === Ke && (t.lineTo((e + i) / 2, n), t.lineTo(e / 2, n + a), t.lineTo((e - i) / 2, n)),
      t.lineTo(l, n),
      t.arc(l, n - l, l, Math.PI / 2, Math.PI, !1),
      r === Ye && (t.lineTo(0, (n + a) / 2), t.lineTo(-1 * i, n / 2), t.lineTo(0, (n - a) / 2)),
      t.lineTo(0, s),
      t.arc(s, s, s, Math.PI, (3 * Math.PI) / 2, !1),
      t.closePath(),
      t.fillStrokeShape(this);
  }
  getSelfRect() {
    var t = 0,
      e = 0,
      n = this.pointerWidth(),
      r = this.pointerHeight(),
      i = this.pointerDirection(),
      a = this.width(),
      o = this.height();
    return (
      i === We
        ? ((e -= r), (o += r))
        : i === Ke
        ? (o += r)
        : i === Ye
        ? ((t -= 1.5 * n), (a += n))
        : i === ze && (a += 1.5 * n),
      { x: t, y: e, width: a, height: o }
    );
  }
}
(Ge.Tag = Je),
  (Je.prototype.className = "Tag"),
  (0, Be._registerNode)(Je),
  $e.Factory.addGetterSetter(Je, "pointerDirection", "none"),
  $e.Factory.addGetterSetter(Je, "pointerWidth", 0, (0, je.getNumberValidator)()),
  $e.Factory.addGetterSetter(Je, "pointerHeight", 0, (0, je.getNumberValidator)()),
  $e.Factory.addGetterSetter(Je, "cornerRadius", 0, (0, je.getNumberOrArrayOfNumbersValidator)(4));
var Qe = {};
Object.defineProperty(Qe, "__esModule", { value: !0 }), (Qe.Rect = void 0);
const Ze = g,
  tn = vt,
  en = u,
  nn = f,
  rn = v;
class an extends tn.Shape {
  _sceneFunc(t) {
    var e = this.cornerRadius(),
      n = this.width(),
      r = this.height();
    t.beginPath(),
      e ? nn.Util.drawRoundedRectPath(t, n, r, e) : t.rect(0, 0, n, r),
      t.closePath(),
      t.fillStrokeShape(this);
  }
}
(Qe.Rect = an),
  (an.prototype.className = "Rect"),
  (0, en._registerNode)(an),
  Ze.Factory.addGetterSetter(an, "cornerRadius", 0, (0, rn.getNumberOrArrayOfNumbersValidator)(4));
var on = {};
Object.defineProperty(on, "__esModule", { value: !0 }), (on.RegularPolygon = void 0);
const sn = g,
  cn = vt,
  ln = v,
  hn = u;
class dn extends cn.Shape {
  _sceneFunc(t) {
    const e = this._getPoints();
    t.beginPath(), t.moveTo(e[0].x, e[0].y);
    for (var n = 1; n < e.length; n++) t.lineTo(e[n].x, e[n].y);
    t.closePath(), t.fillStrokeShape(this);
  }
  _getPoints() {
    const t = this.attrs.sides,
      e = this.attrs.radius || 0,
      n = [];
    for (var r = 0; r < t; r++)
      n.push({ x: e * Math.sin((2 * r * Math.PI) / t), y: -1 * e * Math.cos((2 * r * Math.PI) / t) });
    return n;
  }
  getSelfRect() {
    const t = this._getPoints();
    var e = t[0].x,
      n = t[0].y,
      r = t[0].x,
      i = t[0].y;
    return (
      t.forEach((t) => {
        (e = Math.min(e, t.x)), (n = Math.max(n, t.x)), (r = Math.min(r, t.y)), (i = Math.max(i, t.y));
      }),
      { x: e, y: r, width: n - e, height: i - r }
    );
  }
  getWidth() {
    return 2 * this.radius();
  }
  getHeight() {
    return 2 * this.radius();
  }
  setWidth(t) {
    this.radius(t / 2);
  }
  setHeight(t) {
    this.radius(t / 2);
  }
}
(on.RegularPolygon = dn),
  (dn.prototype.className = "RegularPolygon"),
  (dn.prototype._centroid = !0),
  (dn.prototype._attrsAffectingSize = ["radius"]),
  (0, hn._registerNode)(dn),
  sn.Factory.addGetterSetter(dn, "radius", 0, (0, ln.getNumberValidator)()),
  sn.Factory.addGetterSetter(dn, "sides", 0, (0, ln.getNumberValidator)());
var un = {};
Object.defineProperty(un, "__esModule", { value: !0 }), (un.Ring = void 0);
const fn = g,
  pn = vt,
  gn = v,
  vn = u;
var mn = 2 * Math.PI;
class yn extends pn.Shape {
  _sceneFunc(t) {
    t.beginPath(),
      t.arc(0, 0, this.innerRadius(), 0, mn, !1),
      t.moveTo(this.outerRadius(), 0),
      t.arc(0, 0, this.outerRadius(), mn, 0, !0),
      t.closePath(),
      t.fillStrokeShape(this);
  }
  getWidth() {
    return 2 * this.outerRadius();
  }
  getHeight() {
    return 2 * this.outerRadius();
  }
  setWidth(t) {
    this.outerRadius(t / 2);
  }
  setHeight(t) {
    this.outerRadius(t / 2);
  }
}
(un.Ring = yn),
  (yn.prototype.className = "Ring"),
  (yn.prototype._centroid = !0),
  (yn.prototype._attrsAffectingSize = ["innerRadius", "outerRadius"]),
  (0, vn._registerNode)(yn),
  fn.Factory.addGetterSetter(yn, "innerRadius", 0, (0, gn.getNumberValidator)()),
  fn.Factory.addGetterSetter(yn, "outerRadius", 0, (0, gn.getNumberValidator)());
var _n = {};
Object.defineProperty(_n, "__esModule", { value: !0 }), (_n.Sprite = void 0);
const bn = g,
  Sn = vt,
  wn = Gt,
  xn = v,
  Cn = u;
class kn extends Sn.Shape {
  constructor(t) {
    super(t),
      (this._updated = !0),
      (this.anim = new wn.Animation(() => {
        var t = this._updated;
        return (this._updated = !1), t;
      })),
      this.on("animationChange.konva", function () {
        this.frameIndex(0);
      }),
      this.on("frameIndexChange.konva", function () {
        this._updated = !0;
      }),
      this.on("frameRateChange.konva", function () {
        this.anim.isRunning() && (clearInterval(this.interval), this._setInterval());
      });
  }
  _sceneFunc(t) {
    var e = this.animation(),
      n = this.frameIndex(),
      r = 4 * n,
      i = this.animations()[e],
      a = this.frameOffsets(),
      o = i[r + 0],
      s = i[r + 1],
      c = i[r + 2],
      l = i[r + 3],
      h = this.image();
    if (
      ((this.hasFill() || this.hasStroke()) &&
        (t.beginPath(), t.rect(0, 0, c, l), t.closePath(), t.fillStrokeShape(this)),
      h)
    )
      if (a) {
        var d = a[e],
          u = 2 * n;
        t.drawImage(h, o, s, c, l, d[u + 0], d[u + 1], c, l);
      } else t.drawImage(h, o, s, c, l, 0, 0, c, l);
  }
  _hitFunc(t) {
    var e = this.animation(),
      n = this.frameIndex(),
      r = 4 * n,
      i = this.animations()[e],
      a = this.frameOffsets(),
      o = i[r + 2],
      s = i[r + 3];
    if ((t.beginPath(), a)) {
      var c = a[e],
        l = 2 * n;
      t.rect(c[l + 0], c[l + 1], o, s);
    } else t.rect(0, 0, o, s);
    t.closePath(), t.fillShape(this);
  }
  _useBufferCanvas() {
    return super._useBufferCanvas(!0);
  }
  _setInterval() {
    var t = this;
    this.interval = setInterval(function () {
      t._updateIndex();
    }, 1e3 / this.frameRate());
  }
  start() {
    if (!this.isRunning()) {
      var t = this.getLayer();
      this.anim.setLayers(t), this._setInterval(), this.anim.start();
    }
  }
  stop() {
    this.anim.stop(), clearInterval(this.interval);
  }
  isRunning() {
    return this.anim.isRunning();
  }
  _updateIndex() {
    var t = this.frameIndex(),
      e = this.animation();
    t < this.animations()[e].length / 4 - 1 ? this.frameIndex(t + 1) : this.frameIndex(0);
  }
}
(_n.Sprite = kn),
  (kn.prototype.className = "Sprite"),
  (0, Cn._registerNode)(kn),
  bn.Factory.addGetterSetter(kn, "animation"),
  bn.Factory.addGetterSetter(kn, "animations"),
  bn.Factory.addGetterSetter(kn, "frameOffsets"),
  bn.Factory.addGetterSetter(kn, "image"),
  bn.Factory.addGetterSetter(kn, "frameIndex", 0, (0, xn.getNumberValidator)()),
  bn.Factory.addGetterSetter(kn, "frameRate", 17, (0, xn.getNumberValidator)()),
  bn.Factory.backCompat(kn, { index: "frameIndex", getIndex: "getFrameIndex", setIndex: "setFrameIndex" });
var En = {};
Object.defineProperty(En, "__esModule", { value: !0 }), (En.Star = void 0);
const Nn = g,
  On = vt,
  An = v,
  Pn = u;
class Tn extends On.Shape {
  _sceneFunc(t) {
    var e = this.innerRadius(),
      n = this.outerRadius(),
      r = this.numPoints();
    t.beginPath(), t.moveTo(0, 0 - n);
    for (var i = 1; i < 2 * r; i++) {
      var a = i % 2 == 0 ? n : e,
        o = a * Math.sin((i * Math.PI) / r),
        s = -1 * a * Math.cos((i * Math.PI) / r);
      t.lineTo(o, s);
    }
    t.closePath(), t.fillStrokeShape(this);
  }
  getWidth() {
    return 2 * this.outerRadius();
  }
  getHeight() {
    return 2 * this.outerRadius();
  }
  setWidth(t) {
    this.outerRadius(t / 2);
  }
  setHeight(t) {
    this.outerRadius(t / 2);
  }
}
(En.Star = Tn),
  (Tn.prototype.className = "Star"),
  (Tn.prototype._centroid = !0),
  (Tn.prototype._attrsAffectingSize = ["innerRadius", "outerRadius"]),
  (0, Pn._registerNode)(Tn),
  Nn.Factory.addGetterSetter(Tn, "numPoints", 5, (0, An.getNumberValidator)()),
  Nn.Factory.addGetterSetter(Tn, "innerRadius", 0, (0, An.getNumberValidator)()),
  Nn.Factory.addGetterSetter(Tn, "outerRadius", 0, (0, An.getNumberValidator)());
var Dn = {};
Object.defineProperty(Dn, "__esModule", { value: !0 }), (Dn.Text = Dn.stringToArray = void 0);
const Fn = f,
  Mn = g,
  Rn = vt,
  Ln = v,
  In = u;
function Gn(t) {
  return Array.from(t);
}
Dn.stringToArray = Gn;
var $n,
  Vn = "auto",
  Un = "justify",
  jn = "left",
  Bn = "middle",
  Hn = "normal",
  Wn = " ",
  zn = "none",
  Kn = [
    "fontFamily",
    "fontSize",
    "fontStyle",
    "fontVariant",
    "padding",
    "align",
    "verticalAlign",
    "lineHeight",
    "text",
    "width",
    "height",
    "wrap",
    "ellipsis",
    "letterSpacing",
  ],
  Yn = Kn.length;
function qn() {
  return $n || ($n = Fn.Util.createCanvasElement().getContext("2d"));
}
class Xn extends Rn.Shape {
  constructor(t) {
    super(
      (function (t) {
        return (
          (t = t || {}).fillLinearGradientColorStops ||
            t.fillRadialGradientColorStops ||
            t.fillPatternImage ||
            (t.fill = t.fill || "black"),
          t
        );
      })(t)
    ),
      (this._partialTextX = 0),
      (this._partialTextY = 0);
    for (var e = 0; e < Yn; e++) this.on(Kn[e] + "Change.konva", this._setTextData);
    this._setTextData();
  }
  _sceneFunc(t) {
    var e = this.textArr,
      n = e.length;
    if (this.text()) {
      var r,
        i = this.padding(),
        a = this.fontSize(),
        o = this.lineHeight() * a,
        s = this.verticalAlign(),
        c = 0,
        l = this.align(),
        h = this.getWidth(),
        d = this.letterSpacing(),
        u = this.fill(),
        f = this.textDecoration(),
        p = -1 !== f.indexOf("underline"),
        g = -1 !== f.indexOf("line-through"),
        v = 0,
        m = ((v = o / 2), 0),
        y = 0;
      for (
        t.setAttr("font", this._getContextFont()),
          t.setAttr("textBaseline", Bn),
          t.setAttr("textAlign", jn),
          s === Bn
            ? (c = (this.getHeight() - n * o - 2 * i) / 2)
            : "bottom" === s && (c = this.getHeight() - n * o - 2 * i),
          t.translate(i, c + i),
          r = 0;
        r < n;
        r++
      ) {
        (m = 0), (y = 0);
        var _,
          b,
          S,
          w = e[r],
          x = w.text,
          C = w.width,
          k = w.lastInParagraph;
        if ((t.save(), "right" === l ? (m += h - C - 2 * i) : "center" === l && (m += (h - C - 2 * i) / 2), p)) {
          t.save(),
            t.beginPath(),
            t.moveTo(m, v + y + Math.round(a / 2)),
            (b = 0 === (_ = x.split(" ").length - 1)),
            (S = l !== Un || k ? C : h - 2 * i),
            t.lineTo(m + Math.round(S), v + y + Math.round(a / 2)),
            (t.lineWidth = a / 15);
          const e = this._getLinearGradient();
          (t.strokeStyle = e || u), t.stroke(), t.restore();
        }
        if (g) {
          t.save(),
            t.beginPath(),
            t.moveTo(m, v + y),
            (b = 0 === (_ = x.split(" ").length - 1)),
            (S = l === Un && k && !b ? h - 2 * i : C),
            t.lineTo(m + Math.round(S), v + y),
            (t.lineWidth = a / 15);
          const e = this._getLinearGradient();
          (t.strokeStyle = e || u), t.stroke(), t.restore();
        }
        if (0 !== d || l === Un) {
          _ = x.split(" ").length - 1;
          for (var E = Gn(x), N = 0; N < E.length; N++) {
            var O = E[N];
            " " !== O || k || l !== Un || (m += (h - 2 * i - C) / _),
              (this._partialTextX = m),
              (this._partialTextY = v + y),
              (this._partialText = O),
              t.fillStrokeShape(this),
              (m += this.measureSize(O).width + d);
          }
        } else (this._partialTextX = m), (this._partialTextY = v + y), (this._partialText = x), t.fillStrokeShape(this);
        t.restore(), n > 1 && (v += o);
      }
    }
  }
  _hitFunc(t) {
    var e = this.getWidth(),
      n = this.getHeight();
    t.beginPath(), t.rect(0, 0, e, n), t.closePath(), t.fillStrokeShape(this);
  }
  setText(t) {
    var e = Fn.Util._isString(t) ? t : null == t ? "" : t + "";
    return this._setAttr("text", e), this;
  }
  getWidth() {
    return this.attrs.width === Vn || void 0 === this.attrs.width
      ? this.getTextWidth() + 2 * this.padding()
      : this.attrs.width;
  }
  getHeight() {
    return this.attrs.height === Vn || void 0 === this.attrs.height
      ? this.fontSize() * this.textArr.length * this.lineHeight() + 2 * this.padding()
      : this.attrs.height;
  }
  getTextWidth() {
    return this.textWidth;
  }
  getTextHeight() {
    return (
      Fn.Util.warn(
        "text.getTextHeight() method is deprecated. Use text.height() - for full height and text.fontSize() - for one line height."
      ),
      this.textHeight
    );
  }
  measureSize(t) {
    var e,
      n = qn(),
      r = this.fontSize();
    return (
      n.save(), (n.font = this._getContextFont()), (e = n.measureText(t)), n.restore(), { width: e.width, height: r }
    );
  }
  _getContextFont() {
    return (
      this.fontStyle() +
      Wn +
      this.fontVariant() +
      Wn +
      (this.fontSize() + "px ") +
      this.fontFamily()
        .split(",")
        .map((t) => {
          const e = (t = t.trim()).indexOf(" ") >= 0,
            n = t.indexOf('"') >= 0 || t.indexOf("'") >= 0;
          return e && !n && (t = `"${t}"`), t;
        })
        .join(", ")
    );
  }
  _addTextLine(t) {
    this.align() === Un && (t = t.trim());
    var e = this._getTextWidth(t);
    return this.textArr.push({ text: t, width: e, lastInParagraph: !1 });
  }
  _getTextWidth(t) {
    var e = this.letterSpacing(),
      n = t.length;
    return qn().measureText(t).width + (n ? e * (n - 1) : 0);
  }
  _setTextData() {
    var t = this.text().split("\n"),
      e = +this.fontSize(),
      n = 0,
      r = this.lineHeight() * e,
      i = this.attrs.width,
      a = this.attrs.height,
      o = i !== Vn && void 0 !== i,
      s = a !== Vn && void 0 !== a,
      c = this.padding(),
      l = i - 2 * c,
      h = a - 2 * c,
      d = 0,
      u = this.wrap(),
      f = "char" !== u && u !== zn,
      p = this.ellipsis();
    (this.textArr = []), (qn().font = this._getContextFont());
    for (var g = p ? this._getTextWidth("…") : 0, v = 0, m = t.length; v < m; ++v) {
      var y = t[v],
        _ = this._getTextWidth(y);
      if (o && _ > l)
        for (; y.length > 0; ) {
          for (var b = 0, S = y.length, w = "", x = 0; b < S; ) {
            var C = (b + S) >>> 1,
              k = y.slice(0, C + 1),
              E = this._getTextWidth(k) + g;
            E <= l ? ((b = C + 1), (w = k), (x = E)) : (S = C);
          }
          if (!w) break;
          if (f) {
            var N,
              O = y[w.length];
            (N = (O === Wn || "-" === O) && x <= l ? w.length : Math.max(w.lastIndexOf(Wn), w.lastIndexOf("-")) + 1) >
              0 && ((b = N), (w = w.slice(0, b)), (x = this._getTextWidth(w)));
          }
          if (
            ((w = w.trimRight()), this._addTextLine(w), (n = Math.max(n, x)), (d += r), this._shouldHandleEllipsis(d))
          ) {
            this._tryToAddEllipsisToLastLine();
            break;
          }
          if ((y = (y = y.slice(b)).trimLeft()).length > 0 && (_ = this._getTextWidth(y)) <= l) {
            this._addTextLine(y), (d += r), (n = Math.max(n, _));
            break;
          }
        }
      else
        this._addTextLine(y),
          (d += r),
          (n = Math.max(n, _)),
          this._shouldHandleEllipsis(d) && v < m - 1 && this._tryToAddEllipsisToLastLine();
      if (
        (this.textArr[this.textArr.length - 1] && (this.textArr[this.textArr.length - 1].lastInParagraph = !0),
        s && d + r > h)
      )
        break;
    }
    (this.textHeight = e), (this.textWidth = n);
  }
  _shouldHandleEllipsis(t) {
    var e = +this.fontSize(),
      n = this.lineHeight() * e,
      r = this.attrs.height,
      i = r !== Vn && void 0 !== r,
      a = r - 2 * this.padding();
    return !(this.wrap() !== zn) || (i && t + n > a);
  }
  _tryToAddEllipsisToLastLine() {
    var t = this.attrs.width,
      e = t !== Vn && void 0 !== t,
      n = t - 2 * this.padding(),
      r = this.ellipsis(),
      i = this.textArr[this.textArr.length - 1];
    if (i && r) {
      if (e) this._getTextWidth(i.text + "…") < n || (i.text = i.text.slice(0, i.text.length - 3));
      this.textArr.splice(this.textArr.length - 1, 1), this._addTextLine(i.text + "…");
    }
  }
  getStrokeScaleEnabled() {
    return !0;
  }
  _useBufferCanvas() {
    const t = -1 !== this.textDecoration().indexOf("underline") || -1 !== this.textDecoration().indexOf("line-through"),
      e = this.hasShadow();
    return !(!t || !e) || super._useBufferCanvas();
  }
}
(Dn.Text = Xn),
  (Xn.prototype._fillFunc = function (t) {
    t.fillText(this._partialText, this._partialTextX, this._partialTextY);
  }),
  (Xn.prototype._strokeFunc = function (t) {
    t.setAttr("miterLimit", 2), t.strokeText(this._partialText, this._partialTextX, this._partialTextY);
  }),
  (Xn.prototype.className = "Text"),
  (Xn.prototype._attrsAffectingSize = ["text", "fontSize", "padding", "wrap", "lineHeight", "letterSpacing"]),
  (0, In._registerNode)(Xn),
  Mn.Factory.overWriteSetter(Xn, "width", (0, Ln.getNumberOrAutoValidator)()),
  Mn.Factory.overWriteSetter(Xn, "height", (0, Ln.getNumberOrAutoValidator)()),
  Mn.Factory.addGetterSetter(Xn, "fontFamily", "Arial"),
  Mn.Factory.addGetterSetter(Xn, "fontSize", 12, (0, Ln.getNumberValidator)()),
  Mn.Factory.addGetterSetter(Xn, "fontStyle", Hn),
  Mn.Factory.addGetterSetter(Xn, "fontVariant", Hn),
  Mn.Factory.addGetterSetter(Xn, "padding", 0, (0, Ln.getNumberValidator)()),
  Mn.Factory.addGetterSetter(Xn, "align", jn),
  Mn.Factory.addGetterSetter(Xn, "verticalAlign", "top"),
  Mn.Factory.addGetterSetter(Xn, "lineHeight", 1, (0, Ln.getNumberValidator)()),
  Mn.Factory.addGetterSetter(Xn, "wrap", "word"),
  Mn.Factory.addGetterSetter(Xn, "ellipsis", !1, (0, Ln.getBooleanValidator)()),
  Mn.Factory.addGetterSetter(Xn, "letterSpacing", 0, (0, Ln.getNumberValidator)()),
  Mn.Factory.addGetterSetter(Xn, "text", "", (0, Ln.getStringValidator)()),
  Mn.Factory.addGetterSetter(Xn, "textDecoration", "");
var Jn = {};
Object.defineProperty(Jn, "__esModule", { value: !0 }), (Jn.TextPath = void 0);
const Qn = f,
  Zn = g,
  tr = vt,
  er = oe,
  nr = Dn,
  rr = v,
  ir = u;
var ar = "normal";
function or(t) {
  t.fillText(this.partialText, 0, 0);
}
function sr(t) {
  t.strokeText(this.partialText, 0, 0);
}
class cr extends tr.Shape {
  constructor(t) {
    super(t),
      (this.dummyCanvas = Qn.Util.createCanvasElement()),
      (this.dataArray = []),
      this._readDataAttribute(),
      this.on("dataChange.konva", function () {
        this._readDataAttribute(), this._setTextData();
      }),
      this.on(
        "textChange.konva alignChange.konva letterSpacingChange.konva kerningFuncChange.konva fontSizeChange.konva fontFamilyChange.konva",
        this._setTextData
      ),
      this._setTextData();
  }
  _getTextPathLength() {
    return er.Path.getPathLength(this.dataArray);
  }
  _getPointAtLength(t) {
    if (!this.attrs.data) return null;
    return t - 1 > this.pathLength ? null : er.Path.getPointAtLengthOfDataArray(t, this.dataArray);
  }
  _readDataAttribute() {
    (this.dataArray = er.Path.parsePathData(this.attrs.data)), (this.pathLength = this._getTextPathLength());
  }
  _sceneFunc(t) {
    t.setAttr("font", this._getContextFont()),
      t.setAttr("textBaseline", this.textBaseline()),
      t.setAttr("textAlign", "left"),
      t.save();
    var e = this.textDecoration(),
      n = this.fill(),
      r = this.fontSize(),
      i = this.glyphInfo;
    "underline" === e && t.beginPath();
    for (var a = 0; a < i.length; a++) {
      t.save();
      var o = i[a].p0;
      t.translate(o.x, o.y),
        t.rotate(i[a].rotation),
        (this.partialText = i[a].text),
        t.fillStrokeShape(this),
        "underline" === e && (0 === a && t.moveTo(0, r / 2 + 1), t.lineTo(r, r / 2 + 1)),
        t.restore();
    }
    "underline" === e && ((t.strokeStyle = n), (t.lineWidth = r / 20), t.stroke()), t.restore();
  }
  _hitFunc(t) {
    t.beginPath();
    var e = this.glyphInfo;
    if (e.length >= 1) {
      var n = e[0].p0;
      t.moveTo(n.x, n.y);
    }
    for (var r = 0; r < e.length; r++) {
      var i = e[r].p1;
      t.lineTo(i.x, i.y);
    }
    t.setAttr("lineWidth", this.fontSize()), t.setAttr("strokeStyle", this.colorKey), t.stroke();
  }
  getTextWidth() {
    return this.textWidth;
  }
  getTextHeight() {
    return (
      Qn.Util.warn(
        "text.getTextHeight() method is deprecated. Use text.height() - for full height and text.fontSize() - for one line height."
      ),
      this.textHeight
    );
  }
  setText(t) {
    return nr.Text.prototype.setText.call(this, t);
  }
  _getContextFont() {
    return nr.Text.prototype._getContextFont.call(this);
  }
  _getTextSize(t) {
    var e = this.dummyCanvas.getContext("2d");
    e.save(), (e.font = this._getContextFont());
    var n = e.measureText(t);
    return e.restore(), { width: n.width, height: parseInt(`${this.fontSize()}`, 10) };
  }
  _setTextData() {
    const { width: t, height: e } = this._getTextSize(this.attrs.text);
    if (((this.textWidth = t), (this.textHeight = e), (this.glyphInfo = []), !this.attrs.data)) return null;
    const n = this.letterSpacing(),
      r = this.align(),
      i = this.kerningFunc(),
      a = Math.max(this.textWidth + ((this.attrs.text || "").length - 1) * n, 0);
    let o = 0;
    "center" === r && (o = Math.max(0, this.pathLength / 2 - a / 2)),
      "right" === r && (o = Math.max(0, this.pathLength - a));
    const s = (0, nr.stringToArray)(this.text());
    let c = o;
    for (var l = 0; l < s.length; l++) {
      const t = this._getPointAtLength(c);
      if (!t) return;
      let e = this._getTextSize(s[l]).width + n;
      if (" " === s[l] && "justify" === r) {
        const t = this.text().split(" ").length - 1;
        e += (this.pathLength - a) / t;
      }
      const o = this._getPointAtLength(c + e);
      if (!o) return;
      const h = er.Path.getLineLength(t.x, t.y, o.x, o.y);
      let d = 0;
      if (i)
        try {
          d = i(s[l - 1], s[l]) * this.fontSize();
        } catch (t) {
          d = 0;
        }
      (t.x += d), (o.x += d), (this.textWidth += d);
      const u = er.Path.getPointOnLine(d + h / 2, t.x, t.y, o.x, o.y),
        f = Math.atan2(o.y - t.y, o.x - t.x);
      this.glyphInfo.push({ transposeX: u.x, transposeY: u.y, text: s[l], rotation: f, p0: t, p1: o }), (c += e);
    }
  }
  getSelfRect() {
    if (!this.glyphInfo.length) return { x: 0, y: 0, width: 0, height: 0 };
    var t = [];
    this.glyphInfo.forEach(function (e) {
      t.push(e.p0.x), t.push(e.p0.y), t.push(e.p1.x), t.push(e.p1.y);
    });
    for (var e, n, r = t[0] || 0, i = t[0] || 0, a = t[1] || 0, o = t[1] || 0, s = 0; s < t.length / 2; s++)
      (e = t[2 * s]),
        (n = t[2 * s + 1]),
        (r = Math.min(r, e)),
        (i = Math.max(i, e)),
        (a = Math.min(a, n)),
        (o = Math.max(o, n));
    var c = this.fontSize();
    return { x: r - c / 2, y: a - c / 2, width: i - r + c, height: o - a + c };
  }
  destroy() {
    return Qn.Util.releaseCanvas(this.dummyCanvas), super.destroy();
  }
}
(Jn.TextPath = cr),
  (cr.prototype._fillFunc = or),
  (cr.prototype._strokeFunc = sr),
  (cr.prototype._fillFuncHit = or),
  (cr.prototype._strokeFuncHit = sr),
  (cr.prototype.className = "TextPath"),
  (cr.prototype._attrsAffectingSize = ["text", "fontSize", "data"]),
  (0, ir._registerNode)(cr),
  Zn.Factory.addGetterSetter(cr, "data"),
  Zn.Factory.addGetterSetter(cr, "fontFamily", "Arial"),
  Zn.Factory.addGetterSetter(cr, "fontSize", 12, (0, rr.getNumberValidator)()),
  Zn.Factory.addGetterSetter(cr, "fontStyle", ar),
  Zn.Factory.addGetterSetter(cr, "align", "left"),
  Zn.Factory.addGetterSetter(cr, "letterSpacing", 0, (0, rr.getNumberValidator)()),
  Zn.Factory.addGetterSetter(cr, "textBaseline", "middle"),
  Zn.Factory.addGetterSetter(cr, "fontVariant", ar),
  Zn.Factory.addGetterSetter(cr, "text", ""),
  Zn.Factory.addGetterSetter(cr, "textDecoration", null),
  Zn.Factory.addGetterSetter(cr, "kerningFunc", null);
var lr = {};
Object.defineProperty(lr, "__esModule", { value: !0 }), (lr.Transformer = void 0);
const hr = f,
  dr = g,
  ur = p,
  fr = vt,
  pr = Qe,
  gr = Ft,
  vr = u,
  mr = v,
  yr = u;
var _r = "tr-konva",
  br = [
    "resizeEnabledChange",
    "rotateAnchorOffsetChange",
    "rotateEnabledChange",
    "enabledAnchorsChange",
    "anchorSizeChange",
    "borderEnabledChange",
    "borderStrokeChange",
    "borderStrokeWidthChange",
    "borderDashChange",
    "anchorStrokeChange",
    "anchorStrokeWidthChange",
    "anchorFillChange",
    "anchorCornerRadiusChange",
    "ignoreStrokeChange",
    "anchorStyleFuncChange",
  ]
    .map((t) => t + `.${_r}`)
    .join(" "),
  Sr = "nodesRect",
  wr = [
    "widthChange",
    "heightChange",
    "scaleXChange",
    "scaleYChange",
    "skewXChange",
    "skewYChange",
    "rotationChange",
    "offsetXChange",
    "offsetYChange",
    "transformsEnabledChange",
    "strokeWidthChange",
  ],
  xr = {
    "top-left": -45,
    "top-center": 0,
    "top-right": 45,
    "middle-right": -90,
    "middle-left": 90,
    "bottom-left": -135,
    "bottom-center": 180,
    "bottom-right": 135,
  };
const Cr = "ontouchstart" in vr.Konva._global;
var kr = [
  "top-left",
  "top-center",
  "top-right",
  "middle-right",
  "middle-left",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];
function Er(t, e, n) {
  const r = n.x + (t.x - n.x) * Math.cos(e) - (t.y - n.y) * Math.sin(e),
    i = n.y + (t.x - n.x) * Math.sin(e) + (t.y - n.y) * Math.cos(e);
  return { ...t, rotation: t.rotation + e, x: r, y: i };
}
function Nr(t, e) {
  const n = (function (t) {
    return {
      x: t.x + (t.width / 2) * Math.cos(t.rotation) + (t.height / 2) * Math.sin(-t.rotation),
      y: t.y + (t.height / 2) * Math.cos(t.rotation) + (t.width / 2) * Math.sin(t.rotation),
    };
  })(t);
  return Er(t, e, n);
}
class Or extends gr.Group {
  constructor(t) {
    super(t),
      (this._movingAnchorName = null),
      (this._transforming = !1),
      this._createElements(),
      (this._handleMouseMove = this._handleMouseMove.bind(this)),
      (this._handleMouseUp = this._handleMouseUp.bind(this)),
      (this.update = this.update.bind(this)),
      this.on(br, this.update),
      this.getNode() && this.update();
  }
  attachTo(t) {
    return this.setNode(t), this;
  }
  setNode(t) {
    return (
      hr.Util.warn(
        "tr.setNode(shape), tr.node(shape) and tr.attachTo(shape) methods are deprecated. Please use tr.nodes(nodesArray) instead."
      ),
      this.setNodes([t])
    );
  }
  getNode() {
    return this._nodes && this._nodes[0];
  }
  _getEventNamespace() {
    return _r + this._id;
  }
  setNodes(t = []) {
    this._nodes && this._nodes.length && this.detach();
    const e = t.filter(
      (t) =>
        !t.isAncestorOf(this) ||
        (hr.Util.error("Konva.Transformer cannot be an a child of the node you are trying to attach"), !1)
    );
    return (
      (this._nodes = t = e),
      1 === t.length && this.useSingleNodeRotation() ? this.rotation(t[0].getAbsoluteRotation()) : this.rotation(0),
      this._nodes.forEach((t) => {
        const e = () => {
            1 === this.nodes().length &&
              this.useSingleNodeRotation() &&
              this.rotation(this.nodes()[0].getAbsoluteRotation()),
              this._resetTransformCache(),
              this._transforming || this.isDragging() || this.update();
          },
          n = t._attrsAffectingSize.map((t) => t + "Change." + this._getEventNamespace()).join(" ");
        t.on(n, e),
          t.on(wr.map((t) => t + `.${this._getEventNamespace()}`).join(" "), e),
          t.on(`absoluteTransformChange.${this._getEventNamespace()}`, e),
          this._proxyDrag(t);
      }),
      this._resetTransformCache(),
      !!this.findOne(".top-left") && this.update(),
      this
    );
  }
  _proxyDrag(t) {
    let e;
    t.on(`dragstart.${this._getEventNamespace()}`, (n) => {
      (e = t.getAbsolutePosition()), this.isDragging() || t === this.findOne(".back") || this.startDrag(n, !1);
    }),
      t.on(`dragmove.${this._getEventNamespace()}`, (n) => {
        if (!e) return;
        const r = t.getAbsolutePosition(),
          i = r.x - e.x,
          a = r.y - e.y;
        this.nodes().forEach((e) => {
          if (e === t) return;
          if (e.isDragging()) return;
          const r = e.getAbsolutePosition();
          e.setAbsolutePosition({ x: r.x + i, y: r.y + a }), e.startDrag(n);
        }),
          (e = null);
      });
  }
  getNodes() {
    return this._nodes || [];
  }
  getActiveAnchor() {
    return this._movingAnchorName;
  }
  detach() {
    this._nodes &&
      this._nodes.forEach((t) => {
        t.off("." + this._getEventNamespace());
      }),
      (this._nodes = []),
      this._resetTransformCache();
  }
  _resetTransformCache() {
    this._clearCache(Sr), this._clearCache("transform"), this._clearSelfAndDescendantCache("absoluteTransform");
  }
  _getNodeRect() {
    return this._getCache(Sr, this.__getNodeRect);
  }
  __getNodeShape(t, e = this.rotation(), n) {
    var r = t.getClientRect({ skipTransform: !0, skipShadow: !0, skipStroke: this.ignoreStroke() }),
      i = t.getAbsoluteScale(n),
      a = t.getAbsolutePosition(n),
      o = r.x * i.x - t.offsetX() * i.x,
      s = r.y * i.y - t.offsetY() * i.y;
    const c = (vr.Konva.getAngle(t.getAbsoluteRotation()) + 2 * Math.PI) % (2 * Math.PI);
    return Er(
      {
        x: a.x + o * Math.cos(c) + s * Math.sin(-c),
        y: a.y + s * Math.cos(c) + o * Math.sin(c),
        width: r.width * i.x,
        height: r.height * i.y,
        rotation: c,
      },
      -vr.Konva.getAngle(e),
      { x: 0, y: 0 }
    );
  }
  __getNodeRect() {
    if (!this.getNode()) return { x: -1e8, y: -1e8, width: 0, height: 0, rotation: 0 };
    const t = [];
    this.nodes().map((e) => {
      const n = e.getClientRect({ skipTransform: !0, skipShadow: !0, skipStroke: this.ignoreStroke() });
      var r = [
          { x: n.x, y: n.y },
          { x: n.x + n.width, y: n.y },
          { x: n.x + n.width, y: n.y + n.height },
          { x: n.x, y: n.y + n.height },
        ],
        i = e.getAbsoluteTransform();
      r.forEach(function (e) {
        var n = i.point(e);
        t.push(n);
      });
    });
    const e = new hr.Transform();
    e.rotate(-vr.Konva.getAngle(this.rotation()));
    var n = 1 / 0,
      r = 1 / 0,
      i = -1 / 0,
      a = -1 / 0;
    t.forEach(function (t) {
      var o = e.point(t);
      void 0 === n && ((n = i = o.x), (r = a = o.y)),
        (n = Math.min(n, o.x)),
        (r = Math.min(r, o.y)),
        (i = Math.max(i, o.x)),
        (a = Math.max(a, o.y));
    }),
      e.invert();
    const o = e.point({ x: n, y: r });
    return { x: o.x, y: o.y, width: i - n, height: a - r, rotation: vr.Konva.getAngle(this.rotation()) };
  }
  getX() {
    return this._getNodeRect().x;
  }
  getY() {
    return this._getNodeRect().y;
  }
  getWidth() {
    return this._getNodeRect().width;
  }
  getHeight() {
    return this._getNodeRect().height;
  }
  _createElements() {
    this._createBack(),
      kr.forEach((t) => {
        this._createAnchor(t);
      }),
      this._createAnchor("rotater");
  }
  _createAnchor(t) {
    var e = new pr.Rect({
        stroke: "rgb(0, 161, 255)",
        fill: "white",
        strokeWidth: 1,
        name: t + " _anchor",
        dragDistance: 0,
        draggable: !0,
        hitStrokeWidth: Cr ? 10 : "auto",
      }),
      n = this;
    e.on("mousedown touchstart", function (t) {
      n._handleMouseDown(t);
    }),
      e.on("dragstart", (t) => {
        e.stopDrag(), (t.cancelBubble = !0);
      }),
      e.on("dragend", (t) => {
        t.cancelBubble = !0;
      }),
      e.on("mouseenter", () => {
        var n = vr.Konva.getAngle(this.rotation()),
          r = this.rotateAnchorCursor(),
          i = (function (t, e, n) {
            if ("rotater" === t) return n;
            e += hr.Util.degToRad(xr[t] || 0);
            var r = ((hr.Util.radToDeg(e) % 360) + 360) % 360;
            return hr.Util._inRange(r, 337.5, 360) || hr.Util._inRange(r, 0, 22.5)
              ? "ns-resize"
              : hr.Util._inRange(r, 22.5, 67.5)
              ? "nesw-resize"
              : hr.Util._inRange(r, 67.5, 112.5)
              ? "ew-resize"
              : hr.Util._inRange(r, 112.5, 157.5)
              ? "nwse-resize"
              : hr.Util._inRange(r, 157.5, 202.5)
              ? "ns-resize"
              : hr.Util._inRange(r, 202.5, 247.5)
              ? "nesw-resize"
              : hr.Util._inRange(r, 247.5, 292.5)
              ? "ew-resize"
              : hr.Util._inRange(r, 292.5, 337.5)
              ? "nwse-resize"
              : (hr.Util.error("Transformer has unknown angle for cursor detection: " + r), "pointer");
          })(t, n, r);
        e.getStage().content && (e.getStage().content.style.cursor = i), (this._cursorChange = !0);
      }),
      e.on("mouseout", () => {
        e.getStage().content && (e.getStage().content.style.cursor = ""), (this._cursorChange = !1);
      }),
      this.add(e);
  }
  _createBack() {
    var t = new fr.Shape({
      name: "back",
      width: 0,
      height: 0,
      draggable: !0,
      sceneFunc(t, e) {
        var n = e.getParent(),
          r = n.padding();
        t.beginPath(),
          t.rect(-r, -r, e.width() + 2 * r, e.height() + 2 * r),
          t.moveTo(e.width() / 2, -r),
          n.rotateEnabled() && t.lineTo(e.width() / 2, -n.rotateAnchorOffset() * hr.Util._sign(e.height()) - r),
          t.fillStrokeShape(e);
      },
      hitFunc: (t, e) => {
        if (this.shouldOverdrawWholeArea()) {
          var n = this.padding();
          t.beginPath(), t.rect(-n, -n, e.width() + 2 * n, e.height() + 2 * n), t.fillStrokeShape(e);
        }
      },
    });
    this.add(t),
      this._proxyDrag(t),
      t.on("dragstart", (t) => {
        t.cancelBubble = !0;
      }),
      t.on("dragmove", (t) => {
        t.cancelBubble = !0;
      }),
      t.on("dragend", (t) => {
        t.cancelBubble = !0;
      }),
      this.on("dragmove", (t) => {
        this.update();
      });
  }
  _handleMouseDown(t) {
    this._movingAnchorName = t.target.name().split(" ")[0];
    var e = this._getNodeRect(),
      n = e.width,
      r = e.height,
      i = Math.sqrt(Math.pow(n, 2) + Math.pow(r, 2));
    (this.sin = Math.abs(r / i)),
      (this.cos = Math.abs(n / i)),
      "undefined" != typeof window &&
        (window.addEventListener("mousemove", this._handleMouseMove),
        window.addEventListener("touchmove", this._handleMouseMove),
        window.addEventListener("mouseup", this._handleMouseUp, !0),
        window.addEventListener("touchend", this._handleMouseUp, !0)),
      (this._transforming = !0);
    var a = t.target.getAbsolutePosition(),
      o = t.target.getStage().getPointerPosition();
    (this._anchorDragOffset = { x: o.x - a.x, y: o.y - a.y }),
      this._fire("transformstart", { evt: t.evt, target: this.getNode() }),
      this._nodes.forEach((e) => {
        e._fire("transformstart", { evt: t.evt, target: e });
      });
  }
  _handleMouseMove(t) {
    var e,
      n,
      r,
      i = this.findOne("." + this._movingAnchorName),
      a = i.getStage();
    a.setPointersPositions(t);
    const o = a.getPointerPosition();
    let s = { x: o.x - this._anchorDragOffset.x, y: o.y - this._anchorDragOffset.y };
    const c = i.getAbsolutePosition();
    this.anchorDragBoundFunc() && (s = this.anchorDragBoundFunc()(c, s, t)), i.setAbsolutePosition(s);
    const l = i.getAbsolutePosition();
    if (c.x !== l.x || c.y !== l.y)
      if ("rotater" !== this._movingAnchorName) {
        var h,
          d = this.shiftBehavior();
        h =
          "inverted" === d
            ? this.keepRatio() && !t.shiftKey
            : "none" === d
            ? this.keepRatio()
            : this.keepRatio() || t.shiftKey;
        var u = this.centeredScaling() || t.altKey;
        if ("top-left" === this._movingAnchorName) {
          if (h) {
            var f = u
              ? { x: this.width() / 2, y: this.height() / 2 }
              : { x: this.findOne(".bottom-right").x(), y: this.findOne(".bottom-right").y() };
            r = Math.sqrt(Math.pow(f.x - i.x(), 2) + Math.pow(f.y - i.y(), 2));
            var p = this.findOne(".top-left").x() > f.x ? -1 : 1,
              g = this.findOne(".top-left").y() > f.y ? -1 : 1;
            (e = r * this.cos * p),
              (n = r * this.sin * g),
              this.findOne(".top-left").x(f.x - e),
              this.findOne(".top-left").y(f.y - n);
          }
        } else if ("top-center" === this._movingAnchorName) this.findOne(".top-left").y(i.y());
        else if ("top-right" === this._movingAnchorName) {
          if (h) {
            f = u
              ? { x: this.width() / 2, y: this.height() / 2 }
              : { x: this.findOne(".bottom-left").x(), y: this.findOne(".bottom-left").y() };
            r = Math.sqrt(Math.pow(i.x() - f.x, 2) + Math.pow(f.y - i.y(), 2));
            (p = this.findOne(".top-right").x() < f.x ? -1 : 1), (g = this.findOne(".top-right").y() > f.y ? -1 : 1);
            (e = r * this.cos * p),
              (n = r * this.sin * g),
              this.findOne(".top-right").x(f.x + e),
              this.findOne(".top-right").y(f.y - n);
          }
          var v = i.position();
          this.findOne(".top-left").y(v.y), this.findOne(".bottom-right").x(v.x);
        } else if ("middle-left" === this._movingAnchorName) this.findOne(".top-left").x(i.x());
        else if ("middle-right" === this._movingAnchorName) this.findOne(".bottom-right").x(i.x());
        else if ("bottom-left" === this._movingAnchorName) {
          if (h) {
            f = u
              ? { x: this.width() / 2, y: this.height() / 2 }
              : { x: this.findOne(".top-right").x(), y: this.findOne(".top-right").y() };
            r = Math.sqrt(Math.pow(f.x - i.x(), 2) + Math.pow(i.y() - f.y, 2));
            (p = f.x < i.x() ? -1 : 1), (g = i.y() < f.y ? -1 : 1);
            (e = r * this.cos * p), (n = r * this.sin * g), i.x(f.x - e), i.y(f.y + n);
          }
          (v = i.position()), this.findOne(".top-left").x(v.x), this.findOne(".bottom-right").y(v.y);
        } else if ("bottom-center" === this._movingAnchorName) this.findOne(".bottom-right").y(i.y());
        else if ("bottom-right" === this._movingAnchorName) {
          if (h) {
            f = u
              ? { x: this.width() / 2, y: this.height() / 2 }
              : { x: this.findOne(".top-left").x(), y: this.findOne(".top-left").y() };
            r = Math.sqrt(Math.pow(i.x() - f.x, 2) + Math.pow(i.y() - f.y, 2));
            (p = this.findOne(".bottom-right").x() < f.x ? -1 : 1),
              (g = this.findOne(".bottom-right").y() < f.y ? -1 : 1);
            (e = r * this.cos * p),
              (n = r * this.sin * g),
              this.findOne(".bottom-right").x(f.x + e),
              this.findOne(".bottom-right").y(f.y + n);
          }
        } else console.error(new Error("Wrong position argument of selection resizer: " + this._movingAnchorName));
        if ((u = this.centeredScaling() || t.altKey)) {
          var m = this.findOne(".top-left"),
            y = this.findOne(".bottom-right"),
            _ = m.x(),
            b = m.y(),
            S = this.getWidth() - y.x(),
            w = this.getHeight() - y.y();
          y.move({ x: -_, y: -b }), m.move({ x: S, y: w });
        }
        var x = this.findOne(".top-left").getAbsolutePosition();
        (e = x.x), (n = x.y);
        var C = this.findOne(".bottom-right").x() - this.findOne(".top-left").x(),
          k = this.findOne(".bottom-right").y() - this.findOne(".top-left").y();
        this._fitNodesInto({ x: e, y: n, width: C, height: k, rotation: vr.Konva.getAngle(this.rotation()) }, t);
      } else {
        var E = this._getNodeRect();
        (e = i.x() - E.width / 2), (n = -i.y() + E.height / 2);
        let r = Math.atan2(-n, e) + Math.PI / 2;
        E.height < 0 && (r -= Math.PI);
        const a = vr.Konva.getAngle(this.rotation()) + r,
          o = vr.Konva.getAngle(this.rotationSnapTolerance()),
          s = Nr(
            E,
            (function (t, e, n) {
              let r = e;
              for (let i = 0; i < t.length; i++) {
                const a = vr.Konva.getAngle(t[i]),
                  o = Math.abs(a - e) % (2 * Math.PI);
                Math.min(o, 2 * Math.PI - o) < n && (r = a);
              }
              return r;
            })(this.rotationSnaps(), a, o) - E.rotation
          );
        this._fitNodesInto(s, t);
      }
  }
  _handleMouseUp(t) {
    this._removeEvents(t);
  }
  getAbsoluteTransform() {
    return this.getTransform();
  }
  _removeEvents(t) {
    if (this._transforming) {
      (this._transforming = !1),
        "undefined" != typeof window &&
          (window.removeEventListener("mousemove", this._handleMouseMove),
          window.removeEventListener("touchmove", this._handleMouseMove),
          window.removeEventListener("mouseup", this._handleMouseUp, !0),
          window.removeEventListener("touchend", this._handleMouseUp, !0));
      var e = this.getNode();
      this._fire("transformend", { evt: t, target: e }),
        e &&
          this._nodes.forEach((e) => {
            e._fire("transformend", { evt: t, target: e });
          }),
        (this._movingAnchorName = null);
    }
  }
  _fitNodesInto(t, e) {
    var n = this._getNodeRect();
    if (hr.Util._inRange(t.width, 2 * -this.padding() - 1, 1)) return void this.update();
    if (hr.Util._inRange(t.height, 2 * -this.padding() - 1, 1)) return void this.update();
    const r = this.flipEnabled();
    var i = new hr.Transform();
    if (
      (i.rotate(vr.Konva.getAngle(this.rotation())),
      this._movingAnchorName && t.width < 0 && this._movingAnchorName.indexOf("left") >= 0)
    ) {
      const e = i.point({ x: 2 * -this.padding(), y: 0 });
      if (
        ((t.x += e.x),
        (t.y += e.y),
        (t.width += 2 * this.padding()),
        (this._movingAnchorName = this._movingAnchorName.replace("left", "right")),
        (this._anchorDragOffset.x -= e.x),
        (this._anchorDragOffset.y -= e.y),
        !r)
      )
        return void this.update();
    } else if (this._movingAnchorName && t.width < 0 && this._movingAnchorName.indexOf("right") >= 0) {
      const e = i.point({ x: 2 * this.padding(), y: 0 });
      if (
        ((this._movingAnchorName = this._movingAnchorName.replace("right", "left")),
        (this._anchorDragOffset.x -= e.x),
        (this._anchorDragOffset.y -= e.y),
        (t.width += 2 * this.padding()),
        !r)
      )
        return void this.update();
    }
    if (this._movingAnchorName && t.height < 0 && this._movingAnchorName.indexOf("top") >= 0) {
      const e = i.point({ x: 0, y: 2 * -this.padding() });
      if (
        ((t.x += e.x),
        (t.y += e.y),
        (this._movingAnchorName = this._movingAnchorName.replace("top", "bottom")),
        (this._anchorDragOffset.x -= e.x),
        (this._anchorDragOffset.y -= e.y),
        (t.height += 2 * this.padding()),
        !r)
      )
        return void this.update();
    } else if (this._movingAnchorName && t.height < 0 && this._movingAnchorName.indexOf("bottom") >= 0) {
      const e = i.point({ x: 0, y: 2 * this.padding() });
      if (
        ((this._movingAnchorName = this._movingAnchorName.replace("bottom", "top")),
        (this._anchorDragOffset.x -= e.x),
        (this._anchorDragOffset.y -= e.y),
        (t.height += 2 * this.padding()),
        !r)
      )
        return void this.update();
    }
    if (this.boundBoxFunc()) {
      const e = this.boundBoxFunc()(n, t);
      e ? (t = e) : hr.Util.warn("boundBoxFunc returned falsy. You should return new bound rect from it!");
    }
    const a = 1e7,
      o = new hr.Transform();
    o.translate(n.x, n.y), o.rotate(n.rotation), o.scale(n.width / a, n.height / a);
    const s = new hr.Transform();
    s.translate(t.x, t.y), s.rotate(t.rotation), s.scale(t.width / a, t.height / a);
    const c = s.multiply(o.invert());
    this._nodes.forEach((t) => {
      var n;
      const r = t.getParent().getAbsoluteTransform(),
        i = t.getTransform().copy();
      i.translate(t.offsetX(), t.offsetY());
      const a = new hr.Transform();
      a.multiply(r.copy().invert()).multiply(c).multiply(r).multiply(i);
      const o = a.decompose();
      t.setAttrs(o),
        this._fire("transform", { evt: e, target: t }),
        t._fire("transform", { evt: e, target: t }),
        null === (n = t.getLayer()) || void 0 === n || n.batchDraw();
    }),
      this.rotation(hr.Util._getRotation(t.rotation)),
      this._resetTransformCache(),
      this.update(),
      this.getLayer().batchDraw();
  }
  forceUpdate() {
    this._resetTransformCache(), this.update();
  }
  _batchChangeChild(t, e) {
    this.findOne(t).setAttrs(e);
  }
  update() {
    var t,
      e = this._getNodeRect();
    this.rotation(hr.Util._getRotation(e.rotation));
    var n = e.width,
      r = e.height,
      i = this.enabledAnchors(),
      a = this.resizeEnabled(),
      o = this.padding(),
      s = this.anchorSize();
    const c = this.find("._anchor");
    c.forEach((t) => {
      t.setAttrs({
        width: s,
        height: s,
        offsetX: s / 2,
        offsetY: s / 2,
        stroke: this.anchorStroke(),
        strokeWidth: this.anchorStrokeWidth(),
        fill: this.anchorFill(),
        cornerRadius: this.anchorCornerRadius(),
      });
    }),
      this._batchChangeChild(".top-left", {
        x: 0,
        y: 0,
        offsetX: s / 2 + o,
        offsetY: s / 2 + o,
        visible: a && i.indexOf("top-left") >= 0,
      }),
      this._batchChangeChild(".top-center", {
        x: n / 2,
        y: 0,
        offsetY: s / 2 + o,
        visible: a && i.indexOf("top-center") >= 0,
      }),
      this._batchChangeChild(".top-right", {
        x: n,
        y: 0,
        offsetX: s / 2 - o,
        offsetY: s / 2 + o,
        visible: a && i.indexOf("top-right") >= 0,
      }),
      this._batchChangeChild(".middle-left", {
        x: 0,
        y: r / 2,
        offsetX: s / 2 + o,
        visible: a && i.indexOf("middle-left") >= 0,
      }),
      this._batchChangeChild(".middle-right", {
        x: n,
        y: r / 2,
        offsetX: s / 2 - o,
        visible: a && i.indexOf("middle-right") >= 0,
      }),
      this._batchChangeChild(".bottom-left", {
        x: 0,
        y: r,
        offsetX: s / 2 + o,
        offsetY: s / 2 - o,
        visible: a && i.indexOf("bottom-left") >= 0,
      }),
      this._batchChangeChild(".bottom-center", {
        x: n / 2,
        y: r,
        offsetY: s / 2 - o,
        visible: a && i.indexOf("bottom-center") >= 0,
      }),
      this._batchChangeChild(".bottom-right", {
        x: n,
        y: r,
        offsetX: s / 2 - o,
        offsetY: s / 2 - o,
        visible: a && i.indexOf("bottom-right") >= 0,
      }),
      this._batchChangeChild(".rotater", {
        x: n / 2,
        y: -this.rotateAnchorOffset() * hr.Util._sign(r) - o,
        visible: this.rotateEnabled(),
      }),
      this._batchChangeChild(".back", {
        width: n,
        height: r,
        visible: this.borderEnabled(),
        stroke: this.borderStroke(),
        strokeWidth: this.borderStrokeWidth(),
        dash: this.borderDash(),
        x: 0,
        y: 0,
      });
    const l = this.anchorStyleFunc();
    l &&
      c.forEach((t) => {
        l(t);
      }),
      null === (t = this.getLayer()) || void 0 === t || t.batchDraw();
  }
  isTransforming() {
    return this._transforming;
  }
  stopTransform() {
    if (this._transforming) {
      this._removeEvents();
      var t = this.findOne("." + this._movingAnchorName);
      t && t.stopDrag();
    }
  }
  destroy() {
    return (
      this.getStage() && this._cursorChange && this.getStage().content && (this.getStage().content.style.cursor = ""),
      gr.Group.prototype.destroy.call(this),
      this.detach(),
      this._removeEvents(),
      this
    );
  }
  toObject() {
    return ur.Node.prototype.toObject.call(this);
  }
  clone(t) {
    return ur.Node.prototype.clone.call(this, t);
  }
  getClientRect() {
    return this.nodes().length > 0 ? super.getClientRect() : { x: 0, y: 0, width: 0, height: 0 };
  }
}
(lr.Transformer = Or),
  (Or.prototype.className = "Transformer"),
  (0, yr._registerNode)(Or),
  dr.Factory.addGetterSetter(Or, "enabledAnchors", kr, function (t) {
    return (
      t instanceof Array || hr.Util.warn("enabledAnchors value should be an array"),
      t instanceof Array &&
        t.forEach(function (t) {
          -1 === kr.indexOf(t) && hr.Util.warn("Unknown anchor name: " + t + ". Available names are: " + kr.join(", "));
        }),
      t || []
    );
  }),
  dr.Factory.addGetterSetter(Or, "flipEnabled", !0, (0, mr.getBooleanValidator)()),
  dr.Factory.addGetterSetter(Or, "resizeEnabled", !0),
  dr.Factory.addGetterSetter(Or, "anchorSize", 10, (0, mr.getNumberValidator)()),
  dr.Factory.addGetterSetter(Or, "rotateEnabled", !0),
  dr.Factory.addGetterSetter(Or, "rotationSnaps", []),
  dr.Factory.addGetterSetter(Or, "rotateAnchorOffset", 50, (0, mr.getNumberValidator)()),
  dr.Factory.addGetterSetter(Or, "rotateAnchorCursor", "crosshair"),
  dr.Factory.addGetterSetter(Or, "rotationSnapTolerance", 5, (0, mr.getNumberValidator)()),
  dr.Factory.addGetterSetter(Or, "borderEnabled", !0),
  dr.Factory.addGetterSetter(Or, "anchorStroke", "rgb(0, 161, 255)"),
  dr.Factory.addGetterSetter(Or, "anchorStrokeWidth", 1, (0, mr.getNumberValidator)()),
  dr.Factory.addGetterSetter(Or, "anchorFill", "white"),
  dr.Factory.addGetterSetter(Or, "anchorCornerRadius", 0, (0, mr.getNumberValidator)()),
  dr.Factory.addGetterSetter(Or, "borderStroke", "rgb(0, 161, 255)"),
  dr.Factory.addGetterSetter(Or, "borderStrokeWidth", 1, (0, mr.getNumberValidator)()),
  dr.Factory.addGetterSetter(Or, "borderDash"),
  dr.Factory.addGetterSetter(Or, "keepRatio", !0),
  dr.Factory.addGetterSetter(Or, "shiftBehavior", "default"),
  dr.Factory.addGetterSetter(Or, "centeredScaling", !1),
  dr.Factory.addGetterSetter(Or, "ignoreStroke", !1),
  dr.Factory.addGetterSetter(Or, "padding", 0, (0, mr.getNumberValidator)()),
  dr.Factory.addGetterSetter(Or, "node"),
  dr.Factory.addGetterSetter(Or, "nodes"),
  dr.Factory.addGetterSetter(Or, "boundBoxFunc"),
  dr.Factory.addGetterSetter(Or, "anchorDragBoundFunc"),
  dr.Factory.addGetterSetter(Or, "anchorStyleFunc"),
  dr.Factory.addGetterSetter(Or, "shouldOverdrawWholeArea", !1),
  dr.Factory.addGetterSetter(Or, "useSingleNodeRotation", !0),
  dr.Factory.backCompat(Or, {
    lineEnabled: "borderEnabled",
    rotateHandlerOffset: "rotateAnchorOffset",
    enabledHandlers: "enabledAnchors",
  });
var Ar = {};
Object.defineProperty(Ar, "__esModule", { value: !0 }), (Ar.Wedge = void 0);
const Pr = g,
  Tr = vt,
  Dr = u,
  Fr = v,
  Mr = u;
class Rr extends Tr.Shape {
  _sceneFunc(t) {
    t.beginPath(),
      t.arc(0, 0, this.radius(), 0, Dr.Konva.getAngle(this.angle()), this.clockwise()),
      t.lineTo(0, 0),
      t.closePath(),
      t.fillStrokeShape(this);
  }
  getWidth() {
    return 2 * this.radius();
  }
  getHeight() {
    return 2 * this.radius();
  }
  setWidth(t) {
    this.radius(t / 2);
  }
  setHeight(t) {
    this.radius(t / 2);
  }
}
(Ar.Wedge = Rr),
  (Rr.prototype.className = "Wedge"),
  (Rr.prototype._centroid = !0),
  (Rr.prototype._attrsAffectingSize = ["radius"]),
  (0, Mr._registerNode)(Rr),
  Pr.Factory.addGetterSetter(Rr, "radius", 0, (0, Fr.getNumberValidator)()),
  Pr.Factory.addGetterSetter(Rr, "angle", 0, (0, Fr.getNumberValidator)()),
  Pr.Factory.addGetterSetter(Rr, "clockwise", !1),
  Pr.Factory.backCompat(Rr, { angleDeg: "angle", getAngleDeg: "getAngle", setAngleDeg: "setAngle" });
var Lr = {};
Object.defineProperty(Lr, "__esModule", { value: !0 }), (Lr.Blur = void 0);
const Ir = g,
  Gr = p,
  $r = v;
function Vr() {
  (this.r = 0), (this.g = 0), (this.b = 0), (this.a = 0), (this.next = null);
}
var Ur = [
    512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496,
    456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496,
    475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441,
    428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496,
    485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318,
    312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441,
    435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324,
    320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496,
    491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392,
    388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318,
    315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263,
    261, 259,
  ],
  jr = [
    9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18,
    18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
    20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
    21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
  ];
(Lr.Blur = function (t) {
  var e = Math.round(this.blurRadius());
  e > 0 &&
    (function (t, e) {
      var n,
        r,
        i,
        a,
        o,
        s,
        c,
        l,
        h,
        d,
        u,
        f,
        p,
        g,
        v,
        m,
        y,
        _,
        b,
        S,
        w,
        x,
        C,
        k,
        E = t.data,
        N = t.width,
        O = t.height,
        A = e + e + 1,
        P = N - 1,
        T = O - 1,
        D = e + 1,
        F = (D * (D + 1)) / 2,
        M = new Vr(),
        R = null,
        L = M,
        I = null,
        G = null,
        $ = Ur[e],
        V = jr[e];
      for (i = 1; i < A; i++) (L = L.next = new Vr()), i === D && (R = L);
      for (L.next = M, c = s = 0, r = 0; r < O; r++) {
        for (
          m = y = _ = b = l = h = d = u = 0,
            f = D * (S = E[s]),
            p = D * (w = E[s + 1]),
            g = D * (x = E[s + 2]),
            v = D * (C = E[s + 3]),
            l += F * S,
            h += F * w,
            d += F * x,
            u += F * C,
            L = M,
            i = 0;
          i < D;
          i++
        )
          (L.r = S), (L.g = w), (L.b = x), (L.a = C), (L = L.next);
        for (i = 1; i < D; i++)
          (a = s + ((P < i ? P : i) << 2)),
            (l += (L.r = S = E[a]) * (k = D - i)),
            (h += (L.g = w = E[a + 1]) * k),
            (d += (L.b = x = E[a + 2]) * k),
            (u += (L.a = C = E[a + 3]) * k),
            (m += S),
            (y += w),
            (_ += x),
            (b += C),
            (L = L.next);
        for (I = M, G = R, n = 0; n < N; n++)
          (E[s + 3] = C = (u * $) >> V),
            0 !== C
              ? ((C = 255 / C),
                (E[s] = ((l * $) >> V) * C),
                (E[s + 1] = ((h * $) >> V) * C),
                (E[s + 2] = ((d * $) >> V) * C))
              : (E[s] = E[s + 1] = E[s + 2] = 0),
            (l -= f),
            (h -= p),
            (d -= g),
            (u -= v),
            (f -= I.r),
            (p -= I.g),
            (g -= I.b),
            (v -= I.a),
            (a = (c + ((a = n + e + 1) < P ? a : P)) << 2),
            (l += m += I.r = E[a]),
            (h += y += I.g = E[a + 1]),
            (d += _ += I.b = E[a + 2]),
            (u += b += I.a = E[a + 3]),
            (I = I.next),
            (f += S = G.r),
            (p += w = G.g),
            (g += x = G.b),
            (v += C = G.a),
            (m -= S),
            (y -= w),
            (_ -= x),
            (b -= C),
            (G = G.next),
            (s += 4);
        c += N;
      }
      for (n = 0; n < N; n++) {
        for (
          y = _ = b = m = h = d = u = l = 0,
            f = D * (S = E[(s = n << 2)]),
            p = D * (w = E[s + 1]),
            g = D * (x = E[s + 2]),
            v = D * (C = E[s + 3]),
            l += F * S,
            h += F * w,
            d += F * x,
            u += F * C,
            L = M,
            i = 0;
          i < D;
          i++
        )
          (L.r = S), (L.g = w), (L.b = x), (L.a = C), (L = L.next);
        for (o = N, i = 1; i <= e; i++)
          (s = (o + n) << 2),
            (l += (L.r = S = E[s]) * (k = D - i)),
            (h += (L.g = w = E[s + 1]) * k),
            (d += (L.b = x = E[s + 2]) * k),
            (u += (L.a = C = E[s + 3]) * k),
            (m += S),
            (y += w),
            (_ += x),
            (b += C),
            (L = L.next),
            i < T && (o += N);
        for (s = n, I = M, G = R, r = 0; r < O; r++)
          (E[3 + (a = s << 2)] = C = (u * $) >> V),
            C > 0
              ? ((C = 255 / C),
                (E[a] = ((l * $) >> V) * C),
                (E[a + 1] = ((h * $) >> V) * C),
                (E[a + 2] = ((d * $) >> V) * C))
              : (E[a] = E[a + 1] = E[a + 2] = 0),
            (l -= f),
            (h -= p),
            (d -= g),
            (u -= v),
            (f -= I.r),
            (p -= I.g),
            (g -= I.b),
            (v -= I.a),
            (a = (n + ((a = r + D) < T ? a : T) * N) << 2),
            (l += m += I.r = E[a]),
            (h += y += I.g = E[a + 1]),
            (d += _ += I.b = E[a + 2]),
            (u += b += I.a = E[a + 3]),
            (I = I.next),
            (f += S = G.r),
            (p += w = G.g),
            (g += x = G.b),
            (v += C = G.a),
            (m -= S),
            (y -= w),
            (_ -= x),
            (b -= C),
            (G = G.next),
            (s += N);
      }
    })(t, e);
}),
  Ir.Factory.addGetterSetter(Gr.Node, "blurRadius", 0, (0, $r.getNumberValidator)(), Ir.Factory.afterSetFilter);
var Br = {};
Object.defineProperty(Br, "__esModule", { value: !0 }), (Br.Brighten = void 0);
const Hr = g,
  Wr = p,
  zr = v;
(Br.Brighten = function (t) {
  var e,
    n = 255 * this.brightness(),
    r = t.data,
    i = r.length;
  for (e = 0; e < i; e += 4) (r[e] += n), (r[e + 1] += n), (r[e + 2] += n);
}),
  Hr.Factory.addGetterSetter(Wr.Node, "brightness", 0, (0, zr.getNumberValidator)(), Hr.Factory.afterSetFilter);
var Kr = {};
Object.defineProperty(Kr, "__esModule", { value: !0 }), (Kr.Contrast = void 0);
const Yr = g,
  qr = p,
  Xr = v;
(Kr.Contrast = function (t) {
  var e,
    n = Math.pow((this.contrast() + 100) / 100, 2),
    r = t.data,
    i = r.length,
    a = 150,
    o = 150,
    s = 150;
  for (e = 0; e < i; e += 4)
    (a = r[e]),
      (o = r[e + 1]),
      (s = r[e + 2]),
      (a /= 255),
      (a -= 0.5),
      (a *= n),
      (a += 0.5),
      (o /= 255),
      (o -= 0.5),
      (o *= n),
      (o += 0.5),
      (s /= 255),
      (s -= 0.5),
      (s *= n),
      (s += 0.5),
      (a = (a *= 255) < 0 ? 0 : a > 255 ? 255 : a),
      (o = (o *= 255) < 0 ? 0 : o > 255 ? 255 : o),
      (s = (s *= 255) < 0 ? 0 : s > 255 ? 255 : s),
      (r[e] = a),
      (r[e + 1] = o),
      (r[e + 2] = s);
}),
  Yr.Factory.addGetterSetter(qr.Node, "contrast", 0, (0, Xr.getNumberValidator)(), Yr.Factory.afterSetFilter);
var Jr = {};
Object.defineProperty(Jr, "__esModule", { value: !0 }), (Jr.Emboss = void 0);
const Qr = g,
  Zr = p,
  ti = f,
  ei = v;
(Jr.Emboss = function (t) {
  var e = 10 * this.embossStrength(),
    n = 255 * this.embossWhiteLevel(),
    r = this.embossDirection(),
    i = this.embossBlend(),
    a = 0,
    o = 0,
    s = t.data,
    c = t.width,
    l = t.height,
    h = 4 * c,
    d = l;
  switch (r) {
    case "top-left":
      (a = -1), (o = -1);
      break;
    case "top":
      (a = -1), (o = 0);
      break;
    case "top-right":
      (a = -1), (o = 1);
      break;
    case "right":
      (a = 0), (o = 1);
      break;
    case "bottom-right":
      (a = 1), (o = 1);
      break;
    case "bottom":
      (a = 1), (o = 0);
      break;
    case "bottom-left":
      (a = 1), (o = -1);
      break;
    case "left":
      (a = 0), (o = -1);
      break;
    default:
      ti.Util.error("Unknown emboss direction: " + r);
  }
  do {
    var u = (d - 1) * h,
      f = a;
    d + f < 1 && (f = 0), d + f > l && (f = 0);
    var p = (d - 1 + f) * c * 4,
      g = c;
    do {
      var v = u + 4 * (g - 1),
        m = o;
      g + m < 1 && (m = 0), g + m > c && (m = 0);
      var y = p + 4 * (g - 1 + m),
        _ = s[v] - s[y],
        b = s[v + 1] - s[y + 1],
        S = s[v + 2] - s[y + 2],
        w = _,
        x = w > 0 ? w : -w;
      if (((b > 0 ? b : -b) > x && (w = b), (S > 0 ? S : -S) > x && (w = S), (w *= e), i)) {
        var C = s[v] + w,
          k = s[v + 1] + w,
          E = s[v + 2] + w;
        (s[v] = C > 255 ? 255 : C < 0 ? 0 : C),
          (s[v + 1] = k > 255 ? 255 : k < 0 ? 0 : k),
          (s[v + 2] = E > 255 ? 255 : E < 0 ? 0 : E);
      } else {
        var N = n - w;
        N < 0 ? (N = 0) : N > 255 && (N = 255), (s[v] = s[v + 1] = s[v + 2] = N);
      }
    } while (--g);
  } while (--d);
}),
  Qr.Factory.addGetterSetter(Zr.Node, "embossStrength", 0.5, (0, ei.getNumberValidator)(), Qr.Factory.afterSetFilter),
  Qr.Factory.addGetterSetter(Zr.Node, "embossWhiteLevel", 0.5, (0, ei.getNumberValidator)(), Qr.Factory.afterSetFilter),
  Qr.Factory.addGetterSetter(Zr.Node, "embossDirection", "top-left", null, Qr.Factory.afterSetFilter),
  Qr.Factory.addGetterSetter(Zr.Node, "embossBlend", !1, null, Qr.Factory.afterSetFilter);
var ni = {};
Object.defineProperty(ni, "__esModule", { value: !0 }), (ni.Enhance = void 0);
const ri = g,
  ii = p,
  ai = v;
function oi(t, e, n, r, i) {
  var a = n - e,
    o = i - r;
  return 0 === a ? r + o / 2 : 0 === o ? r : o * ((t - e) / a) + r;
}
(ni.Enhance = function (t) {
  var e,
    n,
    r,
    i,
    a = t.data,
    o = a.length,
    s = a[0],
    c = s,
    l = a[1],
    h = l,
    d = a[2],
    u = d,
    f = this.enhance();
  if (0 !== f) {
    for (i = 0; i < o; i += 4)
      (e = a[i + 0]) < s ? (s = e) : e > c && (c = e),
        (n = a[i + 1]) < l ? (l = n) : n > h && (h = n),
        (r = a[i + 2]) < d ? (d = r) : r > u && (u = r);
    var p, g, v, m, y, _, b, S, w;
    for (
      c === s && ((c = 255), (s = 0)),
        h === l && ((h = 255), (l = 0)),
        u === d && ((u = 255), (d = 0)),
        f > 0
          ? ((g = c + f * (255 - c)),
            (v = s - f * (s - 0)),
            (y = h + f * (255 - h)),
            (_ = l - f * (l - 0)),
            (S = u + f * (255 - u)),
            (w = d - f * (d - 0)))
          : ((g = c + f * (c - (p = 0.5 * (c + s)))),
            (v = s + f * (s - p)),
            (y = h + f * (h - (m = 0.5 * (h + l)))),
            (_ = l + f * (l - m)),
            (S = u + f * (u - (b = 0.5 * (u + d)))),
            (w = d + f * (d - b))),
        i = 0;
      i < o;
      i += 4
    )
      (a[i + 0] = oi(a[i + 0], s, c, v, g)),
        (a[i + 1] = oi(a[i + 1], l, h, _, y)),
        (a[i + 2] = oi(a[i + 2], d, u, w, S));
  }
}),
  ri.Factory.addGetterSetter(ii.Node, "enhance", 0, (0, ai.getNumberValidator)(), ri.Factory.afterSetFilter);
var si = {};
Object.defineProperty(si, "__esModule", { value: !0 }), (si.Grayscale = void 0);
si.Grayscale = function (t) {
  var e,
    n,
    r = t.data,
    i = r.length;
  for (e = 0; e < i; e += 4)
    (n = 0.34 * r[e] + 0.5 * r[e + 1] + 0.16 * r[e + 2]), (r[e] = n), (r[e + 1] = n), (r[e + 2] = n);
};
var ci = {};
Object.defineProperty(ci, "__esModule", { value: !0 }), (ci.HSL = void 0);
const li = g,
  hi = p,
  di = v;
li.Factory.addGetterSetter(hi.Node, "hue", 0, (0, di.getNumberValidator)(), li.Factory.afterSetFilter),
  li.Factory.addGetterSetter(hi.Node, "saturation", 0, (0, di.getNumberValidator)(), li.Factory.afterSetFilter),
  li.Factory.addGetterSetter(hi.Node, "luminance", 0, (0, di.getNumberValidator)(), li.Factory.afterSetFilter);
ci.HSL = function (t) {
  var e,
    n,
    r,
    i,
    a,
    o = t.data,
    s = o.length,
    c = Math.pow(2, this.saturation()),
    l = Math.abs(this.hue() + 360) % 360,
    h = 127 * this.luminance(),
    d = 1 * c * Math.cos((l * Math.PI) / 180),
    u = 1 * c * Math.sin((l * Math.PI) / 180),
    f = 0.299 + 0.701 * d + 0.167 * u,
    p = 0.587 - 0.587 * d + 0.33 * u,
    g = 0.114 - 0.114 * d - 0.497 * u,
    v = 0.299 - 0.299 * d - 0.328 * u,
    m = 0.587 + 0.413 * d + 0.035 * u,
    y = 0.114 - 0.114 * d + 0.293 * u,
    _ = 0.299 - 0.3 * d + 1.25 * u,
    b = 0.587 - 0.586 * d - 1.05 * u,
    S = 0.114 + 0.886 * d - 0.2 * u;
  for (e = 0; e < s; e += 4)
    (n = o[e + 0]),
      (r = o[e + 1]),
      (i = o[e + 2]),
      (a = o[e + 3]),
      (o[e + 0] = f * n + p * r + g * i + h),
      (o[e + 1] = v * n + m * r + y * i + h),
      (o[e + 2] = _ * n + b * r + S * i + h),
      (o[e + 3] = a);
};
var ui = {};
Object.defineProperty(ui, "__esModule", { value: !0 }), (ui.HSV = void 0);
const fi = g,
  pi = p,
  gi = v;
(ui.HSV = function (t) {
  var e,
    n,
    r,
    i,
    a,
    o = t.data,
    s = o.length,
    c = Math.pow(2, this.value()),
    l = Math.pow(2, this.saturation()),
    h = Math.abs(this.hue() + 360) % 360,
    d = c * l * Math.cos((h * Math.PI) / 180),
    u = c * l * Math.sin((h * Math.PI) / 180),
    f = 0.299 * c + 0.701 * d + 0.167 * u,
    p = 0.587 * c - 0.587 * d + 0.33 * u,
    g = 0.114 * c - 0.114 * d - 0.497 * u,
    v = 0.299 * c - 0.299 * d - 0.328 * u,
    m = 0.587 * c + 0.413 * d + 0.035 * u,
    y = 0.114 * c - 0.114 * d + 0.293 * u,
    _ = 0.299 * c - 0.3 * d + 1.25 * u,
    b = 0.587 * c - 0.586 * d - 1.05 * u,
    S = 0.114 * c + 0.886 * d - 0.2 * u;
  for (e = 0; e < s; e += 4)
    (n = o[e + 0]),
      (r = o[e + 1]),
      (i = o[e + 2]),
      (a = o[e + 3]),
      (o[e + 0] = f * n + p * r + g * i),
      (o[e + 1] = v * n + m * r + y * i),
      (o[e + 2] = _ * n + b * r + S * i),
      (o[e + 3] = a);
}),
  fi.Factory.addGetterSetter(pi.Node, "hue", 0, (0, gi.getNumberValidator)(), fi.Factory.afterSetFilter),
  fi.Factory.addGetterSetter(pi.Node, "saturation", 0, (0, gi.getNumberValidator)(), fi.Factory.afterSetFilter),
  fi.Factory.addGetterSetter(pi.Node, "value", 0, (0, gi.getNumberValidator)(), fi.Factory.afterSetFilter);
var vi = {};
Object.defineProperty(vi, "__esModule", { value: !0 }), (vi.Invert = void 0);
vi.Invert = function (t) {
  var e,
    n = t.data,
    r = n.length;
  for (e = 0; e < r; e += 4) (n[e] = 255 - n[e]), (n[e + 1] = 255 - n[e + 1]), (n[e + 2] = 255 - n[e + 2]);
};
var mi = {};
Object.defineProperty(mi, "__esModule", { value: !0 }), (mi.Kaleidoscope = void 0);
const yi = g,
  _i = p,
  bi = f,
  Si = v;
(mi.Kaleidoscope = function (t) {
  var e,
    n,
    r,
    i,
    a,
    o,
    s,
    c,
    l,
    h = t.width,
    d = t.height,
    u = Math.round(this.kaleidoscopePower()),
    f = Math.round(this.kaleidoscopeAngle()),
    p = Math.floor((h * (f % 360)) / 360);
  if (!(u < 1)) {
    var g = bi.Util.createCanvasElement();
    (g.width = h), (g.height = d);
    var v = g.getContext("2d").getImageData(0, 0, h, d);
    bi.Util.releaseCanvas(g),
      (function (t, e, n) {
        var r,
          i,
          a,
          o,
          s = t.data,
          c = e.data,
          l = t.width,
          h = t.height,
          d = n.polarCenterX || l / 2,
          u = n.polarCenterY || h / 2,
          f = 0,
          p = 0,
          g = 0,
          v = 0,
          m = Math.sqrt(d * d + u * u);
        (i = l - d), (a = h - u), (m = (o = Math.sqrt(i * i + a * a)) > m ? o : m);
        var y,
          _,
          b,
          S,
          w = h,
          x = l,
          C = ((360 / x) * Math.PI) / 180;
        for (_ = 0; _ < x; _ += 1)
          for (b = Math.sin(_ * C), S = Math.cos(_ * C), y = 0; y < w; y += 1)
            (i = Math.floor(d + ((m * y) / w) * S)),
              (f = s[0 + (r = 4 * ((a = Math.floor(u + ((m * y) / w) * b)) * l + i))]),
              (p = s[r + 1]),
              (g = s[r + 2]),
              (v = s[r + 3]),
              (c[0 + (r = 4 * (_ + y * l))] = f),
              (c[r + 1] = p),
              (c[r + 2] = g),
              (c[r + 3] = v);
      })(t, v, { polarCenterX: h / 2, polarCenterY: d / 2 });
    for (var m = h / Math.pow(2, u); m <= 8; ) (m *= 2), (u -= 1);
    var y = (m = Math.ceil(m)),
      _ = 0,
      b = y,
      S = 1;
    for (p + m > h && ((_ = y), (b = 0), (S = -1)), n = 0; n < d; n += 1)
      for (e = _; e !== b; e += S)
        (c = 4 * (h * n + (Math.round(e + p) % h))),
          (i = v.data[c + 0]),
          (a = v.data[c + 1]),
          (o = v.data[c + 2]),
          (s = v.data[c + 3]),
          (l = 4 * (h * n + e)),
          (v.data[l + 0] = i),
          (v.data[l + 1] = a),
          (v.data[l + 2] = o),
          (v.data[l + 3] = s);
    for (n = 0; n < d; n += 1)
      for (y = Math.floor(m), r = 0; r < u; r += 1) {
        for (e = 0; e < y + 1; e += 1)
          (c = 4 * (h * n + e)),
            (i = v.data[c + 0]),
            (a = v.data[c + 1]),
            (o = v.data[c + 2]),
            (s = v.data[c + 3]),
            (l = 4 * (h * n + 2 * y - e - 1)),
            (v.data[l + 0] = i),
            (v.data[l + 1] = a),
            (v.data[l + 2] = o),
            (v.data[l + 3] = s);
        y *= 2;
      }
    !(function (t, e, n) {
      var r,
        i,
        a,
        o,
        s,
        c,
        l = t.data,
        h = e.data,
        d = t.width,
        u = t.height,
        f = n.polarCenterX || d / 2,
        p = n.polarCenterY || u / 2,
        g = 0,
        v = 0,
        m = 0,
        y = 0,
        _ = Math.sqrt(f * f + p * p);
      (i = d - f), (a = u - p), (_ = (c = Math.sqrt(i * i + a * a)) > _ ? c : _);
      var b,
        S,
        w,
        x = u,
        C = d,
        k = n.polarRotation || 0;
      for (i = 0; i < d; i += 1)
        for (a = 0; a < u; a += 1)
          (o = i - f),
            (s = a - p),
            (b = (Math.sqrt(o * o + s * s) * x) / _),
            (S = ((S = ((180 * Math.atan2(s, o)) / Math.PI + 360 + k) % 360) * C) / 360),
            (w = Math.floor(S)),
            (g = l[0 + (r = 4 * (Math.floor(b) * d + w))]),
            (v = l[r + 1]),
            (m = l[r + 2]),
            (y = l[r + 3]),
            (h[0 + (r = 4 * (a * d + i))] = g),
            (h[r + 1] = v),
            (h[r + 2] = m),
            (h[r + 3] = y);
    })(v, t, { polarRotation: 0 });
  }
}),
  yi.Factory.addGetterSetter(_i.Node, "kaleidoscopePower", 2, (0, Si.getNumberValidator)(), yi.Factory.afterSetFilter),
  yi.Factory.addGetterSetter(_i.Node, "kaleidoscopeAngle", 0, (0, Si.getNumberValidator)(), yi.Factory.afterSetFilter);
var wi = {};
Object.defineProperty(wi, "__esModule", { value: !0 }), (wi.Mask = void 0);
const xi = g,
  Ci = p,
  ki = v;
function Ei(t, e, n) {
  var r = 4 * (n * t.width + e),
    i = [];
  return i.push(t.data[r++], t.data[r++], t.data[r++], t.data[r++]), i;
}
function Ni(t, e) {
  return Math.sqrt(Math.pow(t[0] - e[0], 2) + Math.pow(t[1] - e[1], 2) + Math.pow(t[2] - e[2], 2));
}
(wi.Mask = function (t) {
  var e = (function (t, e) {
    var n = Ei(t, 0, 0),
      r = Ei(t, t.width - 1, 0),
      i = Ei(t, 0, t.height - 1),
      a = Ei(t, t.width - 1, t.height - 1),
      o = e || 10;
    if (Ni(n, r) < o && Ni(r, a) < o && Ni(a, i) < o && Ni(i, n) < o) {
      for (
        var s = (function (t) {
            for (var e = [0, 0, 0], n = 0; n < t.length; n++) (e[0] += t[n][0]), (e[1] += t[n][1]), (e[2] += t[n][2]);
            return (e[0] /= t.length), (e[1] /= t.length), (e[2] /= t.length), e;
          })([r, n, a, i]),
          c = [],
          l = 0;
        l < t.width * t.height;
        l++
      ) {
        var h = Ni(s, [t.data[4 * l], t.data[4 * l + 1], t.data[4 * l + 2]]);
        c[l] = h < o ? 0 : 255;
      }
      return c;
    }
  })(t, this.threshold());
  return (
    e &&
      (function (t, e) {
        for (var n = 0; n < t.width * t.height; n++) t.data[4 * n + 3] = e[n];
      })(
        t,
        (e = (function (t, e, n) {
          for (
            var r = [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9],
              i = Math.round(Math.sqrt(r.length)),
              a = Math.floor(i / 2),
              o = [],
              s = 0;
            s < n;
            s++
          )
            for (var c = 0; c < e; c++) {
              for (var l = s * e + c, h = 0, d = 0; d < i; d++)
                for (var u = 0; u < i; u++) {
                  var f = s + d - a,
                    p = c + u - a;
                  if (f >= 0 && f < n && p >= 0 && p < e) {
                    var g = r[d * i + u];
                    h += t[f * e + p] * g;
                  }
                }
              o[l] = h;
            }
          return o;
        })(
          (e = (function (t, e, n) {
            for (
              var r = [1, 1, 1, 1, 1, 1, 1, 1, 1],
                i = Math.round(Math.sqrt(r.length)),
                a = Math.floor(i / 2),
                o = [],
                s = 0;
              s < n;
              s++
            )
              for (var c = 0; c < e; c++) {
                for (var l = s * e + c, h = 0, d = 0; d < i; d++)
                  for (var u = 0; u < i; u++) {
                    var f = s + d - a,
                      p = c + u - a;
                    if (f >= 0 && f < n && p >= 0 && p < e) {
                      var g = r[d * i + u];
                      h += t[f * e + p] * g;
                    }
                  }
                o[l] = h >= 1020 ? 255 : 0;
              }
            return o;
          })(
            (e = (function (t, e, n) {
              for (
                var r = [1, 1, 1, 1, 0, 1, 1, 1, 1],
                  i = Math.round(Math.sqrt(r.length)),
                  a = Math.floor(i / 2),
                  o = [],
                  s = 0;
                s < n;
                s++
              )
                for (var c = 0; c < e; c++) {
                  for (var l = s * e + c, h = 0, d = 0; d < i; d++)
                    for (var u = 0; u < i; u++) {
                      var f = s + d - a,
                        p = c + u - a;
                      if (f >= 0 && f < n && p >= 0 && p < e) {
                        var g = r[d * i + u];
                        h += t[f * e + p] * g;
                      }
                    }
                  o[l] = 2040 === h ? 255 : 0;
                }
              return o;
            })(e, t.width, t.height)),
            t.width,
            t.height
          )),
          t.width,
          t.height
        ))
      ),
    t
  );
}),
  xi.Factory.addGetterSetter(Ci.Node, "threshold", 0, (0, ki.getNumberValidator)(), xi.Factory.afterSetFilter);
var Oi = {};
Object.defineProperty(Oi, "__esModule", { value: !0 }), (Oi.Noise = void 0);
const Ai = g,
  Pi = p,
  Ti = v;
(Oi.Noise = function (t) {
  var e,
    n = 255 * this.noise(),
    r = t.data,
    i = r.length,
    a = n / 2;
  for (e = 0; e < i; e += 4)
    (r[e + 0] += a - 2 * a * Math.random()),
      (r[e + 1] += a - 2 * a * Math.random()),
      (r[e + 2] += a - 2 * a * Math.random());
}),
  Ai.Factory.addGetterSetter(Pi.Node, "noise", 0.2, (0, Ti.getNumberValidator)(), Ai.Factory.afterSetFilter);
var Di = {};
Object.defineProperty(Di, "__esModule", { value: !0 }), (Di.Pixelate = void 0);
const Fi = g,
  Mi = f,
  Ri = p,
  Li = v;
(Di.Pixelate = function (t) {
  var e,
    n,
    r,
    i,
    a,
    o,
    s,
    c,
    l,
    h,
    d,
    u,
    f,
    p,
    g = Math.ceil(this.pixelSize()),
    v = t.width,
    m = t.height,
    y = Math.ceil(v / g),
    _ = Math.ceil(m / g),
    b = t.data;
  if (g <= 0) Mi.Util.error("pixelSize value can not be <= 0");
  else
    for (u = 0; u < y; u += 1)
      for (f = 0; f < _; f += 1) {
        for (i = 0, a = 0, o = 0, s = 0, l = (c = u * g) + g, d = (h = f * g) + g, p = 0, e = c; e < l; e += 1)
          if (!(e >= v))
            for (n = h; n < d; n += 1)
              n >= m ||
                ((i += b[(r = 4 * (v * n + e)) + 0]), (a += b[r + 1]), (o += b[r + 2]), (s += b[r + 3]), (p += 1));
        for (i /= p, a /= p, o /= p, s /= p, e = c; e < l; e += 1)
          if (!(e >= v))
            for (n = h; n < d; n += 1)
              n >= m || ((b[(r = 4 * (v * n + e)) + 0] = i), (b[r + 1] = a), (b[r + 2] = o), (b[r + 3] = s));
      }
}),
  Fi.Factory.addGetterSetter(Ri.Node, "pixelSize", 8, (0, Li.getNumberValidator)(), Fi.Factory.afterSetFilter);
var Ii = {};
Object.defineProperty(Ii, "__esModule", { value: !0 }), (Ii.Posterize = void 0);
const Gi = g,
  $i = p,
  Vi = v;
(Ii.Posterize = function (t) {
  var e,
    n = Math.round(254 * this.levels()) + 1,
    r = t.data,
    i = r.length,
    a = 255 / n;
  for (e = 0; e < i; e += 1) r[e] = Math.floor(r[e] / a) * a;
}),
  Gi.Factory.addGetterSetter($i.Node, "levels", 0.5, (0, Vi.getNumberValidator)(), Gi.Factory.afterSetFilter);
var Ui = {};
Object.defineProperty(Ui, "__esModule", { value: !0 }), (Ui.RGB = void 0);
const ji = g,
  Bi = p,
  Hi = v;
(Ui.RGB = function (t) {
  var e,
    n,
    r = t.data,
    i = r.length,
    a = this.red(),
    o = this.green(),
    s = this.blue();
  for (e = 0; e < i; e += 4)
    (n = (0.34 * r[e] + 0.5 * r[e + 1] + 0.16 * r[e + 2]) / 255),
      (r[e] = n * a),
      (r[e + 1] = n * o),
      (r[e + 2] = n * s),
      (r[e + 3] = r[e + 3]);
}),
  ji.Factory.addGetterSetter(Bi.Node, "red", 0, function (t) {
    return (this._filterUpToDate = !1), t > 255 ? 255 : t < 0 ? 0 : Math.round(t);
  }),
  ji.Factory.addGetterSetter(Bi.Node, "green", 0, function (t) {
    return (this._filterUpToDate = !1), t > 255 ? 255 : t < 0 ? 0 : Math.round(t);
  }),
  ji.Factory.addGetterSetter(Bi.Node, "blue", 0, Hi.RGBComponent, ji.Factory.afterSetFilter);
var Wi = {};
Object.defineProperty(Wi, "__esModule", { value: !0 }), (Wi.RGBA = void 0);
const zi = g,
  Ki = p,
  Yi = v;
(Wi.RGBA = function (t) {
  var e,
    n,
    r = t.data,
    i = r.length,
    a = this.red(),
    o = this.green(),
    s = this.blue(),
    c = this.alpha();
  for (e = 0; e < i; e += 4)
    (n = 1 - c), (r[e] = a * c + r[e] * n), (r[e + 1] = o * c + r[e + 1] * n), (r[e + 2] = s * c + r[e + 2] * n);
}),
  zi.Factory.addGetterSetter(Ki.Node, "red", 0, function (t) {
    return (this._filterUpToDate = !1), t > 255 ? 255 : t < 0 ? 0 : Math.round(t);
  }),
  zi.Factory.addGetterSetter(Ki.Node, "green", 0, function (t) {
    return (this._filterUpToDate = !1), t > 255 ? 255 : t < 0 ? 0 : Math.round(t);
  }),
  zi.Factory.addGetterSetter(Ki.Node, "blue", 0, Yi.RGBComponent, zi.Factory.afterSetFilter),
  zi.Factory.addGetterSetter(Ki.Node, "alpha", 1, function (t) {
    return (this._filterUpToDate = !1), t > 1 ? 1 : t < 0 ? 0 : t;
  });
var qi = {};
Object.defineProperty(qi, "__esModule", { value: !0 }), (qi.Sepia = void 0);
qi.Sepia = function (t) {
  var e,
    n,
    r,
    i,
    a = t.data,
    o = a.length;
  for (e = 0; e < o; e += 4)
    (n = a[e + 0]),
      (r = a[e + 1]),
      (i = a[e + 2]),
      (a[e + 0] = Math.min(255, 0.393 * n + 0.769 * r + 0.189 * i)),
      (a[e + 1] = Math.min(255, 0.349 * n + 0.686 * r + 0.168 * i)),
      (a[e + 2] = Math.min(255, 0.272 * n + 0.534 * r + 0.131 * i));
};
var Xi = {};
Object.defineProperty(Xi, "__esModule", { value: !0 }), (Xi.Solarize = void 0);
Xi.Solarize = function (t) {
  var e = t.data,
    n = t.width,
    r = 4 * n,
    i = t.height;
  do {
    var a = (i - 1) * r,
      o = n;
    do {
      var s = a + 4 * (o - 1),
        c = e[s],
        l = e[s + 1],
        h = e[s + 2];
      c > 127 && (c = 255 - c),
        l > 127 && (l = 255 - l),
        h > 127 && (h = 255 - h),
        (e[s] = c),
        (e[s + 1] = l),
        (e[s + 2] = h);
    } while (--o);
  } while (--i);
};
var Ji = {};
Object.defineProperty(Ji, "__esModule", { value: !0 }), (Ji.Threshold = void 0);
const Qi = g,
  Zi = p,
  ta = v;
(Ji.Threshold = function (t) {
  var e,
    n = 255 * this.threshold(),
    r = t.data,
    i = r.length;
  for (e = 0; e < i; e += 1) r[e] = r[e] < n ? 0 : 255;
}),
  Qi.Factory.addGetterSetter(Zi.Node, "threshold", 0.5, (0, ta.getNumberValidator)(), Qi.Factory.afterSetFilter),
  Object.defineProperty(h, "__esModule", { value: !0 }),
  (h.Konva = void 0);
const ea = d,
  na = Ht,
  ra = Jt,
  ia = _e,
  aa = ke,
  oa = Te,
  sa = Ge,
  ca = Qt,
  la = oe,
  ha = Qe,
  da = on,
  ua = un,
  fa = _n,
  pa = En,
  ga = Dn,
  va = Jn,
  ma = lr,
  ya = Ar,
  _a = Lr,
  ba = Br,
  Sa = Kr,
  wa = Jr,
  xa = ni,
  Ca = si,
  ka = ci,
  Ea = ui,
  Na = vi,
  Oa = mi,
  Aa = wi,
  Pa = Oi,
  Ta = Di,
  Da = Ii,
  Fa = Ui,
  Ma = Wi,
  Ra = qi,
  La = Xi,
  Ia = Ji;
h.Konva = ea.Konva.Util._assign(ea.Konva, {
  Arc: na.Arc,
  Arrow: ra.Arrow,
  Circle: ia.Circle,
  Ellipse: aa.Ellipse,
  Image: oa.Image,
  Label: sa.Label,
  Tag: sa.Tag,
  Line: ca.Line,
  Path: la.Path,
  Rect: ha.Rect,
  RegularPolygon: da.RegularPolygon,
  Ring: ua.Ring,
  Sprite: fa.Sprite,
  Star: pa.Star,
  Text: ga.Text,
  TextPath: va.TextPath,
  Transformer: ma.Transformer,
  Wedge: ya.Wedge,
  Filters: {
    Blur: _a.Blur,
    Brighten: ba.Brighten,
    Contrast: Sa.Contrast,
    Emboss: wa.Emboss,
    Enhance: xa.Enhance,
    Grayscale: Ca.Grayscale,
    HSL: ka.HSL,
    HSV: Ea.HSV,
    Invert: Na.Invert,
    Kaleidoscope: Oa.Kaleidoscope,
    Mask: Aa.Mask,
    Noise: Pa.Noise,
    Pixelate: Ta.Pixelate,
    Posterize: Da.Posterize,
    RGB: Fa.RGB,
    RGBA: Ma.RGBA,
    Sepia: Ra.Sepia,
    Solarize: La.Solarize,
    Threshold: Ia.Threshold,
  },
});
var Ga = l.exports;
Object.defineProperty(Ga, "__esModule", { value: !0 });
const $a = h;
l.exports = $a.Konva;
var Va = c(l.exports),
  Ua = {},
  ja = {
    fromCallback: function (t) {
      return Object.defineProperty(
        function (...e) {
          if ("function" != typeof e[e.length - 1])
            return new Promise((n, r) => {
              t.call(this, ...e, (t, e) => (null != t ? r(t) : n(e)));
            });
          t.apply(this, e);
        },
        "name",
        { value: t.name }
      );
    },
    fromPromise: function (t) {
      return Object.defineProperty(
        function (...e) {
          const n = e[e.length - 1];
          if ("function" != typeof n) return t.apply(this, e);
          t.apply(this, e.slice(0, -1)).then((t) => n(null, t), n);
        },
        "name",
        { value: t.name }
      );
    },
  },
  Ba = e,
  Ha = process.cwd,
  Wa = null,
  za = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function () {
  return Wa || (Wa = Ha.call(process)), Wa;
};
try {
  process.cwd();
} catch (t) {}
if ("function" == typeof process.chdir) {
  var Ka = process.chdir;
  (process.chdir = function (t) {
    (Wa = null), Ka.call(process, t);
  }),
    Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, Ka);
}
var Ya = function (t) {
  Ba.hasOwnProperty("O_SYMLINK") &&
    process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) &&
    (function (t) {
      (t.lchmod = function (e, n, r) {
        t.open(e, Ba.O_WRONLY | Ba.O_SYMLINK, n, function (e, i) {
          e
            ? r && r(e)
            : t.fchmod(i, n, function (e) {
                t.close(i, function (t) {
                  r && r(e || t);
                });
              });
        });
      }),
        (t.lchmodSync = function (e, n) {
          var r,
            i = t.openSync(e, Ba.O_WRONLY | Ba.O_SYMLINK, n),
            a = !0;
          try {
            (r = t.fchmodSync(i, n)), (a = !1);
          } finally {
            if (a)
              try {
                t.closeSync(i);
              } catch (t) {}
            else t.closeSync(i);
          }
          return r;
        });
    })(t);
  t.lutimes ||
    (function (t) {
      Ba.hasOwnProperty("O_SYMLINK") && t.futimes
        ? ((t.lutimes = function (e, n, r, i) {
            t.open(e, Ba.O_SYMLINK, function (e, a) {
              e
                ? i && i(e)
                : t.futimes(a, n, r, function (e) {
                    t.close(a, function (t) {
                      i && i(e || t);
                    });
                  });
            });
          }),
          (t.lutimesSync = function (e, n, r) {
            var i,
              a = t.openSync(e, Ba.O_SYMLINK),
              o = !0;
            try {
              (i = t.futimesSync(a, n, r)), (o = !1);
            } finally {
              if (o)
                try {
                  t.closeSync(a);
                } catch (t) {}
              else t.closeSync(a);
            }
            return i;
          }))
        : t.futimes &&
          ((t.lutimes = function (t, e, n, r) {
            r && process.nextTick(r);
          }),
          (t.lutimesSync = function () {}));
    })(t);
  (t.chown = r(t.chown)),
    (t.fchown = r(t.fchown)),
    (t.lchown = r(t.lchown)),
    (t.chmod = e(t.chmod)),
    (t.fchmod = e(t.fchmod)),
    (t.lchmod = e(t.lchmod)),
    (t.chownSync = i(t.chownSync)),
    (t.fchownSync = i(t.fchownSync)),
    (t.lchownSync = i(t.lchownSync)),
    (t.chmodSync = n(t.chmodSync)),
    (t.fchmodSync = n(t.fchmodSync)),
    (t.lchmodSync = n(t.lchmodSync)),
    (t.stat = a(t.stat)),
    (t.fstat = a(t.fstat)),
    (t.lstat = a(t.lstat)),
    (t.statSync = o(t.statSync)),
    (t.fstatSync = o(t.fstatSync)),
    (t.lstatSync = o(t.lstatSync)),
    t.chmod &&
      !t.lchmod &&
      ((t.lchmod = function (t, e, n) {
        n && process.nextTick(n);
      }),
      (t.lchmodSync = function () {}));
  t.chown &&
    !t.lchown &&
    ((t.lchown = function (t, e, n, r) {
      r && process.nextTick(r);
    }),
    (t.lchownSync = function () {}));
  "win32" === za &&
    (t.rename =
      "function" != typeof t.rename
        ? t.rename
        : (function (e) {
            function n(n, r, i) {
              var a = Date.now(),
                o = 0;
              e(n, r, function s(c) {
                if (c && ("EACCES" === c.code || "EPERM" === c.code || "EBUSY" === c.code) && Date.now() - a < 6e4)
                  return (
                    setTimeout(function () {
                      t.stat(r, function (t, a) {
                        t && "ENOENT" === t.code ? e(n, r, s) : i(c);
                      });
                    }, o),
                    void (o < 100 && (o += 10))
                  );
                i && i(c);
              });
            }
            return Object.setPrototypeOf && Object.setPrototypeOf(n, e), n;
          })(t.rename));
  function e(e) {
    return e
      ? function (n, r, i) {
          return e.call(t, n, r, function (t) {
            s(t) && (t = null), i && i.apply(this, arguments);
          });
        }
      : e;
  }
  function n(e) {
    return e
      ? function (n, r) {
          try {
            return e.call(t, n, r);
          } catch (t) {
            if (!s(t)) throw t;
          }
        }
      : e;
  }
  function r(e) {
    return e
      ? function (n, r, i, a) {
          return e.call(t, n, r, i, function (t) {
            s(t) && (t = null), a && a.apply(this, arguments);
          });
        }
      : e;
  }
  function i(e) {
    return e
      ? function (n, r, i) {
          try {
            return e.call(t, n, r, i);
          } catch (t) {
            if (!s(t)) throw t;
          }
        }
      : e;
  }
  function a(e) {
    return e
      ? function (n, r, i) {
          function a(t, e) {
            e && (e.uid < 0 && (e.uid += 4294967296), e.gid < 0 && (e.gid += 4294967296)),
              i && i.apply(this, arguments);
          }
          return "function" == typeof r && ((i = r), (r = null)), r ? e.call(t, n, r, a) : e.call(t, n, a);
        }
      : e;
  }
  function o(e) {
    return e
      ? function (n, r) {
          var i = r ? e.call(t, n, r) : e.call(t, n);
          return i && (i.uid < 0 && (i.uid += 4294967296), i.gid < 0 && (i.gid += 4294967296)), i;
        }
      : e;
  }
  function s(t) {
    return (
      !t ||
      "ENOSYS" === t.code ||
      !((process.getuid && 0 === process.getuid()) || ("EINVAL" !== t.code && "EPERM" !== t.code))
    );
  }
  (t.read =
    "function" != typeof t.read
      ? t.read
      : (function (e) {
          function n(n, r, i, a, o, s) {
            var c;
            if (s && "function" == typeof s) {
              var l = 0;
              c = function (h, d, u) {
                if (h && "EAGAIN" === h.code && l < 10) return l++, e.call(t, n, r, i, a, o, c);
                s.apply(this, arguments);
              };
            }
            return e.call(t, n, r, i, a, o, c);
          }
          return Object.setPrototypeOf && Object.setPrototypeOf(n, e), n;
        })(t.read)),
    (t.readSync =
      "function" != typeof t.readSync
        ? t.readSync
        : ((c = t.readSync),
          function (e, n, r, i, a) {
            for (var o = 0; ; )
              try {
                return c.call(t, e, n, r, i, a);
              } catch (t) {
                if ("EAGAIN" === t.code && o < 10) {
                  o++;
                  continue;
                }
                throw t;
              }
          }));
  var c;
};
var qa = n.Stream,
  Xa = function (t) {
    return {
      ReadStream: function e(n, r) {
        if (!(this instanceof e)) return new e(n, r);
        qa.call(this);
        var i = this;
        (this.path = n),
          (this.fd = null),
          (this.readable = !0),
          (this.paused = !1),
          (this.flags = "r"),
          (this.mode = 438),
          (this.bufferSize = 65536),
          (r = r || {});
        for (var a = Object.keys(r), o = 0, s = a.length; o < s; o++) {
          var c = a[o];
          this[c] = r[c];
        }
        this.encoding && this.setEncoding(this.encoding);
        if (void 0 !== this.start) {
          if ("number" != typeof this.start) throw TypeError("start must be a Number");
          if (void 0 === this.end) this.end = 1 / 0;
          else if ("number" != typeof this.end) throw TypeError("end must be a Number");
          if (this.start > this.end) throw new Error("start must be <= end");
          this.pos = this.start;
        }
        if (null !== this.fd)
          return void process.nextTick(function () {
            i._read();
          });
        t.open(this.path, this.flags, this.mode, function (t, e) {
          if (t) return i.emit("error", t), void (i.readable = !1);
          (i.fd = e), i.emit("open", e), i._read();
        });
      },
      WriteStream: function e(n, r) {
        if (!(this instanceof e)) return new e(n, r);
        qa.call(this),
          (this.path = n),
          (this.fd = null),
          (this.writable = !0),
          (this.flags = "w"),
          (this.encoding = "binary"),
          (this.mode = 438),
          (this.bytesWritten = 0),
          (r = r || {});
        for (var i = Object.keys(r), a = 0, o = i.length; a < o; a++) {
          var s = i[a];
          this[s] = r[s];
        }
        if (void 0 !== this.start) {
          if ("number" != typeof this.start) throw TypeError("start must be a Number");
          if (this.start < 0) throw new Error("start must be >= zero");
          this.pos = this.start;
        }
        (this.busy = !1),
          (this._queue = []),
          null === this.fd &&
            ((this._open = t.open),
            this._queue.push([this._open, this.path, this.flags, this.mode, void 0]),
            this.flush());
      },
    };
  };
var Ja = function (t) {
    if (null === t || "object" != typeof t) return t;
    if (t instanceof Object) var e = { __proto__: Qa(t) };
    else e = Object.create(null);
    return (
      Object.getOwnPropertyNames(t).forEach(function (n) {
        Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
      }),
      e
    );
  },
  Qa =
    Object.getPrototypeOf ||
    function (t) {
      return t.__proto__;
    };
var Za,
  to,
  eo = t,
  no = Ya,
  ro = Xa,
  io = Ja,
  ao = r;
function oo(t, e) {
  Object.defineProperty(t, Za, {
    get: function () {
      return e;
    },
  });
}
"function" == typeof Symbol && "function" == typeof Symbol.for
  ? ((Za = Symbol.for("graceful-fs.queue")), (to = Symbol.for("graceful-fs.previous")))
  : ((Za = "___graceful-fs.queue"), (to = "___graceful-fs.previous"));
var so = function () {};
if (
  (ao.debuglog
    ? (so = ao.debuglog("gfs4"))
    : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") &&
      (so = function () {
        var t = ao.format.apply(ao, arguments);
        (t = "GFS4: " + t.split(/\n/).join("\nGFS4: ")), console.error(t);
      }),
  !eo[Za])
) {
  var co = s[Za] || [];
  oo(eo, co),
    (eo.close = (function (t) {
      function e(e, n) {
        return t.call(eo, e, function (t) {
          t || po(), "function" == typeof n && n.apply(this, arguments);
        });
      }
      return Object.defineProperty(e, to, { value: t }), e;
    })(eo.close)),
    (eo.closeSync = (function (t) {
      function e(e) {
        t.apply(eo, arguments), po();
      }
      return Object.defineProperty(e, to, { value: t }), e;
    })(eo.closeSync)),
    /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") &&
      process.on("exit", function () {
        so(eo[Za]), i.equal(eo[Za].length, 0);
      });
}
s[Za] || oo(s, eo[Za]);
var lo,
  ho = uo(io(eo));
function uo(t) {
  no(t),
    (t.gracefulify = uo),
    (t.createReadStream = function (e, n) {
      return new t.ReadStream(e, n);
    }),
    (t.createWriteStream = function (e, n) {
      return new t.WriteStream(e, n);
    });
  var e = t.readFile;
  t.readFile = function (t, n, r) {
    "function" == typeof n && ((r = n), (n = null));
    return (function t(n, r, i, a) {
      return e(n, r, function (e) {
        !e || ("EMFILE" !== e.code && "ENFILE" !== e.code)
          ? "function" == typeof i && i.apply(this, arguments)
          : fo([t, [n, r, i], e, a || Date.now(), Date.now()]);
      });
    })(t, n, r);
  };
  var n = t.writeFile;
  t.writeFile = function (t, e, r, i) {
    "function" == typeof r && ((i = r), (r = null));
    return (function t(e, r, i, a, o) {
      return n(e, r, i, function (n) {
        !n || ("EMFILE" !== n.code && "ENFILE" !== n.code)
          ? "function" == typeof a && a.apply(this, arguments)
          : fo([t, [e, r, i, a], n, o || Date.now(), Date.now()]);
      });
    })(t, e, r, i);
  };
  var r = t.appendFile;
  r &&
    (t.appendFile = function (t, e, n, i) {
      "function" == typeof n && ((i = n), (n = null));
      return (function t(e, n, i, a, o) {
        return r(e, n, i, function (r) {
          !r || ("EMFILE" !== r.code && "ENFILE" !== r.code)
            ? "function" == typeof a && a.apply(this, arguments)
            : fo([t, [e, n, i, a], r, o || Date.now(), Date.now()]);
        });
      })(t, e, n, i);
    });
  var i = t.copyFile;
  i &&
    (t.copyFile = function (t, e, n, r) {
      "function" == typeof n && ((r = n), (n = 0));
      return (function t(e, n, r, a, o) {
        return i(e, n, r, function (i) {
          !i || ("EMFILE" !== i.code && "ENFILE" !== i.code)
            ? "function" == typeof a && a.apply(this, arguments)
            : fo([t, [e, n, r, a], i, o || Date.now(), Date.now()]);
        });
      })(t, e, n, r);
    });
  var a = t.readdir;
  t.readdir = function (t, e, n) {
    "function" == typeof e && ((n = e), (e = null));
    var r = o.test(process.version)
      ? function (t, e, n, r) {
          return a(t, i(t, e, n, r));
        }
      : function (t, e, n, r) {
          return a(t, e, i(t, e, n, r));
        };
    return r(t, e, n);
    function i(t, e, n, i) {
      return function (a, o) {
        !a || ("EMFILE" !== a.code && "ENFILE" !== a.code)
          ? (o && o.sort && o.sort(), "function" == typeof n && n.call(this, a, o))
          : fo([r, [t, e, n], a, i || Date.now(), Date.now()]);
      };
    }
  };
  var o = /^v[0-5]\./;
  if ("v0.8" === process.version.substr(0, 4)) {
    var s = ro(t);
    (u = s.ReadStream), (f = s.WriteStream);
  }
  var c = t.ReadStream;
  c &&
    ((u.prototype = Object.create(c.prototype)),
    (u.prototype.open = function () {
      var t = this;
      g(t.path, t.flags, t.mode, function (e, n) {
        e ? (t.autoClose && t.destroy(), t.emit("error", e)) : ((t.fd = n), t.emit("open", n), t.read());
      });
    }));
  var l = t.WriteStream;
  l &&
    ((f.prototype = Object.create(l.prototype)),
    (f.prototype.open = function () {
      var t = this;
      g(t.path, t.flags, t.mode, function (e, n) {
        e ? (t.destroy(), t.emit("error", e)) : ((t.fd = n), t.emit("open", n));
      });
    })),
    Object.defineProperty(t, "ReadStream", {
      get: function () {
        return u;
      },
      set: function (t) {
        u = t;
      },
      enumerable: !0,
      configurable: !0,
    }),
    Object.defineProperty(t, "WriteStream", {
      get: function () {
        return f;
      },
      set: function (t) {
        f = t;
      },
      enumerable: !0,
      configurable: !0,
    });
  var h = u;
  Object.defineProperty(t, "FileReadStream", {
    get: function () {
      return h;
    },
    set: function (t) {
      h = t;
    },
    enumerable: !0,
    configurable: !0,
  });
  var d = f;
  function u(t, e) {
    return this instanceof u ? (c.apply(this, arguments), this) : u.apply(Object.create(u.prototype), arguments);
  }
  function f(t, e) {
    return this instanceof f ? (l.apply(this, arguments), this) : f.apply(Object.create(f.prototype), arguments);
  }
  Object.defineProperty(t, "FileWriteStream", {
    get: function () {
      return d;
    },
    set: function (t) {
      d = t;
    },
    enumerable: !0,
    configurable: !0,
  });
  var p = t.open;
  function g(t, e, n, r) {
    return (
      "function" == typeof n && ((r = n), (n = null)),
      (function t(e, n, r, i, a) {
        return p(e, n, r, function (o, s) {
          !o || ("EMFILE" !== o.code && "ENFILE" !== o.code)
            ? "function" == typeof i && i.apply(this, arguments)
            : fo([t, [e, n, r, i], o, a || Date.now(), Date.now()]);
        });
      })(t, e, n, r)
    );
  }
  return (t.open = g), t;
}
function fo(t) {
  so("ENQUEUE", t[0].name, t[1]), eo[Za].push(t), go();
}
function po() {
  for (var t = Date.now(), e = 0; e < eo[Za].length; ++e)
    eo[Za][e].length > 2 && ((eo[Za][e][3] = t), (eo[Za][e][4] = t));
  go();
}
function go() {
  if ((clearTimeout(lo), (lo = void 0), 0 !== eo[Za].length)) {
    var t = eo[Za].shift(),
      e = t[0],
      n = t[1],
      r = t[2],
      i = t[3],
      a = t[4];
    if (void 0 === i) so("RETRY", e.name, n), e.apply(null, n);
    else if (Date.now() - i >= 6e4) {
      so("TIMEOUT", e.name, n);
      var o = n.pop();
      "function" == typeof o && o.call(null, r);
    } else {
      var s = Date.now() - a,
        c = Math.max(a - i, 1);
      s >= Math.min(1.2 * c, 100) ? (so("RETRY", e.name, n), e.apply(null, n.concat([i]))) : eo[Za].push(t);
    }
    void 0 === lo && (lo = setTimeout(go, 0));
  }
}
process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !eo.__patched && ((ho = uo(eo)), (eo.__patched = !0)),
  (function (t) {
    const e = ja.fromCallback,
      n = ho,
      r = [
        "access",
        "appendFile",
        "chmod",
        "chown",
        "close",
        "copyFile",
        "fchmod",
        "fchown",
        "fdatasync",
        "fstat",
        "fsync",
        "ftruncate",
        "futimes",
        "lchmod",
        "lchown",
        "link",
        "lstat",
        "mkdir",
        "mkdtemp",
        "open",
        "opendir",
        "readdir",
        "readFile",
        "readlink",
        "realpath",
        "rename",
        "rm",
        "rmdir",
        "stat",
        "symlink",
        "truncate",
        "unlink",
        "utimes",
        "writeFile",
      ].filter((t) => "function" == typeof n[t]);
    Object.assign(t, n),
      r.forEach((r) => {
        t[r] = e(n[r]);
      }),
      (t.exists = function (t, e) {
        return "function" == typeof e ? n.exists(t, e) : new Promise((e) => n.exists(t, e));
      }),
      (t.read = function (t, e, r, i, a, o) {
        return "function" == typeof o
          ? n.read(t, e, r, i, a, o)
          : new Promise((o, s) => {
              n.read(t, e, r, i, a, (t, e, n) => {
                if (t) return s(t);
                o({ bytesRead: e, buffer: n });
              });
            });
      }),
      (t.write = function (t, e, ...r) {
        return "function" == typeof r[r.length - 1]
          ? n.write(t, e, ...r)
          : new Promise((i, a) => {
              n.write(t, e, ...r, (t, e, n) => {
                if (t) return a(t);
                i({ bytesWritten: e, buffer: n });
              });
            });
      }),
      (t.readv = function (t, e, ...r) {
        return "function" == typeof r[r.length - 1]
          ? n.readv(t, e, ...r)
          : new Promise((i, a) => {
              n.readv(t, e, ...r, (t, e, n) => {
                if (t) return a(t);
                i({ bytesRead: e, buffers: n });
              });
            });
      }),
      (t.writev = function (t, e, ...r) {
        return "function" == typeof r[r.length - 1]
          ? n.writev(t, e, ...r)
          : new Promise((i, a) => {
              n.writev(t, e, ...r, (t, e, n) => {
                if (t) return a(t);
                i({ bytesWritten: e, buffers: n });
              });
            });
      }),
      "function" == typeof n.realpath.native
        ? (t.realpath.native = e(n.realpath.native))
        : process.emitWarning(
            "fs.realpath.native is not a function. Is fs being monkey-patched?",
            "Warning",
            "fs-extra-WARN0003"
          );
  })(Ua);
var vo = {},
  mo = {};
const yo = a;
mo.checkPath = function (t) {
  if ("win32" === process.platform) {
    if (/[<>:"|?*]/.test(t.replace(yo.parse(t).root, ""))) {
      const e = new Error(`Path contains invalid characters: ${t}`);
      throw ((e.code = "EINVAL"), e);
    }
  }
};
const _o = Ua,
  { checkPath: bo } = mo,
  So = (t) => ("number" == typeof t ? t : { mode: 511, ...t }.mode);
(vo.makeDir = async (t, e) => (bo(t), _o.mkdir(t, { mode: So(e), recursive: !0 }))),
  (vo.makeDirSync = (t, e) => (bo(t), _o.mkdirSync(t, { mode: So(e), recursive: !0 })));
const wo = ja.fromPromise,
  { makeDir: xo, makeDirSync: Co } = vo,
  ko = wo(xo);
var Eo = { mkdirs: ko, mkdirsSync: Co, mkdirp: ko, mkdirpSync: Co, ensureDir: ko, ensureDirSync: Co };
const No = ja.fromPromise,
  Oo = Ua;
var Ao = {
  pathExists: No(function (t) {
    return Oo.access(t)
      .then(() => !0)
      .catch(() => !1);
  }),
  pathExistsSync: Oo.existsSync,
};
const Po = ho;
var To = function (t, e, n, r) {
    Po.open(t, "r+", (t, i) => {
      if (t) return r(t);
      Po.futimes(i, e, n, (t) => {
        Po.close(i, (e) => {
          r && r(t || e);
        });
      });
    });
  },
  Do = function (t, e, n) {
    const r = Po.openSync(t, "r+");
    return Po.futimesSync(r, e, n), Po.closeSync(r);
  };
const Fo = Ua,
  Mo = a,
  Ro = r;
function Lo(t, e, n) {
  const r = n.dereference ? (t) => Fo.stat(t, { bigint: !0 }) : (t) => Fo.lstat(t, { bigint: !0 });
  return Promise.all([
    r(t),
    r(e).catch((t) => {
      if ("ENOENT" === t.code) return null;
      throw t;
    }),
  ]).then(([t, e]) => ({ srcStat: t, destStat: e }));
}
function Io(t, e) {
  return e.ino && e.dev && e.ino === t.ino && e.dev === t.dev;
}
function Go(t, e) {
  const n = Mo.resolve(t)
      .split(Mo.sep)
      .filter((t) => t),
    r = Mo.resolve(e)
      .split(Mo.sep)
      .filter((t) => t);
  return n.reduce((t, e, n) => t && r[n] === e, !0);
}
function $o(t, e, n) {
  return `Cannot ${n} '${t}' to a subdirectory of itself, '${e}'.`;
}
var Vo = {
  checkPaths: function (t, e, n, r, i) {
    Ro.callbackify(Lo)(t, e, r, (r, a) => {
      if (r) return i(r);
      const { srcStat: o, destStat: s } = a;
      if (s) {
        if (Io(o, s)) {
          const r = Mo.basename(t),
            a = Mo.basename(e);
          return "move" === n && r !== a && r.toLowerCase() === a.toLowerCase()
            ? i(null, { srcStat: o, destStat: s, isChangingCase: !0 })
            : i(new Error("Source and destination must not be the same."));
        }
        if (o.isDirectory() && !s.isDirectory())
          return i(new Error(`Cannot overwrite non-directory '${e}' with directory '${t}'.`));
        if (!o.isDirectory() && s.isDirectory())
          return i(new Error(`Cannot overwrite directory '${e}' with non-directory '${t}'.`));
      }
      return o.isDirectory() && Go(t, e) ? i(new Error($o(t, e, n))) : i(null, { srcStat: o, destStat: s });
    });
  },
  checkPathsSync: function (t, e, n, r) {
    const { srcStat: i, destStat: a } = (function (t, e, n) {
      let r;
      const i = n.dereference ? (t) => Fo.statSync(t, { bigint: !0 }) : (t) => Fo.lstatSync(t, { bigint: !0 }),
        a = i(t);
      try {
        r = i(e);
      } catch (t) {
        if ("ENOENT" === t.code) return { srcStat: a, destStat: null };
        throw t;
      }
      return { srcStat: a, destStat: r };
    })(t, e, r);
    if (a) {
      if (Io(i, a)) {
        const r = Mo.basename(t),
          o = Mo.basename(e);
        if ("move" === n && r !== o && r.toLowerCase() === o.toLowerCase())
          return { srcStat: i, destStat: a, isChangingCase: !0 };
        throw new Error("Source and destination must not be the same.");
      }
      if (i.isDirectory() && !a.isDirectory())
        throw new Error(`Cannot overwrite non-directory '${e}' with directory '${t}'.`);
      if (!i.isDirectory() && a.isDirectory())
        throw new Error(`Cannot overwrite directory '${e}' with non-directory '${t}'.`);
    }
    if (i.isDirectory() && Go(t, e)) throw new Error($o(t, e, n));
    return { srcStat: i, destStat: a };
  },
  checkParentPaths: function t(e, n, r, i, a) {
    const o = Mo.resolve(Mo.dirname(e)),
      s = Mo.resolve(Mo.dirname(r));
    if (s === o || s === Mo.parse(s).root) return a();
    Fo.stat(s, { bigint: !0 }, (o, c) =>
      o ? ("ENOENT" === o.code ? a() : a(o)) : Io(n, c) ? a(new Error($o(e, r, i))) : t(e, n, s, i, a)
    );
  },
  checkParentPathsSync: function t(e, n, r, i) {
    const a = Mo.resolve(Mo.dirname(e)),
      o = Mo.resolve(Mo.dirname(r));
    if (o === a || o === Mo.parse(o).root) return;
    let s;
    try {
      s = Fo.statSync(o, { bigint: !0 });
    } catch (t) {
      if ("ENOENT" === t.code) return;
      throw t;
    }
    if (Io(n, s)) throw new Error($o(e, r, i));
    return t(e, n, o, i);
  },
  isSrcSubdir: Go,
  areIdentical: Io,
};
const Uo = ho,
  jo = a,
  Bo = Eo.mkdirs,
  Ho = Ao.pathExists,
  Wo = To,
  zo = Vo;
function Ko(t, e, n, r) {
  if (!n.filter) return r(null, !0);
  Promise.resolve(n.filter(t, e)).then(
    (t) => r(null, t),
    (t) => r(t)
  );
}
function Yo(t, e, n, r, i) {
  (r.dereference ? Uo.stat : Uo.lstat)(e, (a, o) =>
    a
      ? i(a)
      : o.isDirectory()
      ? (function (t, e, n, r, i, a) {
          return e
            ? Qo(n, r, i, a)
            : (function (t, e, n, r, i) {
                Uo.mkdir(n, (a) => {
                  if (a) return i(a);
                  Qo(e, n, r, (e) => (e ? i(e) : Jo(n, t, i)));
                });
              })(t.mode, n, r, i, a);
        })(o, t, e, n, r, i)
      : o.isFile() || o.isCharacterDevice() || o.isBlockDevice()
      ? (function (t, e, n, r, i, a) {
          return e
            ? (function (t, e, n, r, i) {
                if (!r.overwrite) return r.errorOnExist ? i(new Error(`'${n}' already exists`)) : i();
                Uo.unlink(n, (a) => (a ? i(a) : qo(t, e, n, r, i)));
              })(t, n, r, i, a)
            : qo(t, n, r, i, a);
        })(o, t, e, n, r, i)
      : o.isSymbolicLink()
      ? (function (t, e, n, r, i) {
          Uo.readlink(e, (e, a) =>
            e
              ? i(e)
              : (r.dereference && (a = jo.resolve(process.cwd(), a)),
                t
                  ? void Uo.readlink(n, (t, e) =>
                      t
                        ? "EINVAL" === t.code || "UNKNOWN" === t.code
                          ? Uo.symlink(a, n, i)
                          : i(t)
                        : (r.dereference && (e = jo.resolve(process.cwd(), e)),
                          zo.isSrcSubdir(a, e)
                            ? i(new Error(`Cannot copy '${a}' to a subdirectory of itself, '${e}'.`))
                            : zo.isSrcSubdir(e, a)
                            ? i(new Error(`Cannot overwrite '${e}' with '${a}'.`))
                            : (function (t, e, n) {
                                Uo.unlink(e, (r) => (r ? n(r) : Uo.symlink(t, e, n)));
                              })(a, n, i))
                    )
                  : Uo.symlink(a, n, i))
          );
        })(t, e, n, r, i)
      : o.isSocket()
      ? i(new Error(`Cannot copy a socket file: ${e}`))
      : o.isFIFO()
      ? i(new Error(`Cannot copy a FIFO pipe: ${e}`))
      : i(new Error(`Unknown file: ${e}`))
  );
}
function qo(t, e, n, r, i) {
  Uo.copyFile(e, n, (a) =>
    a
      ? i(a)
      : r.preserveTimestamps
      ? (function (t, e, n, r) {
          if (
            (function (t) {
              return 0 == (128 & t);
            })(t)
          )
            return (function (t, e, n) {
              return Jo(t, 128 | e, n);
            })(n, t, (i) => (i ? r(i) : Xo(t, e, n, r)));
          return Xo(t, e, n, r);
        })(t.mode, e, n, i)
      : Jo(n, t.mode, i)
  );
}
function Xo(t, e, n, r) {
  !(function (t, e, n) {
    Uo.stat(t, (t, r) => (t ? n(t) : Wo(e, r.atime, r.mtime, n)));
  })(e, n, (e) => (e ? r(e) : Jo(n, t, r)));
}
function Jo(t, e, n) {
  return Uo.chmod(t, e, n);
}
function Qo(t, e, n, r) {
  Uo.readdir(t, (i, a) => (i ? r(i) : Zo(a, t, e, n, r)));
}
function Zo(t, e, n, r, i) {
  const a = t.pop();
  return a
    ? (function (t, e, n, r, i, a) {
        const o = jo.join(n, e),
          s = jo.join(r, e);
        Ko(o, s, i, (e, c) =>
          e
            ? a(e)
            : c
            ? void zo.checkPaths(o, s, "copy", i, (e, c) => {
                if (e) return a(e);
                const { destStat: l } = c;
                Yo(l, o, s, i, (e) => (e ? a(e) : Zo(t, n, r, i, a)));
              })
            : Zo(t, n, r, i, a)
        );
      })(t, a, e, n, r, i)
    : i();
}
var ts = function (t, e, n, r) {
  "function" != typeof n || r ? "function" == typeof n && (n = { filter: n }) : ((r = n), (n = {})),
    (r = r || function () {}),
    ((n = n || {}).clobber = !("clobber" in n) || !!n.clobber),
    (n.overwrite = "overwrite" in n ? !!n.overwrite : n.clobber),
    n.preserveTimestamps &&
      "ia32" === process.arch &&
      process.emitWarning(
        "Using the preserveTimestamps option in 32-bit node is not recommended;\n\n\tsee https://github.com/jprichardson/node-fs-extra/issues/269",
        "Warning",
        "fs-extra-WARN0001"
      ),
    zo.checkPaths(t, e, "copy", n, (i, a) => {
      if (i) return r(i);
      const { srcStat: o, destStat: s } = a;
      zo.checkParentPaths(t, o, e, "copy", (i) => {
        if (i) return r(i);
        Ko(t, e, n, (i, a) =>
          i
            ? r(i)
            : a
            ? void (function (t, e, n, r, i) {
                const a = jo.dirname(n);
                Ho(a, (o, s) => (o ? i(o) : s ? Yo(t, e, n, r, i) : void Bo(a, (a) => (a ? i(a) : Yo(t, e, n, r, i)))));
              })(s, t, e, n, r)
            : r()
        );
      });
    });
};
const es = ho,
  ns = a,
  rs = Eo.mkdirsSync,
  is = Do,
  as = Vo;
function os(t, e, n, r) {
  const i = (r.dereference ? es.statSync : es.lstatSync)(e);
  if (i.isDirectory())
    return (function (t, e, n, r, i) {
      return e
        ? ls(n, r, i)
        : (function (t, e, n, r) {
            return es.mkdirSync(n), ls(e, n, r), cs(n, t);
          })(t.mode, n, r, i);
    })(i, t, e, n, r);
  if (i.isFile() || i.isCharacterDevice() || i.isBlockDevice())
    return (function (t, e, n, r, i) {
      return e
        ? (function (t, e, n, r) {
            if (r.overwrite) return es.unlinkSync(n), ss(t, e, n, r);
            if (r.errorOnExist) throw new Error(`'${n}' already exists`);
          })(t, n, r, i)
        : ss(t, n, r, i);
    })(i, t, e, n, r);
  if (i.isSymbolicLink())
    return (function (t, e, n, r) {
      let i = es.readlinkSync(e);
      r.dereference && (i = ns.resolve(process.cwd(), i));
      if (t) {
        let t;
        try {
          t = es.readlinkSync(n);
        } catch (t) {
          if ("EINVAL" === t.code || "UNKNOWN" === t.code) return es.symlinkSync(i, n);
          throw t;
        }
        if ((r.dereference && (t = ns.resolve(process.cwd(), t)), as.isSrcSubdir(i, t)))
          throw new Error(`Cannot copy '${i}' to a subdirectory of itself, '${t}'.`);
        if (as.isSrcSubdir(t, i)) throw new Error(`Cannot overwrite '${t}' with '${i}'.`);
        return (function (t, e) {
          return es.unlinkSync(e), es.symlinkSync(t, e);
        })(i, n);
      }
      return es.symlinkSync(i, n);
    })(t, e, n, r);
  if (i.isSocket()) throw new Error(`Cannot copy a socket file: ${e}`);
  if (i.isFIFO()) throw new Error(`Cannot copy a FIFO pipe: ${e}`);
  throw new Error(`Unknown file: ${e}`);
}
function ss(t, e, n, r) {
  return (
    es.copyFileSync(e, n),
    r.preserveTimestamps &&
      (function (t, e, n) {
        (function (t) {
          return 0 == (128 & t);
        })(t) &&
          (function (t, e) {
            cs(t, 128 | e);
          })(n, t);
        (function (t, e) {
          const n = es.statSync(t);
          is(e, n.atime, n.mtime);
        })(e, n);
      })(t.mode, e, n),
    cs(n, t.mode)
  );
}
function cs(t, e) {
  return es.chmodSync(t, e);
}
function ls(t, e, n) {
  es.readdirSync(t).forEach((r) =>
    (function (t, e, n, r) {
      const i = ns.join(e, t),
        a = ns.join(n, t);
      if (r.filter && !r.filter(i, a)) return;
      const { destStat: o } = as.checkPathsSync(i, a, "copy", r);
      return os(o, i, a, r);
    })(r, t, e, n)
  );
}
var hs = function (t, e, n) {
  "function" == typeof n && (n = { filter: n }),
    ((n = n || {}).clobber = !("clobber" in n) || !!n.clobber),
    (n.overwrite = "overwrite" in n ? !!n.overwrite : n.clobber),
    n.preserveTimestamps &&
      "ia32" === process.arch &&
      process.emitWarning(
        "Using the preserveTimestamps option in 32-bit node is not recommended;\n\n\tsee https://github.com/jprichardson/node-fs-extra/issues/269",
        "Warning",
        "fs-extra-WARN0002"
      );
  const { srcStat: r, destStat: i } = as.checkPathsSync(t, e, "copy", n);
  if ((as.checkParentPathsSync(t, r, e, "copy"), n.filter && !n.filter(t, e))) return;
  const a = ns.dirname(e);
  return es.existsSync(a) || rs(a), os(i, t, e, n);
};
var ds = { copy: (0, ja.fromCallback)(ts), copySync: hs };
const us = ho;
var fs = {
  remove: (0, ja.fromCallback)(function (t, e) {
    us.rm(t, { recursive: !0, force: !0 }, e);
  }),
  removeSync: function (t) {
    us.rmSync(t, { recursive: !0, force: !0 });
  },
};
const ps = ja.fromPromise,
  gs = Ua,
  vs = a,
  ms = Eo,
  ys = fs,
  _s = ps(async function (t) {
    let e;
    try {
      e = await gs.readdir(t);
    } catch {
      return ms.mkdirs(t);
    }
    return Promise.all(e.map((e) => ys.remove(vs.join(t, e))));
  });
function bs(t) {
  let e;
  try {
    e = gs.readdirSync(t);
  } catch {
    return ms.mkdirsSync(t);
  }
  e.forEach((e) => {
    (e = vs.join(t, e)), ys.removeSync(e);
  });
}
var Ss = { emptyDirSync: bs, emptydirSync: bs, emptyDir: _s, emptydir: _s };
const ws = ja.fromCallback,
  xs = a,
  Cs = ho,
  ks = Eo;
var Es = {
  createFile: ws(function (t, e) {
    function n() {
      Cs.writeFile(t, "", (t) => {
        if (t) return e(t);
        e();
      });
    }
    Cs.stat(t, (r, i) => {
      if (!r && i.isFile()) return e();
      const a = xs.dirname(t);
      Cs.stat(a, (t, r) => {
        if (t)
          return "ENOENT" === t.code
            ? ks.mkdirs(a, (t) => {
                if (t) return e(t);
                n();
              })
            : e(t);
        r.isDirectory()
          ? n()
          : Cs.readdir(a, (t) => {
              if (t) return e(t);
            });
      });
    });
  }),
  createFileSync: function (t) {
    let e;
    try {
      e = Cs.statSync(t);
    } catch {}
    if (e && e.isFile()) return;
    const n = xs.dirname(t);
    try {
      Cs.statSync(n).isDirectory() || Cs.readdirSync(n);
    } catch (t) {
      if (!t || "ENOENT" !== t.code) throw t;
      ks.mkdirsSync(n);
    }
    Cs.writeFileSync(t, "");
  },
};
const Ns = ja.fromCallback,
  Os = a,
  As = ho,
  Ps = Eo,
  Ts = Ao.pathExists,
  { areIdentical: Ds } = Vo;
var Fs = {
  createLink: Ns(function (t, e, n) {
    function r(t, e) {
      As.link(t, e, (t) => {
        if (t) return n(t);
        n(null);
      });
    }
    As.lstat(e, (i, a) => {
      As.lstat(t, (i, o) => {
        if (i) return (i.message = i.message.replace("lstat", "ensureLink")), n(i);
        if (a && Ds(o, a)) return n(null);
        const s = Os.dirname(e);
        Ts(s, (i, a) =>
          i
            ? n(i)
            : a
            ? r(t, e)
            : void Ps.mkdirs(s, (i) => {
                if (i) return n(i);
                r(t, e);
              })
        );
      });
    });
  }),
  createLinkSync: function (t, e) {
    let n;
    try {
      n = As.lstatSync(e);
    } catch {}
    try {
      const e = As.lstatSync(t);
      if (n && Ds(e, n)) return;
    } catch (t) {
      throw ((t.message = t.message.replace("lstat", "ensureLink")), t);
    }
    const r = Os.dirname(e);
    return As.existsSync(r) || Ps.mkdirsSync(r), As.linkSync(t, e);
  },
};
const Ms = a,
  Rs = ho,
  Ls = Ao.pathExists;
var Is = {
  symlinkPaths: function (t, e, n) {
    if (Ms.isAbsolute(t))
      return Rs.lstat(t, (e) =>
        e ? ((e.message = e.message.replace("lstat", "ensureSymlink")), n(e)) : n(null, { toCwd: t, toDst: t })
      );
    {
      const r = Ms.dirname(e),
        i = Ms.join(r, t);
      return Ls(i, (e, a) =>
        e
          ? n(e)
          : a
          ? n(null, { toCwd: i, toDst: t })
          : Rs.lstat(t, (e) =>
              e
                ? ((e.message = e.message.replace("lstat", "ensureSymlink")), n(e))
                : n(null, { toCwd: t, toDst: Ms.relative(r, t) })
            )
      );
    }
  },
  symlinkPathsSync: function (t, e) {
    let n;
    if (Ms.isAbsolute(t)) {
      if (((n = Rs.existsSync(t)), !n)) throw new Error("absolute srcpath does not exist");
      return { toCwd: t, toDst: t };
    }
    {
      const r = Ms.dirname(e),
        i = Ms.join(r, t);
      if (((n = Rs.existsSync(i)), n)) return { toCwd: i, toDst: t };
      if (((n = Rs.existsSync(t)), !n)) throw new Error("relative srcpath does not exist");
      return { toCwd: t, toDst: Ms.relative(r, t) };
    }
  },
};
const Gs = ho;
var $s = {
  symlinkType: function (t, e, n) {
    if (((n = "function" == typeof e ? e : n), (e = "function" != typeof e && e))) return n(null, e);
    Gs.lstat(t, (t, r) => {
      if (t) return n(null, "file");
      (e = r && r.isDirectory() ? "dir" : "file"), n(null, e);
    });
  },
  symlinkTypeSync: function (t, e) {
    let n;
    if (e) return e;
    try {
      n = Gs.lstatSync(t);
    } catch {
      return "file";
    }
    return n && n.isDirectory() ? "dir" : "file";
  },
};
const Vs = ja.fromCallback,
  Us = a,
  js = Ua,
  Bs = Eo.mkdirs,
  Hs = Eo.mkdirsSync,
  Ws = Is.symlinkPaths,
  zs = Is.symlinkPathsSync,
  Ks = $s.symlinkType,
  Ys = $s.symlinkTypeSync,
  qs = Ao.pathExists,
  { areIdentical: Xs } = Vo;
function Js(t, e, n, r) {
  Ws(t, e, (i, a) => {
    if (i) return r(i);
    (t = a.toDst),
      Ks(a.toCwd, n, (n, i) => {
        if (n) return r(n);
        const a = Us.dirname(e);
        qs(a, (n, o) =>
          n
            ? r(n)
            : o
            ? js.symlink(t, e, i, r)
            : void Bs(a, (n) => {
                if (n) return r(n);
                js.symlink(t, e, i, r);
              })
        );
      });
  });
}
var Qs = {
  createSymlink: Vs(function (t, e, n, r) {
    (r = "function" == typeof n ? n : r),
      (n = "function" != typeof n && n),
      js.lstat(e, (i, a) => {
        !i && a.isSymbolicLink()
          ? Promise.all([js.stat(t), js.stat(e)]).then(([i, a]) => {
              if (Xs(i, a)) return r(null);
              Js(t, e, n, r);
            })
          : Js(t, e, n, r);
      });
  }),
  createSymlinkSync: function (t, e, n) {
    let r;
    try {
      r = js.lstatSync(e);
    } catch {}
    if (r && r.isSymbolicLink()) {
      const n = js.statSync(t),
        r = js.statSync(e);
      if (Xs(n, r)) return;
    }
    const i = zs(t, e);
    (t = i.toDst), (n = Ys(i.toCwd, n));
    const a = Us.dirname(e);
    return js.existsSync(a) || Hs(a), js.symlinkSync(t, e, n);
  },
};
const { createFile: Zs, createFileSync: tc } = Es,
  { createLink: ec, createLinkSync: nc } = Fs,
  { createSymlink: rc, createSymlinkSync: ic } = Qs;
var ac = {
  createFile: Zs,
  createFileSync: tc,
  ensureFile: Zs,
  ensureFileSync: tc,
  createLink: ec,
  createLinkSync: nc,
  ensureLink: ec,
  ensureLinkSync: nc,
  createSymlink: rc,
  createSymlinkSync: ic,
  ensureSymlink: rc,
  ensureSymlinkSync: ic,
};
var oc = {
  stringify: function (t, { EOL: e = "\n", finalEOL: n = !0, replacer: r = null, spaces: i } = {}) {
    const a = n ? e : "";
    return JSON.stringify(t, r, i).replace(/\n/g, e) + a;
  },
  stripBom: function (t) {
    return Buffer.isBuffer(t) && (t = t.toString("utf8")), t.replace(/^\uFEFF/, "");
  },
};
let sc;
try {
  sc = ho;
} catch (e) {
  sc = t;
}
const cc = ja,
  { stringify: lc, stripBom: hc } = oc;
const dc = cc.fromPromise(async function (t, e = {}) {
  "string" == typeof e && (e = { encoding: e });
  const n = e.fs || sc,
    r = !("throws" in e) || e.throws;
  let i,
    a = await cc.fromCallback(n.readFile)(t, e);
  a = hc(a);
  try {
    i = JSON.parse(a, e ? e.reviver : null);
  } catch (e) {
    if (r) throw ((e.message = `${t}: ${e.message}`), e);
    return null;
  }
  return i;
});
const uc = cc.fromPromise(async function (t, e, n = {}) {
  const r = n.fs || sc,
    i = lc(e, n);
  await cc.fromCallback(r.writeFile)(t, i, n);
});
const fc = {
  readFile: dc,
  readFileSync: function (t, e = {}) {
    "string" == typeof e && (e = { encoding: e });
    const n = e.fs || sc,
      r = !("throws" in e) || e.throws;
    try {
      let r = n.readFileSync(t, e);
      return (r = hc(r)), JSON.parse(r, e.reviver);
    } catch (e) {
      if (r) throw ((e.message = `${t}: ${e.message}`), e);
      return null;
    }
  },
  writeFile: uc,
  writeFileSync: function (t, e, n = {}) {
    const r = n.fs || sc,
      i = lc(e, n);
    return r.writeFileSync(t, i, n);
  },
};
var pc = {
  readJson: fc.readFile,
  readJsonSync: fc.readFileSync,
  writeJson: fc.writeFile,
  writeJsonSync: fc.writeFileSync,
};
const gc = ja.fromCallback,
  vc = ho,
  mc = a,
  yc = Eo,
  _c = Ao.pathExists;
var bc = {
  outputFile: gc(function (t, e, n, r) {
    "function" == typeof n && ((r = n), (n = "utf8"));
    const i = mc.dirname(t);
    _c(i, (a, o) =>
      a
        ? r(a)
        : o
        ? vc.writeFile(t, e, n, r)
        : void yc.mkdirs(i, (i) => {
            if (i) return r(i);
            vc.writeFile(t, e, n, r);
          })
    );
  }),
  outputFileSync: function (t, ...e) {
    const n = mc.dirname(t);
    if (vc.existsSync(n)) return vc.writeFileSync(t, ...e);
    yc.mkdirsSync(n), vc.writeFileSync(t, ...e);
  },
};
const { stringify: Sc } = oc,
  { outputFile: wc } = bc;
var xc = async function (t, e, n = {}) {
  const r = Sc(e, n);
  await wc(t, r, n);
};
const { stringify: Cc } = oc,
  { outputFileSync: kc } = bc;
var Ec = function (t, e, n) {
  const r = Cc(e, n);
  kc(t, r, n);
};
const Nc = ja.fromPromise,
  Oc = pc;
(Oc.outputJson = Nc(xc)),
  (Oc.outputJsonSync = Ec),
  (Oc.outputJSON = Oc.outputJson),
  (Oc.outputJSONSync = Oc.outputJsonSync),
  (Oc.writeJSON = Oc.writeJson),
  (Oc.writeJSONSync = Oc.writeJsonSync),
  (Oc.readJSON = Oc.readJson),
  (Oc.readJSONSync = Oc.readJsonSync);
var Ac = Oc;
const Pc = ho,
  Tc = a,
  Dc = ds.copy,
  Fc = fs.remove,
  Mc = Eo.mkdirp,
  Rc = Ao.pathExists,
  Lc = Vo;
function Ic(t, e, n, r, i) {
  return r
    ? Gc(t, e, n, i)
    : n
    ? Fc(e, (r) => (r ? i(r) : Gc(t, e, n, i)))
    : void Rc(e, (r, a) => (r ? i(r) : a ? i(new Error("dest already exists.")) : Gc(t, e, n, i)));
}
function Gc(t, e, n, r) {
  Pc.rename(t, e, (i) =>
    i
      ? "EXDEV" !== i.code
        ? r(i)
        : (function (t, e, n, r) {
            const i = { overwrite: n, errorOnExist: !0, preserveTimestamps: !0 };
            Dc(t, e, i, (e) => (e ? r(e) : Fc(t, r)));
          })(t, e, n, r)
      : r()
  );
}
var $c = function (t, e, n, r) {
  "function" == typeof n && ((r = n), (n = {}));
  const i = (n = n || {}).overwrite || n.clobber || !1;
  Lc.checkPaths(t, e, "move", n, (n, a) => {
    if (n) return r(n);
    const { srcStat: o, isChangingCase: s = !1 } = a;
    Lc.checkParentPaths(t, o, e, "move", (n) =>
      n
        ? r(n)
        : (function (t) {
            const e = Tc.dirname(t);
            return Tc.parse(e).root === e;
          })(e)
        ? Ic(t, e, i, s, r)
        : void Mc(Tc.dirname(e), (n) => (n ? r(n) : Ic(t, e, i, s, r)))
    );
  });
};
const Vc = ho,
  Uc = a,
  jc = ds.copySync,
  Bc = fs.removeSync,
  Hc = Eo.mkdirpSync,
  Wc = Vo;
function zc(t, e, n) {
  try {
    Vc.renameSync(t, e);
  } catch (r) {
    if ("EXDEV" !== r.code) throw r;
    return (function (t, e, n) {
      const r = { overwrite: n, errorOnExist: !0, preserveTimestamps: !0 };
      return jc(t, e, r), Bc(t);
    })(t, e, n);
  }
}
var Kc = function (t, e, n) {
  const r = (n = n || {}).overwrite || n.clobber || !1,
    { srcStat: i, isChangingCase: a = !1 } = Wc.checkPathsSync(t, e, "move", n);
  return (
    Wc.checkParentPathsSync(t, i, e, "move"),
    (function (t) {
      const e = Uc.dirname(t);
      return Uc.parse(e).root === e;
    })(e) || Hc(Uc.dirname(e)),
    (function (t, e, n, r) {
      if (r) return zc(t, e, n);
      if (n) return Bc(e), zc(t, e, n);
      if (Vc.existsSync(e)) throw new Error("dest already exists.");
      return zc(t, e, n);
    })(t, e, r, a)
  );
};
var Yc = { move: (0, ja.fromCallback)($c), moveSync: Kc },
  qc = { ...Ua, ...ds, ...Ss, ...ac, ...Ac, ...Eo, ...Yc, ...bc, ...Ao, ...fs },
  Xc = o({ __proto__: null, default: c(qc) }, [qc]),
  Jc = Object.freeze({});
function Qc(t) {
  return null == t;
}
function Zc(t) {
  return null != t;
}
function tl(t) {
  return !0 === t;
}
function el(t) {
  return "string" == typeof t || "number" == typeof t || "symbol" == typeof t || "boolean" == typeof t;
}
function nl(t) {
  return null !== t && "object" == typeof t;
}
var rl = Object.prototype.toString;
function il(t) {
  return rl.call(t).slice(8, -1);
}
function al(t) {
  return "[object Object]" === rl.call(t);
}
function ol(t) {
  return "[object RegExp]" === rl.call(t);
}
function sl(t) {
  var e = parseFloat(String(t));
  return 0 <= e && Math.floor(e) === e && isFinite(t);
}
function cl(t) {
  return Zc(t) && "function" == typeof t.then && "function" == typeof t.catch;
}
function ll(t) {
  return null == t ? "" : Array.isArray(t) || (al(t) && t.toString === rl) ? JSON.stringify(t, null, 2) : String(t);
}
function hl(t) {
  var e = parseFloat(t);
  return isNaN(e) ? t : e;
}
function dl(t, e) {
  for (var n = Object.create(null), r = t.split(","), i = 0; i < r.length; i++) n[r[i]] = !0;
  return e
    ? function (t) {
        return n[t.toLowerCase()];
      }
    : function (t) {
        return n[t];
      };
}
var ul = dl("slot,component", !0),
  fl = dl("key,ref,slot,slot-scope,is");
function pl(t, e) {
  if (t.length && -1 < (e = t.indexOf(e))) return t.splice(e, 1);
}
var gl = Object.prototype.hasOwnProperty;
function vl(t, e) {
  return gl.call(t, e);
}
function ml(t) {
  var e = Object.create(null);
  return function (n) {
    return e[n] || (e[n] = t(n));
  };
}
var yl = /-(\w)/g,
  _l = ml(function (t) {
    return t.replace(yl, function (t, e) {
      return e ? e.toUpperCase() : "";
    });
  }),
  bl = ml(function (t) {
    return t.charAt(0).toUpperCase() + t.slice(1);
  }),
  Sl = /\B([A-Z])/g,
  wl = ml(function (t) {
    return t.replace(Sl, "-$1").toLowerCase();
  });
var xl = Function.prototype.bind
  ? function (t, e) {
      return t.bind(e);
    }
  : function (t, e) {
      function n(n) {
        var r = arguments.length;
        return r ? (1 < r ? t.apply(e, arguments) : t.call(e, n)) : t.call(e);
      }
      return (n._length = t.length), n;
    };
function Cl(t, e) {
  for (var n = t.length - (e = e || 0), r = new Array(n); n--; ) r[n] = t[n + e];
  return r;
}
function kl(t, e) {
  for (var n in e) t[n] = e[n];
  return t;
}
function El(t) {
  for (var e = {}, n = 0; n < t.length; n++) t[n] && kl(e, t[n]);
  return e;
}
function Nl(t, e, n) {}
var Ol = function (t, e, n) {
    return !1;
  },
  Al = function (t) {
    return t;
  };
function Pl(t, e) {
  if (t === e) return !0;
  var n = nl(t),
    r = nl(e);
  if (!n || !r) return !n && !r && String(t) === String(e);
  try {
    var i = Array.isArray(t),
      a = Array.isArray(e);
    if (i && a)
      return (
        t.length === e.length &&
        t.every(function (t, n) {
          return Pl(t, e[n]);
        })
      );
    if (t instanceof Date && e instanceof Date) return t.getTime() === e.getTime();
    if (i || a) return !1;
    var o = Object.keys(t),
      s = Object.keys(e);
    return (
      o.length === s.length &&
      o.every(function (n) {
        return Pl(t[n], e[n]);
      })
    );
  } catch (n) {
    return !1;
  }
}
function Tl(t, e) {
  for (var n = 0; n < t.length; n++) if (Pl(t[n], e)) return n;
  return -1;
}
function Dl(t) {
  var e = !1;
  return function () {
    e || ((e = !0), t.apply(this, arguments));
  };
}
var Fl = "data-server-rendered",
  Ml = ["component", "directive", "filter"],
  Rl = [
    "beforeCreate",
    "created",
    "beforeMount",
    "mounted",
    "beforeUpdate",
    "updated",
    "beforeDestroy",
    "destroyed",
    "activated",
    "deactivated",
    "errorCaptured",
    "serverPrefetch",
  ],
  Ll = {
    optionMergeStrategies: Object.create(null),
    silent: !1,
    productionTip: "production" !== process.env.NODE_ENV,
    devtools: "production" !== process.env.NODE_ENV,
    performance: !1,
    errorHandler: null,
    warnHandler: null,
    ignoredElements: [],
    keyCodes: Object.create(null),
    isReservedTag: Ol,
    isReservedAttr: Ol,
    isUnknownElement: Ol,
    getTagNamespace: Nl,
    parsePlatformTagName: Al,
    mustUseProp: Ol,
    async: !0,
    _lifecycleHooks: Rl,
  },
  Il =
    /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
function Gl(t) {
  return 36 === (t = (t + "").charCodeAt(0)) || 95 === t;
}
function $l(t, e, n, r) {
  Object.defineProperty(t, e, { value: n, enumerable: !!r, writable: !0, configurable: !0 });
}
var Vl = new RegExp("[^" + Il.source + ".$_\\d]");
var Ul,
  jl = "__proto__" in {},
  Bl = "undefined" != typeof window,
  Hl = "undefined" != typeof WXEnvironment && !!WXEnvironment.platform,
  Wl = Hl && WXEnvironment.platform.toLowerCase(),
  zl = Bl && window.navigator.userAgent.toLowerCase(),
  Kl = zl && /msie|trident/.test(zl),
  Yl = zl && 0 < zl.indexOf("msie 9.0"),
  ql = zl && 0 < zl.indexOf("edge/");
zl && zl.indexOf("android");
var Xl = (zl && /iphone|ipad|ipod|ios/.test(zl)) || "ios" === Wl,
  Jl = zl && zl.match(/firefox\/(\d+)/),
  Ql = {}.watch,
  Zl = !1;
if (Bl)
  try {
    var th = {};
    Object.defineProperty(th, "passive", {
      get: function () {
        Zl = !0;
      },
    }),
      window.addEventListener("test-passive", null, th);
  } catch (t) {}
var eh = function () {
    return (Ul =
      void 0 === Ul
        ? !Bl && !Hl && "undefined" != typeof global && global.process && "server" === global.process.env.VUE_ENV
        : Ul);
  },
  nh = Bl && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
function rh(t) {
  return "function" == typeof t && /native code/.test(t.toString());
}
var ih,
  ah,
  oh,
  sh,
  ch = "undefined" != typeof Symbol && rh(Symbol) && "undefined" != typeof Reflect && rh(Reflect.ownKeys),
  lh =
    "undefined" != typeof Set && rh(Set)
      ? Set
      : (function () {
          function t() {
            this.set = Object.create(null);
          }
          return (
            (t.prototype.has = function (t) {
              return !0 === this.set[t];
            }),
            (t.prototype.add = function (t) {
              this.set[t] = !0;
            }),
            (t.prototype.clear = function () {
              this.set = Object.create(null);
            }),
            t
          );
        })(),
  hh = Nl,
  dh = Nl,
  uh = Nl,
  fh = Nl;
"production" !== process.env.NODE_ENV &&
  ((ih = "undefined" != typeof console),
  (ah = /(?:^|[-_])(\w)/g),
  (oh = function (t) {
    return t
      .replace(ah, function (t) {
        return t.toUpperCase();
      })
      .replace(/[-_]/g, "");
  }),
  (hh = function (t, e) {
    var n = e ? uh(e) : "";
    ih && !Ll.silent && console.error("[Vue warn]: " + t + n);
  }),
  (dh = function (t, e) {
    ih && !Ll.silent && console.warn("[Vue tip]: " + t + (e ? uh(e) : ""));
  }),
  (fh = function (t, e) {
    if (t.$root === t) return "<Root>";
    var n = "function" == typeof t && null != t.cid ? t.options : t._isVue ? t.$options || t.constructor.options : t,
      r = n.name || n._componentTag;
    t = n.__file;
    return (
      ((r = !r && t ? (n = t.match(/([^/\\]+)\.vue$/)) && n[1] : r) ? "<" + oh(r) + ">" : "<Anonymous>") +
      (t && !1 !== e ? " at " + t : "")
    );
  }),
  (sh = function (t, e) {
    for (var n = ""; e; ) e % 2 == 1 && (n += t), 1 < e && (t += t), (e >>= 1);
    return n;
  }),
  (uh = function (t) {
    if (t._isVue && t.$parent) {
      for (var e = [], n = 0; t; ) {
        if (0 < e.length) {
          var r = e[e.length - 1];
          if (r.constructor === t.constructor) {
            n++, (t = t.$parent);
            continue;
          }
          0 < n && ((e[e.length - 1] = [r, n]), (n = 0));
        }
        e.push(t), (t = t.$parent);
      }
      return (
        "\n\nfound in\n\n" +
        e
          .map(function (t, e) {
            return (
              "" +
              (0 === e ? "---\x3e " : sh(" ", 5 + 2 * e)) +
              (Array.isArray(t) ? fh(t[0]) + "... (" + t[1] + " recursive calls)" : fh(t))
            );
          })
          .join("\n")
      );
    }
    return "\n\n(found in " + fh(t) + ")";
  }));
var ph = 0,
  gh = function () {
    (this.id = ph++), (this.subs = []);
  };
(gh.prototype.addSub = function (t) {
  this.subs.push(t);
}),
  (gh.prototype.removeSub = function (t) {
    pl(this.subs, t);
  }),
  (gh.prototype.depend = function () {
    gh.target && gh.target.addDep(this);
  }),
  (gh.prototype.notify = function () {
    var t = this.subs.slice();
    "production" === process.env.NODE_ENV ||
      Ll.async ||
      t.sort(function (t, e) {
        return t.id - e.id;
      });
    for (var e = 0, n = t.length; e < n; e++) t[e].update();
  }),
  (gh.target = null);
var vh = [];
function mh(t) {
  vh.push(t), (gh.target = t);
}
function yh() {
  vh.pop(), (gh.target = vh[vh.length - 1]);
}
var _h = function (t, e, n, r, i, a, o, s) {
    (this.tag = t),
      (this.data = e),
      (this.children = n),
      (this.text = r),
      (this.elm = i),
      (this.ns = void 0),
      (this.context = a),
      (this.fnContext = void 0),
      (this.fnOptions = void 0),
      (this.fnScopeId = void 0),
      (this.key = e && e.key),
      (this.componentOptions = o),
      (this.componentInstance = void 0),
      (this.parent = void 0),
      (this.raw = !1),
      (this.isStatic = !1),
      (this.isRootInsert = !0),
      (this.isComment = !1),
      (this.isCloned = !1),
      (this.isOnce = !1),
      (this.asyncFactory = s),
      (this.asyncMeta = void 0),
      (this.isAsyncPlaceholder = !1);
  },
  bh = { child: { configurable: !0 } };
(bh.child.get = function () {
  return this.componentInstance;
}),
  Object.defineProperties(_h.prototype, bh);
var Sh = function (t) {
  void 0 === t && (t = "");
  var e = new _h();
  return (e.text = t), (e.isComment = !0), e;
};
function wh(t) {
  return new _h(void 0, void 0, void 0, String(t));
}
function xh(t) {
  var e = new _h(
    t.tag,
    t.data,
    t.children && t.children.slice(),
    t.text,
    t.elm,
    t.context,
    t.componentOptions,
    t.asyncFactory
  );
  return (
    (e.ns = t.ns),
    (e.isStatic = t.isStatic),
    (e.key = t.key),
    (e.isComment = t.isComment),
    (e.fnContext = t.fnContext),
    (e.fnOptions = t.fnOptions),
    (e.fnScopeId = t.fnScopeId),
    (e.asyncMeta = t.asyncMeta),
    (e.isCloned = !0),
    e
  );
}
var Ch = Array.prototype,
  kh = Object.create(Ch);
["push", "pop", "shift", "unshift", "splice", "sort", "reverse"].forEach(function (t) {
  var e = Ch[t];
  $l(kh, t, function () {
    for (var n = [], r = arguments.length; r--; ) n[r] = arguments[r];
    var i,
      a = e.apply(this, n),
      o = this.__ob__;
    switch (t) {
      case "push":
      case "unshift":
        i = n;
        break;
      case "splice":
        i = n.slice(2);
    }
    return i && o.observeArray(i), o.dep.notify(), a;
  });
});
var Eh = Object.getOwnPropertyNames(kh),
  Nh = !0;
function Oh(t) {
  Nh = t;
}
var Ah = function (t) {
  (this.value = t),
    (this.dep = new gh()),
    (this.vmCount = 0),
    $l(t, "__ob__", this),
    Array.isArray(t)
      ? (jl
          ? (function (t, e) {
              t.__proto__ = e;
            })(t, kh)
          : (function (t, e, n) {
              for (var r = 0, i = n.length; r < i; r++) {
                var a = n[r];
                $l(t, a, e[a]);
              }
            })(t, kh, Eh),
        this.observeArray(t))
      : this.walk(t);
};
function Ph(t, e) {
  var n;
  if (nl(t) && !(t instanceof _h))
    return (
      vl(t, "__ob__") && t.__ob__ instanceof Ah
        ? (n = t.__ob__)
        : Nh && !eh() && (Array.isArray(t) || al(t)) && Object.isExtensible(t) && !t._isVue && (n = new Ah(t)),
      e && n && n.vmCount++,
      n
    );
}
function Th(t, e, n, r, i) {
  var a,
    o,
    s,
    c = new gh(),
    l = Object.getOwnPropertyDescriptor(t, e);
  (l && !1 === l.configurable) ||
    ((a = l && l.get),
    (o = l && l.set),
    (a && !o) || 2 !== arguments.length || (n = t[e]),
    (s = !i && Ph(n)),
    Object.defineProperty(t, e, {
      enumerable: !0,
      configurable: !0,
      get: function () {
        var e = a ? a.call(t) : n;
        return gh.target && (c.depend(), s && (s.dep.depend(), Array.isArray(e) && Mh(e))), e;
      },
      set: function (e) {
        var l = a ? a.call(t) : n;
        e === l ||
          (e != e && l != l) ||
          ("production" !== process.env.NODE_ENV && r && r(),
          (a && !o) || (o ? o.call(t, e) : (n = e), (s = !i && Ph(e)), c.notify()));
      },
    }));
}
function Dh(t, e, n) {
  if (
    ("production" !== process.env.NODE_ENV &&
      (Qc(t) || el(t)) &&
      hh("Cannot set reactive property on undefined, null, or primitive value: " + t),
    Array.isArray(t) && sl(e))
  )
    return (t.length = Math.max(t.length, e)), t.splice(e, 1, n), n;
  if (e in t && !(e in Object.prototype)) return (t[e] = n);
  var r = t.__ob__;
  return t._isVue || (r && r.vmCount)
    ? ("production" !== process.env.NODE_ENV &&
        hh(
          "Avoid adding reactive properties to a Vue instance or its root $data at runtime - declare it upfront in the data option."
        ),
      n)
    : r
    ? (Th(r.value, e, n), r.dep.notify(), n)
    : (t[e] = n);
}
function Fh(t, e) {
  var n;
  "production" !== process.env.NODE_ENV &&
    (Qc(t) || el(t)) &&
    hh("Cannot delete reactive property on undefined, null, or primitive value: " + t),
    Array.isArray(t) && sl(e)
      ? t.splice(e, 1)
      : ((n = t.__ob__),
        t._isVue || (n && n.vmCount)
          ? "production" !== process.env.NODE_ENV &&
            hh("Avoid deleting properties on a Vue instance or its root $data - just set it to null.")
          : vl(t, e) && (delete t[e], n && n.dep.notify()));
}
function Mh(t) {
  for (var e = void 0, n = 0, r = t.length; n < r; n++)
    (e = t[n]) && e.__ob__ && e.__ob__.dep.depend(), Array.isArray(e) && Mh(e);
}
(Ah.prototype.walk = function (t) {
  for (var e = Object.keys(t), n = 0; n < e.length; n++) Th(t, e[n]);
}),
  (Ah.prototype.observeArray = function (t) {
    for (var e = 0, n = t.length; e < n; e++) Ph(t[e]);
  });
var Rh = Ll.optionMergeStrategies;
function Lh(t, e) {
  if (!e) return t;
  for (var n, r, i, a = ch ? Reflect.ownKeys(e) : Object.keys(e), o = 0; o < a.length; o++)
    "__ob__" !== (n = a[o]) && ((r = t[n]), (i = e[n]), vl(t, n) ? r !== i && al(r) && al(i) && Lh(r, i) : Dh(t, n, i));
  return t;
}
function Ih(t, e, n) {
  return n
    ? function () {
        var r = "function" == typeof e ? e.call(n, n) : e,
          i = "function" == typeof t ? t.call(n, n) : t;
        return r ? Lh(r, i) : i;
      }
    : e
    ? t
      ? function () {
          return Lh("function" == typeof e ? e.call(this, this) : e, "function" == typeof t ? t.call(this, this) : t);
        }
      : e
    : t;
}
function Gh(t, e) {
  return (
    (t = e ? (t ? t.concat(e) : Array.isArray(e) ? e : [e]) : t) &&
    (function (t) {
      for (var e = [], n = 0; n < t.length; n++) -1 === e.indexOf(t[n]) && e.push(t[n]);
      return e;
    })(t)
  );
}
function $h(t, e, n, r) {
  return (t = Object.create(t || null)), e ? ("production" !== process.env.NODE_ENV && jh(r, e, n), kl(t, e)) : t;
}
"production" !== process.env.NODE_ENV &&
  (Rh.el = Rh.propsData =
    function (t, e, n, r) {
      return n || hh('option "' + r + '" can only be used during instance creation with the `new` keyword.'), Vh(t, e);
    }),
  (Rh.data = function (t, e, n) {
    return n
      ? Ih(t, e, n)
      : e && "function" != typeof e
      ? ("production" !== process.env.NODE_ENV &&
          hh('The "data" option should be a function that returns a per-instance value in component definitions.', n),
        t)
      : Ih(t, e);
  }),
  Rl.forEach(function (t) {
    Rh[t] = Gh;
  }),
  Ml.forEach(function (t) {
    Rh[t + "s"] = $h;
  }),
  (Rh.watch = function (t, e, n, r) {
    if ((t === Ql && (t = void 0), !(e = e === Ql ? void 0 : e))) return Object.create(t || null);
    if (("production" !== process.env.NODE_ENV && jh(r, e, n), !t)) return e;
    var i,
      a = {};
    for (i in (kl(a, t), e)) {
      var o = a[i],
        s = e[i];
      o && !Array.isArray(o) && (o = [o]), (a[i] = o ? o.concat(s) : Array.isArray(s) ? s : [s]);
    }
    return a;
  }),
  (Rh.props =
    Rh.methods =
    Rh.inject =
    Rh.computed =
      function (t, e, n, r) {
        return (
          e && "production" !== process.env.NODE_ENV && jh(r, e, n),
          t ? (kl((n = Object.create(null)), t), e && kl(n, e), n) : e
        );
      }),
  (Rh.provide = Ih);
var Vh = function (t, e) {
  return void 0 === e ? t : e;
};
function Uh(t) {
  new RegExp("^[a-zA-Z][\\-\\.0-9_" + Il.source + "]*$").test(t) ||
    hh(
      'Invalid component name: "' +
        t +
        '". Component names should conform to valid custom element name in html5 specification.'
    ),
    (ul(t) || Ll.isReservedTag(t)) && hh("Do not use built-in or reserved HTML elements as component id: " + t);
}
function jh(t, e, n) {
  al(e) || hh('Invalid value for option "' + t + '": expected an Object, but got ' + il(e) + ".", n);
}
function Bh(t, e, n) {
  if (
    ("production" !== process.env.NODE_ENV &&
      (function (t) {
        for (var e in t.components) Uh(e);
      })(e),
    (function (t, e) {
      var n = t.props;
      if (n) {
        var r,
          i,
          a = {};
        if (Array.isArray(n))
          for (r = n.length; r--; )
            "string" == typeof (i = n[r])
              ? (a[_l(i)] = { type: null })
              : "production" !== process.env.NODE_ENV && hh("props must be strings when using array syntax.");
        else if (al(n)) for (var o in n) (i = n[o]), (a[_l(o)] = al(i) ? i : { type: i });
        else
          "production" !== process.env.NODE_ENV &&
            hh('Invalid value for option "props": expected an Array or an Object, but got ' + il(n) + ".", e);
        t.props = a;
      }
    })((e = "function" == typeof e ? e.options : e), n),
    (function (t, e) {
      var n = t.inject;
      if (n) {
        var r = (t.inject = {});
        if (Array.isArray(n)) for (var i = 0; i < n.length; i++) r[n[i]] = { from: n[i] };
        else if (al(n))
          for (var a in n) {
            var o = n[a];
            r[a] = al(o) ? kl({ from: a }, o) : { from: o };
          }
        else
          "production" !== process.env.NODE_ENV &&
            hh('Invalid value for option "inject": expected an Array or an Object, but got ' + il(n) + ".", e);
      }
    })(e, n),
    (function (t) {
      var e = t.directives;
      if (e)
        for (var n in e) {
          var r = e[n];
          "function" == typeof r && (e[n] = { bind: r, update: r });
        }
    })(e),
    !e._base && (e.extends && (t = Bh(t, e.extends, n)), e.mixins))
  )
    for (var r = 0, i = e.mixins.length; r < i; r++) t = Bh(t, e.mixins[r], n);
  var a,
    o = {};
  for (a in t) s(a);
  for (a in e) vl(t, a) || s(a);
  function s(r) {
    var i = Rh[r] || Vh;
    o[r] = i(t[r], e[r], n, r);
  }
  return o;
}
function Hh(t, e, n, r) {
  if ("string" == typeof n) {
    var i = t[e];
    if (vl(i, n)) return i[n];
    var a = _l(n);
    if (vl(i, a)) return i[a];
    var o = bl(a);
    return vl(i, o)
      ? i[o]
      : ((o = i[n] || i[a] || i[o]),
        "production" !== process.env.NODE_ENV && r && !o && hh("Failed to resolve " + e.slice(0, -1) + ": " + n, t),
        o);
  }
}
function Wh(t, e, n, r) {
  var i,
    a = e[t],
    o = !vl(n, t);
  e = n[t];
  return (
    -1 < (n = Jh(Boolean, a.type)) &&
      (o && !vl(a, "default")
        ? (e = !1)
        : ("" !== e && e !== wl(t)) || (((i = Jh(String, a.type)) < 0 || n < i) && (e = !0))),
    void 0 === e &&
      ((e = (function (t, e, n) {
        if (vl(e, "default")) {
          var r = e.default;
          return (
            "production" !== process.env.NODE_ENV &&
              nl(r) &&
              hh(
                'Invalid default value for prop "' +
                  n +
                  '": Props with type Object/Array must use a factory function to return the default value.',
                t
              ),
            t && t.$options.propsData && void 0 === t.$options.propsData[n] && void 0 !== t._props[n]
              ? t._props[n]
              : "function" == typeof r && "Function" !== qh(e.type)
              ? r.call(t)
              : r
          );
        }
      })(r, a, t)),
      (i = Nh),
      Oh(!0),
      Ph(e),
      Oh(i)),
    "production" !== process.env.NODE_ENV &&
      (function (t, e, n, r, i) {
        if (t.required && i) hh('Missing required prop: "' + e + '"', r);
        else if (null != n || t.required) {
          var a = t.type,
            o = !a || !0 === a,
            s = [];
          if (a) {
            Array.isArray(a) || (a = [a]);
            for (var c = 0; c < a.length && !o; c++) {
              var l = Kh(n, a[c], r);
              s.push(l.expectedType || ""), (o = l.valid);
            }
          }
          (i = s.some(function (t) {
            return t;
          })),
            o || !i
              ? (t = t.validator) &&
                (t(n) || hh('Invalid prop: custom validator check failed for prop "' + e + '".', r))
              : hh(
                  (function (t, e, n) {
                    var r = 'Invalid prop: type check failed for prop "' + t + '". Expected ' + n.map(bl).join(", "),
                      i = n[0];
                    t = il(e);
                    return (
                      1 === n.length &&
                        td(i) &&
                        td(typeof e) &&
                        !(function () {
                          for (var t = [], e = arguments.length; e--; ) t[e] = arguments[e];
                          return t.some(function (t) {
                            return "boolean" === t.toLowerCase();
                          });
                        })(i, t) &&
                        (r += " with value " + Qh(e, i)),
                      (r += ", got " + t + " "),
                      td(t) && (r += "with value " + Qh(e, t) + "."),
                      r
                    );
                  })(e, n, s),
                  r
                );
        }
      })(a, t, e, r, o),
    e
  );
}
var zh = /^(String|Number|Boolean|Function|Symbol|BigInt)$/;
function Kh(t, e, n) {
  var r = qh(e);
  if (zh.test(r)) {
    var i,
      a = typeof t;
    (i = a === r.toLowerCase()) || "object" != a || (i = t instanceof e);
  } else if ("Object" === r) i = al(t);
  else if ("Array" === r) i = Array.isArray(t);
  else
    try {
      i = t instanceof e;
    } catch (t) {
      hh('Invalid prop type: "' + String(e) + '" is not a constructor', n), (i = !1);
    }
  return { valid: i, expectedType: r };
}
var Yh = /^\s*function (\w+)/;
function qh(t) {
  return (t = t && t.toString().match(Yh)) ? t[1] : "";
}
function Xh(t, e) {
  return qh(t) === qh(e);
}
function Jh(t, e) {
  if (!Array.isArray(e)) return Xh(e, t) ? 0 : -1;
  for (var n = 0, r = e.length; n < r; n++) if (Xh(e[n], t)) return n;
  return -1;
}
function Qh(t, e) {
  return "String" === e ? '"' + t + '"' : "Number" === e ? "" + Number(t) : "" + t;
}
var Zh = ["string", "number", "boolean"];
function td(t) {
  return Zh.some(function (e) {
    return t.toLowerCase() === e;
  });
}
function ed(t, e, n) {
  mh();
  try {
    if (e)
      for (var r = e; (r = r.$parent); ) {
        var i = r.$options.errorCaptured;
        if (i)
          for (var a = 0; a < i.length; a++)
            try {
              if (!1 === i[a].call(r, t, e, n)) return;
            } catch (t) {
              rd(t, r, "errorCaptured hook");
            }
      }
    rd(t, e, n);
  } finally {
    yh();
  }
}
function nd(t, e, n, r, i) {
  var a;
  try {
    (a = n ? t.apply(e, n) : t.call(e)) &&
      !a._isVue &&
      cl(a) &&
      !a._handled &&
      (a.catch(function (t) {
        return ed(t, r, i + " (Promise/async)");
      }),
      (a._handled = !0));
  } catch (t) {
    ed(t, r, i);
  }
  return a;
}
function rd(t, e, n) {
  !(function (t, e, n) {
    if (
      ("production" !== process.env.NODE_ENV && hh("Error in " + n + ': "' + t.toString() + '"', e),
      (!Bl && !Hl) || "undefined" == typeof console)
    )
      throw t;
    console.error(t);
  })(t, e, n);
}
var id,
  ad,
  od,
  sd,
  cd,
  ld,
  hd,
  dd,
  ud,
  fd,
  pd,
  gd,
  vd,
  md,
  yd,
  _d,
  bd = !1,
  Sd = [],
  wd = !1;
function xd() {
  wd = !1;
  for (var t = Sd.slice(0), e = (Sd.length = 0); e < t.length; e++) t[e]();
}
function Cd(t, e) {
  var n;
  if (
    (Sd.push(function () {
      if (t)
        try {
          t.call(e);
        } catch (t) {
          ed(t, e, "nextTick");
        }
      else n && n(e);
    }),
    wd || ((wd = !0), ad()),
    !t && "undefined" != typeof Promise)
  )
    return new Promise(function (t) {
      n = t;
    });
}
"undefined" != typeof Promise && rh(Promise)
  ? ((id = Promise.resolve()),
    (ad = function () {
      id.then(xd), Xl && setTimeout(Nl);
    }),
    (bd = !0))
  : Kl ||
    "undefined" == typeof MutationObserver ||
    (!rh(MutationObserver) && "[object MutationObserverConstructor]" !== MutationObserver.toString())
  ? (ad =
      "undefined" != typeof setImmediate && rh(setImmediate)
        ? function () {
            setImmediate(xd);
          }
        : function () {
            setTimeout(xd, 0);
          })
  : ((od = 1),
    (sd = new MutationObserver(xd)),
    (cd = document.createTextNode(String(od))),
    sd.observe(cd, { characterData: !0 }),
    (ad = function () {
      (od = (od + 1) % 2), (cd.data = String(od));
    }),
    (bd = !0)),
  "production" === process.env.NODE_ENV ||
    ((dd = Bl && window.performance) &&
      dd.mark &&
      dd.measure &&
      dd.clearMarks &&
      dd.clearMeasures &&
      ((ld = function (t) {
        return dd.mark(t);
      }),
      (hd = function (t, e, n) {
        dd.measure(t, e, n), dd.clearMarks(e), dd.clearMarks(n);
      }))),
  "production" !== process.env.NODE_ENV &&
    ((ud = dl(
      "Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,require"
    )),
    (fd = function (t, e) {
      hh(
        'Property or method "' +
          e +
          '" is not defined on the instance but referenced during render. Make sure that this property is reactive, either in the data option, or for class-based components, by initializing the property. See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
        t
      );
    }),
    (pd = function (t, e) {
      hh(
        'Property "' +
          e +
          '" must be accessed with "$data.' +
          e +
          '" because properties starting with "$" or "_" are not proxied in the Vue instance to prevent conflicts with Vue internals. See: https://vuejs.org/v2/api/#data',
        t
      );
    }),
    (gd = "undefined" != typeof Proxy && rh(Proxy)) &&
      ((vd = dl("stop,prevent,self,ctrl,shift,alt,meta,exact")),
      (Ll.keyCodes = new Proxy(Ll.keyCodes, {
        set: function (t, e, n) {
          return vd(e) ? (hh("Avoid overwriting built-in modifier in config.keyCodes: ." + e), !1) : ((t[e] = n), !0);
        },
      }))),
    (md = {
      has: function (t, e) {
        var n = e in t,
          r = ud(e) || ("string" == typeof e && "_" === e.charAt(0) && !(e in t.$data));
        return n || r || (e in t.$data ? pd : fd)(t, e), n || !r;
      },
    }),
    (yd = {
      get: function (t, e) {
        return "string" != typeof e || e in t || (e in t.$data ? pd : fd)(t, e), t[e];
      },
    }),
    (_d = function (t) {
      var e;
      gd
        ? ((e = (e = t.$options).render && e.render._withStripped ? yd : md), (t._renderProxy = new Proxy(t, e)))
        : (t._renderProxy = t);
    }));
var kd = new lh();
function Ed(t) {
  Nd(t, kd), kd.clear();
}
function Nd(t, e) {
  var n,
    r,
    i = Array.isArray(t);
  if (!((!i && !nl(t)) || Object.isFrozen(t) || t instanceof _h)) {
    if (t.__ob__) {
      var a = t.__ob__.dep.id;
      if (e.has(a)) return;
      e.add(a);
    }
    if (i) for (n = t.length; n--; ) Nd(t[n], e);
    else for (n = (r = Object.keys(t)).length; n--; ) Nd(t[r[n]], e);
  }
}
var Od = ml(function (t) {
  var e = "&" === t.charAt(0),
    n = "~" === (t = e ? t.slice(1) : t).charAt(0),
    r = "!" === (t = n ? t.slice(1) : t).charAt(0);
  return { name: (t = r ? t.slice(1) : t), once: n, capture: r, passive: e };
});
function Ad(t, e) {
  function n() {
    var t = arguments,
      r = n.fns;
    if (!Array.isArray(r)) return nd(r, null, arguments, e, "v-on handler");
    for (var i = r.slice(), a = 0; a < i.length; a++) nd(i[a], null, t, e, "v-on handler");
  }
  return (n.fns = t), n;
}
function Pd(t, e, n, r, i, a) {
  var o, s, c, l;
  for (o in t)
    (s = t[o]),
      (c = e[o]),
      (l = Od(o)),
      Qc(s)
        ? "production" !== process.env.NODE_ENV && hh('Invalid handler for event "' + l.name + '": got ' + String(s), a)
        : Qc(c)
        ? (Qc(s.fns) && (s = t[o] = Ad(s, a)),
          tl(l.once) && (s = t[o] = i(l.name, s, l.capture)),
          n(l.name, s, l.capture, l.passive, l.params))
        : s !== c && ((c.fns = s), (t[o] = c));
  for (o in e) Qc(t[o]) && r((l = Od(o)).name, e[o], l.capture);
}
function Td(t, e, n) {
  var r,
    i = (t = t instanceof _h ? t.data.hook || (t.data.hook = {}) : t)[e];
  function a() {
    n.apply(this, arguments), pl(r.fns, a);
  }
  Qc(i) ? (r = Ad([a])) : Zc(i.fns) && tl(i.merged) ? (r = i).fns.push(a) : (r = Ad([i, a])),
    (r.merged = !0),
    (t[e] = r);
}
function Dd(t, e, n, r, i) {
  if (Zc(e)) {
    if (vl(e, n)) return (t[n] = e[n]), i || delete e[n], !0;
    if (vl(e, r)) return (t[n] = e[r]), i || delete e[r], !0;
  }
  return !1;
}
function Fd(t) {
  return el(t) ? [wh(t)] : Array.isArray(t) ? Rd(t) : void 0;
}
function Md(t) {
  return (
    Zc(t) &&
    Zc(t.text) &&
    (function (t) {
      return !1 === t;
    })(t.isComment)
  );
}
function Rd(t, e) {
  for (var n, r, i, a = [], o = 0; o < t.length; o++)
    Qc((n = t[o])) ||
      "boolean" == typeof n ||
      ((i = a[(r = a.length - 1)]),
      Array.isArray(n)
        ? 0 < n.length &&
          (Md((n = Rd(n, (e || "") + "_" + o))[0]) && Md(i) && ((a[r] = wh(i.text + n[0].text)), n.shift()),
          a.push.apply(a, n))
        : el(n)
        ? Md(i)
          ? (a[r] = wh(i.text + n))
          : "" !== n && a.push(wh(n))
        : Md(n) && Md(i)
        ? (a[r] = wh(i.text + n.text))
        : (tl(t._isVList) && Zc(n.tag) && Qc(n.key) && Zc(e) && (n.key = "__vlist" + e + "_" + o + "__"), a.push(n)));
  return a;
}
function Ld(t, e) {
  if (t) {
    for (var n = Object.create(null), r = ch ? Reflect.ownKeys(t) : Object.keys(t), i = 0; i < r.length; i++) {
      var a = r[i];
      if ("__ob__" !== a) {
        for (var o, s = t[a].from, c = e; c; ) {
          if (c._provided && vl(c._provided, s)) {
            n[a] = c._provided[s];
            break;
          }
          c = c.$parent;
        }
        c ||
          ("default" in t[a]
            ? ((o = t[a].default), (n[a] = "function" == typeof o ? o.call(e) : o))
            : "production" !== process.env.NODE_ENV && hh('Injection "' + a + '" not found', e));
      }
    }
    return n;
  }
}
function Id(t, e) {
  if (!t || !t.length) return {};
  for (var n, r = {}, i = 0, a = t.length; i < a; i++) {
    var o = t[i],
      s = o.data;
    s && s.attrs && s.attrs.slot && delete s.attrs.slot,
      (o.context !== e && o.fnContext !== e) || !s || null == s.slot
        ? (r.default || (r.default = [])).push(o)
        : ((s = r[(s = s.slot)] || (r[s] = [])), "template" === o.tag ? s.push.apply(s, o.children || []) : s.push(o));
  }
  for (n in r) r[n].every(Gd) && delete r[n];
  return r;
}
function Gd(t) {
  return (t.isComment && !t.asyncFactory) || " " === t.text;
}
function $d(t) {
  return t.isComment && t.asyncFactory;
}
function Vd(t, e, n) {
  var r,
    i,
    a = 0 < Object.keys(e).length,
    o = t ? !!t.$stable : !a,
    s = t && t.$key;
  if (t) {
    if (t._normalized) return t._normalized;
    if (o && n && n !== Jc && s === n.$key && !a && !n.$hasNormal) return n;
    for (var c in ((r = {}), t)) t[c] && "$" !== c[0] && (r[c] = Ud(e, c, t[c]));
  } else r = {};
  for (i in e) i in r || (r[i] = jd(e, i));
  return (
    t && Object.isExtensible(t) && (t._normalized = r), $l(r, "$stable", o), $l(r, "$key", s), $l(r, "$hasNormal", a), r
  );
}
function Ud(t, e, n) {
  function r() {
    var t = arguments.length ? n.apply(null, arguments) : n({}),
      e = (t = t && "object" == typeof t && !Array.isArray(t) ? [t] : Fd(t)) && t[0];
    return t && (!e || (1 === t.length && e.isComment && !$d(e))) ? void 0 : t;
  }
  return n.proxy && Object.defineProperty(t, e, { get: r, enumerable: !0, configurable: !0 }), r;
}
function jd(t, e) {
  return function () {
    return t[e];
  };
}
function Bd(t, e) {
  var n, r, i, a;
  if (Array.isArray(t) || "string" == typeof t)
    for (o = new Array(t.length), n = 0, r = t.length; n < r; n++) o[n] = e(t[n], n);
  else if ("number" == typeof t) for (o = new Array(t), n = 0; n < t; n++) o[n] = e(n + 1, n);
  else if (nl(t))
    if (ch && t[Symbol.iterator])
      for (var o = [], s = t[Symbol.iterator](), c = s.next(); !c.done; ) o.push(e(c.value, o.length)), (c = s.next());
    else
      for (i = Object.keys(t), o = new Array(i.length), n = 0, r = i.length; n < r; n++)
        (a = i[n]), (o[n] = e(t[a], a, n));
  return ((o = Zc(o) ? o : [])._isVList = !0), o;
}
function Hd(t, e, n, r) {
  var i = this.$scopedSlots[t];
  e = i
    ? ((n = n || {}),
      r &&
        ("production" === process.env.NODE_ENV || nl(r) || hh("slot v-bind without argument expects an Object", this),
        (n = kl(kl({}, r), n))),
      i(n) || ("function" == typeof e ? e() : e))
    : this.$slots[t] || ("function" == typeof e ? e() : e);
  return (n = n && n.slot) ? this.$createElement("template", { slot: n }, e) : e;
}
function Wd(t) {
  return Hh(this.$options, "filters", t, !0) || Al;
}
function zd(t, e) {
  return Array.isArray(t) ? -1 === t.indexOf(e) : t !== e;
}
function Kd(t, e, n, r, i) {
  return (
    (n = Ll.keyCodes[e] || n), i && r && !Ll.keyCodes[e] ? zd(i, r) : n ? zd(n, t) : r ? wl(r) !== e : void 0 === t
  );
}
function Yd(t, e, n, r, i) {
  if (n)
    if (nl(n)) {
      var a, o;
      for (o in (n = Array.isArray(n) ? El(n) : n))
        !(function (o) {
          a =
            "class" === o || "style" === o || fl(o)
              ? t
              : ((c = t.attrs && t.attrs.type),
                r || Ll.mustUseProp(e, c, o) ? t.domProps || (t.domProps = {}) : t.attrs || (t.attrs = {}));
          var s = _l(o),
            c = wl(o);
          s in a ||
            c in a ||
            ((a[o] = n[o]),
            i &&
              ((t.on || (t.on = {}))["update:" + o] = function (t) {
                n[o] = t;
              }));
        })(o);
    } else
      "production" !== process.env.NODE_ENV && hh("v-bind without argument expects an Object or Array value", this);
  return t;
}
function qd(t, e) {
  var n = this._staticTrees || (this._staticTrees = []),
    r = n[t];
  return (
    (r && !e) ||
      Jd((r = n[t] = this.$options.staticRenderFns[t].call(this._renderProxy, null, this)), "__static__" + t, !1),
    r
  );
}
function Xd(t, e, n) {
  return Jd(t, "__once__" + e + (n ? "_" + n : ""), !0), t;
}
function Jd(t, e, n) {
  if (Array.isArray(t)) for (var r = 0; r < t.length; r++) t[r] && "string" != typeof t[r] && Qd(t[r], e + "_" + r, n);
  else Qd(t, e, n);
}
function Qd(t, e, n) {
  (t.isStatic = !0), (t.key = e), (t.isOnce = n);
}
function Zd(t, e) {
  if (e)
    if (al(e)) {
      var n,
        r = (t.on = t.on ? kl({}, t.on) : {});
      for (n in e) {
        var i = r[n],
          a = e[n];
        r[n] = i ? [].concat(i, a) : a;
      }
    } else "production" !== process.env.NODE_ENV && hh("v-on without argument expects an Object value", this);
  return t;
}
function tu(t, e, n, r) {
  e = e || { $stable: !n };
  for (var i = 0; i < t.length; i++) {
    var a = t[i];
    Array.isArray(a) ? tu(a, e, n) : a && (a.proxy && (a.fn.proxy = !0), (e[a.key] = a.fn));
  }
  return r && (e.$key = r), e;
}
function eu(t, e) {
  for (var n = 0; n < e.length; n += 2) {
    var r = e[n];
    "string" == typeof r && r
      ? (t[e[n]] = e[n + 1])
      : "production" !== process.env.NODE_ENV &&
        "" !== r &&
        null !== r &&
        hh("Invalid value for dynamic directive argument (expected string or null): " + r, this);
  }
  return t;
}
function nu(t, e) {
  return "string" == typeof t ? e + t : t;
}
function ru(t) {
  (t._o = Xd),
    (t._n = hl),
    (t._s = ll),
    (t._l = Bd),
    (t._t = Hd),
    (t._q = Pl),
    (t._i = Tl),
    (t._m = qd),
    (t._f = Wd),
    (t._k = Kd),
    (t._b = Yd),
    (t._v = wh),
    (t._e = Sh),
    (t._u = tu),
    (t._g = Zd),
    (t._d = eu),
    (t._p = nu);
}
function iu(t, e, n, r, i) {
  var a,
    o = this,
    s = i.options;
  vl(r, "_uid") ? ((a = Object.create(r))._original = r) : (r = (a = r)._original);
  var c = !(i = tl(s._compiled));
  (this.data = t),
    (this.props = e),
    (this.children = n),
    (this.parent = r),
    (this.listeners = t.on || Jc),
    (this.injections = Ld(s.inject, r)),
    (this.slots = function () {
      return o.$slots || Vd(t.scopedSlots, (o.$slots = Id(n, r))), o.$slots;
    }),
    Object.defineProperty(this, "scopedSlots", {
      enumerable: !0,
      get: function () {
        return Vd(t.scopedSlots, this.slots());
      },
    }),
    i && ((this.$options = s), (this.$slots = this.slots()), (this.$scopedSlots = Vd(t.scopedSlots, this.$slots))),
    s._scopeId
      ? (this._c = function (t, e, n, i) {
          return (i = fu(a, t, e, n, i, c)) && !Array.isArray(i) && ((i.fnScopeId = s._scopeId), (i.fnContext = r)), i;
        })
      : (this._c = function (t, e, n, r) {
          return fu(a, t, e, n, r, c);
        });
}
function au(t, e, n, r, i) {
  return (
    ((t = xh(t)).fnContext = n),
    (t.fnOptions = r),
    "production" !== process.env.NODE_ENV && ((t.devtoolsMeta = t.devtoolsMeta || {}).renderContext = i),
    e.slot && ((t.data || (t.data = {})).slot = e.slot),
    t
  );
}
function ou(t, e) {
  for (var n in e) t[_l(n)] = e[n];
}
ru(iu.prototype);
var su = {
    init: function (t, e) {
      t.componentInstance && !t.componentInstance._isDestroyed && t.data.keepAlive
        ? su.prepatch(t, t)
        : (t.componentInstance = (function (t, e) {
            var n = { _isComponent: !0, _parentVnode: t, parent: e };
            e = t.data.inlineTemplate;
            return (
              Zc(e) && ((n.render = e.render), (n.staticRenderFns = e.staticRenderFns)), new t.componentOptions.Ctor(n)
            );
          })(t, xu)).$mount(e ? t.elm : void 0, e);
    },
    prepatch: function (t, e) {
      var n = e.componentOptions;
      !(function (t, e, n, r, i) {
        "production" !== process.env.NODE_ENV && (Cu = !0);
        var a = r.data.scopedSlots,
          o = t.$scopedSlots;
        (o = !!(
          (a && !a.$stable) ||
          (o !== Jc && !o.$stable) ||
          (a && t.$scopedSlots.$key !== a.$key) ||
          (!a && t.$scopedSlots.$key)
        )),
          (a = !!(i || t.$options._renderChildren || o));
        if (
          ((t.$options._parentVnode = r),
          (t.$vnode = r),
          t._vnode && (t._vnode.parent = r),
          (t.$options._renderChildren = i),
          (t.$attrs = r.data.attrs || Jc),
          (t.$listeners = n || Jc),
          e && t.$options.props)
        ) {
          Oh(!1);
          for (var s = t._props, c = t.$options._propKeys || [], l = 0; l < c.length; l++) {
            var h = c[l],
              d = t.$options.props;
            s[h] = Wh(h, d, e, t);
          }
          Oh(!0), (t.$options.propsData = e);
        }
        (o = t.$options._parentListeners),
          (t.$options._parentListeners = n = n || Jc),
          wu(t, n, o),
          a && ((t.$slots = Id(i, r.context)), t.$forceUpdate()),
          "production" !== process.env.NODE_ENV && (Cu = !1);
      })((e.componentInstance = t.componentInstance), n.propsData, n.listeners, e, n.children);
    },
    insert: function (t) {
      var e = t.context,
        n = t.componentInstance;
      n._isMounted || ((n._isMounted = !0), Au(n, "mounted")),
        t.data.keepAlive &&
          (e._isMounted
            ? (function (t) {
                (t._inactive = !1), Du.push(t);
              })(n)
            : Nu(n, !0));
    },
    destroy: function (t) {
      var e = t.componentInstance;
      e._isDestroyed || (t.data.keepAlive ? Ou(e, !0) : e.$destroy());
    },
  },
  cu = Object.keys(su);
function lu(t, e, n, r, i) {
  if (!Qc(t)) {
    var a,
      o = n.$options._base;
    if ("function" == typeof (t = nl(t) ? o.extend(t) : t)) {
      if (
        Qc(t.cid) &&
        void 0 ===
          (t = (function (t, e) {
            if (tl(t.error) && Zc(t.errorComp)) return t.errorComp;
            if (Zc(t.resolved)) return t.resolved;
            var n = vu;
            if (
              (n && Zc(t.owners) && -1 === t.owners.indexOf(n) && t.owners.push(n), tl(t.loading) && Zc(t.loadingComp))
            )
              return t.loadingComp;
            if (n && !Zc(t.owners)) {
              var r = (t.owners = [n]),
                i = !0,
                a = null,
                o = null;
              function h(t) {
                for (var e = 0, n = r.length; e < n; e++) r[e].$forceUpdate();
                t &&
                  ((r.length = 0),
                  null !== a && (clearTimeout(a), (a = null)),
                  null !== o && (clearTimeout(o), (o = null)));
              }
              n.$on("hook:destroyed", function () {
                return pl(r, n);
              });
              var s = Dl(function (n) {
                  (t.resolved = mu(n, e)), i ? (r.length = 0) : h(!0);
                }),
                c = Dl(function (e) {
                  "production" !== process.env.NODE_ENV &&
                    hh("Failed to resolve async component: " + String(t) + (e ? "\nReason: " + e : "")),
                    Zc(t.errorComp) && ((t.error = !0), h(!0));
                }),
                l = t(s, c);
              return (
                nl(l) &&
                  (cl(l)
                    ? Qc(t.resolved) && l.then(s, c)
                    : cl(l.component) &&
                      (l.component.then(s, c),
                      Zc(l.error) && (t.errorComp = mu(l.error, e)),
                      Zc(l.loading) &&
                        ((t.loadingComp = mu(l.loading, e)),
                        0 === l.delay
                          ? (t.loading = !0)
                          : (a = setTimeout(function () {
                              (a = null), Qc(t.resolved) && Qc(t.error) && ((t.loading = !0), h(!1));
                            }, l.delay || 200))),
                      Zc(l.timeout) &&
                        (o = setTimeout(function () {
                          (o = null),
                            Qc(t.resolved) &&
                              c("production" !== process.env.NODE_ENV ? "timeout (" + l.timeout + "ms)" : null);
                        }, l.timeout)))),
                (i = !1),
                t.loading ? t.loadingComp : t.resolved
              );
            }
          })((a = t), o))
      )
        return (function (t, e, n, r, i) {
          var a = Sh();
          return (a.asyncFactory = t), (a.asyncMeta = { data: e, context: n, children: r, tag: i }), a;
        })(a, e, n, r, i);
      (e = e || {}),
        Zu(t),
        Zc(e.model) &&
          (function (t, e) {
            var n = (t.model && t.model.prop) || "value",
              r = (t.model && t.model.event) || "input";
            ((e.attrs || (e.attrs = {}))[n] = e.model.value),
              (t = e.on || (e.on = {})),
              (n = t[r]),
              (e = e.model.callback),
              Zc(n) ? (Array.isArray(n) ? -1 === n.indexOf(e) : n !== e) && (t[r] = [e].concat(n)) : (t[r] = e);
          })(t.options, e);
      var s = (function (t, e, n) {
        var r = e.options.props;
        if (!Qc(r)) {
          var i = {},
            a = t.attrs,
            o = t.props;
          if (Zc(a) || Zc(o))
            for (var s in r) {
              var c,
                l = wl(s);
              "production" !== process.env.NODE_ENV &&
                ((c = s.toLowerCase()),
                s !== c &&
                  a &&
                  vl(a, c) &&
                  dh(
                    'Prop "' +
                      c +
                      '" is passed to component ' +
                      fh(n || e) +
                      ', but the declared prop name is "' +
                      s +
                      '". Note that HTML attributes are case-insensitive and camelCased props need to use their kebab-case equivalents when using in-DOM templates. You should probably use "' +
                      l +
                      '" instead of "' +
                      s +
                      '".'
                  )),
                Dd(i, o, s, l, !0) || Dd(i, a, s, l, !1);
            }
          return i;
        }
      })(e, t, i);
      if (tl(t.options.functional))
        return (function (t, e, n, r, i) {
          var a = t.options,
            o = {},
            s = a.props;
          if (Zc(s)) for (var c in s) o[c] = Wh(c, s, e || Jc);
          else Zc(n.attrs) && ou(o, n.attrs), Zc(n.props) && ou(o, n.props);
          var l = new iu(n, o, i, r, t);
          if ((t = a.render.call(null, l._c, l)) instanceof _h) return au(t, n, l.parent, a, l);
          if (Array.isArray(t)) {
            for (var h = Fd(t) || [], d = new Array(h.length), u = 0; u < h.length; u++)
              d[u] = au(h[u], n, l.parent, a, l);
            return d;
          }
        })(t, s, e, n, r);
      (o = e.on),
        (e.on = e.nativeOn),
        tl(t.options.abstract) && ((c = e.slot), (e = {}), c && (e.slot = c)),
        (function (t) {
          for (var e = t.hook || (t.hook = {}), n = 0; n < cu.length; n++) {
            var r = cu[n],
              i = e[r],
              a = su[r];
            i === a || (i && i._merged) || (e[r] = i ? hu(a, i) : a);
          }
        })(e);
      var c = t.options.name || i;
      return new _h(
        "vue-component-" + t.cid + (c ? "-" + c : ""),
        e,
        void 0,
        void 0,
        void 0,
        n,
        { Ctor: t, propsData: s, listeners: o, tag: i, children: r },
        a
      );
    }
    "production" !== process.env.NODE_ENV && hh("Invalid Component definition: " + String(t), n);
  }
}
function hu(t, e) {
  function n(n, r) {
    t(n, r), e(n, r);
  }
  return (n._merged = !0), n;
}
var du = 1,
  uu = 2;
function fu(t, e, n, r, i, a) {
  return (
    (Array.isArray(n) || el(n)) && ((i = r), (r = n), (n = void 0)),
    (function (t, e, n, r, i) {
      return Zc(n) && Zc(n.__ob__)
        ? ("production" !== process.env.NODE_ENV &&
            hh(
              "Avoid using observed data object as vnode data: " +
                JSON.stringify(n) +
                "\nAlways create fresh vnode data objects in each render!",
              t
            ),
          Sh())
        : (e = Zc(n) && Zc(n.is) ? n.is : e)
        ? ("production" !== process.env.NODE_ENV &&
            Zc(n) &&
            Zc(n.key) &&
            !el(n.key) &&
            hh("Avoid using non-primitive value as key, use string/number value instead.", t),
          Array.isArray(r) &&
            "function" == typeof r[0] &&
            (((n = n || {}).scopedSlots = { default: r[0] }), (r.length = 0)),
          i === uu
            ? (r = Fd(r))
            : i === du &&
              (r = (function (t) {
                for (var e = 0; e < t.length; e++) if (Array.isArray(t[e])) return Array.prototype.concat.apply([], t);
                return t;
              })(r)),
          (r =
            "string" == typeof e
              ? ((o = (t.$vnode && t.$vnode.ns) || Ll.getTagNamespace(e)),
                (n && n.pre) || !Zc((a = Hh(t.$options, "components", e)))
                  ? new _h(e, n, r, void 0, void 0, t)
                  : lu(a, n, t, r, e))
              : lu(e, n, t, r)),
          Array.isArray(r)
            ? r
            : Zc(r)
            ? (Zc(o) && pu(r, o),
              Zc(n) &&
                (function (t) {
                  nl(t.style) && Ed(t.style), nl(t.class) && Ed(t.class);
                })(n),
              r)
            : Sh())
        : Sh();
      var a, o;
    })(t, e, n, r, (i = tl(a) ? uu : i))
  );
}
function pu(t, e, n) {
  if (((t.ns = e), "foreignObject" === t.tag && (n = !(e = void 0)), Zc(t.children)))
    for (var r = 0, i = t.children.length; r < i; r++) {
      var a = t.children[r];
      Zc(a.tag) && (Qc(a.ns) || (tl(n) && "svg" !== a.tag)) && pu(a, e, n);
    }
}
var gu,
  vu = null;
function mu(t, e) {
  return nl((t = t.__esModule || (ch && "Module" === t[Symbol.toStringTag]) ? t.default : t)) ? e.extend(t) : t;
}
function yu(t) {
  if (Array.isArray(t))
    for (var e = 0; e < t.length; e++) {
      var n = t[e];
      if (Zc(n) && (Zc(n.componentOptions) || $d(n))) return n;
    }
}
function _u(t, e) {
  gu.$on(t, e);
}
function bu(t, e) {
  gu.$off(t, e);
}
function Su(t, e) {
  var n = gu;
  return function r() {
    null !== e.apply(null, arguments) && n.$off(t, r);
  };
}
function wu(t, e, n) {
  Pd(e, n || {}, _u, bu, Su, (gu = t)), (gu = void 0);
}
var xu = null,
  Cu = !1;
function ku(t) {
  var e = xu;
  return (
    (xu = t),
    function () {
      xu = e;
    }
  );
}
function Eu(t) {
  for (; (t = t && t.$parent); ) if (t._inactive) return !0;
  return !1;
}
function Nu(t, e) {
  if (e) {
    if (((t._directInactive = !1), Eu(t))) return;
  } else if (t._directInactive) return;
  if (t._inactive || null === t._inactive) {
    t._inactive = !1;
    for (var n = 0; n < t.$children.length; n++) Nu(t.$children[n]);
    Au(t, "activated");
  }
}
function Ou(t, e) {
  if (!((e && ((t._directInactive = !0), Eu(t))) || t._inactive)) {
    t._inactive = !0;
    for (var n = 0; n < t.$children.length; n++) Ou(t.$children[n]);
    Au(t, "deactivated");
  }
}
function Au(t, e) {
  mh();
  var n = t.$options[e],
    r = e + " hook";
  if (n) for (var i = 0, a = n.length; i < a; i++) nd(n[i], t, null, t, r);
  t._hasHookEvent && t.$emit("hook:" + e), yh();
}
var Pu = 100,
  Tu = [],
  Du = [],
  Fu = {},
  Mu = {},
  Ru = !1,
  Lu = !1,
  Iu = 0;
var Gu,
  $u = 0,
  Vu = Date.now;
function Uu() {
  var t, e;
  for (
    $u = Vu(),
      Lu = !0,
      Tu.sort(function (t, e) {
        return t.id - e.id;
      }),
      Iu = 0;
    Iu < Tu.length;
    Iu++
  )
    if (
      ((t = Tu[Iu]).before && t.before(),
      (e = t.id),
      (Fu[e] = null),
      t.run(),
      "production" !== process.env.NODE_ENV && null != Fu[e] && ((Mu[e] = (Mu[e] || 0) + 1), Mu[e] > Pu))
    ) {
      hh(
        "You may have an infinite update loop " +
          (t.user ? 'in watcher with expression "' + t.expression + '"' : "in a component render function."),
        t.vm
      );
      break;
    }
  var n = Du.slice(),
    r = Tu.slice();
  (Iu = Tu.length = Du.length = 0),
    (Fu = {}),
    "production" !== process.env.NODE_ENV && (Mu = {}),
    (Ru = Lu = !1),
    (function (t) {
      for (var e = 0; e < t.length; e++) (t[e]._inactive = !0), Nu(t[e], !0);
    })(n),
    (function (t) {
      for (var e = t.length; e--; ) {
        var n = t[e],
          r = n.vm;
        r._watcher === n && r._isMounted && !r._isDestroyed && Au(r, "updated");
      }
    })(r),
    nh && Ll.devtools && nh.emit("flush");
}
!Bl ||
  Kl ||
  ((Gu = window.performance) &&
    "function" == typeof Gu.now &&
    Vu() > document.createEvent("Event").timeStamp &&
    (Vu = function () {
      return Gu.now();
    }));
var ju = 0,
  Bu = function (t, e, n, r, i) {
    (this.vm = t),
      i && (t._watcher = this),
      t._watchers.push(this),
      r
        ? ((this.deep = !!r.deep),
          (this.user = !!r.user),
          (this.lazy = !!r.lazy),
          (this.sync = !!r.sync),
          (this.before = r.before))
        : (this.deep = this.user = this.lazy = this.sync = !1),
      (this.cb = n),
      (this.id = ++ju),
      (this.active = !0),
      (this.dirty = this.lazy),
      (this.deps = []),
      (this.newDeps = []),
      (this.depIds = new lh()),
      (this.newDepIds = new lh()),
      (this.expression = "production" !== process.env.NODE_ENV ? e.toString() : ""),
      "function" == typeof e
        ? (this.getter = e)
        : ((this.getter = (function (t) {
            if (!Vl.test(t)) {
              var e = t.split(".");
              return function (t) {
                for (var n = 0; n < e.length; n++) {
                  if (!t) return;
                  t = t[e[n]];
                }
                return t;
              };
            }
          })(e)),
          this.getter ||
            ((this.getter = Nl),
            "production" !== process.env.NODE_ENV &&
              hh(
                'Failed watching path: "' +
                  e +
                  '" Watcher only accepts simple dot-delimited paths. For full control, use a function instead.',
                t
              ))),
      (this.value = this.lazy ? void 0 : this.get());
  };
(Bu.prototype.get = function () {
  var t;
  mh(this);
  var e = this.vm;
  try {
    t = this.getter.call(e, e);
  } catch (t) {
    if (!this.user) throw t;
    ed(t, e, 'getter for watcher "' + this.expression + '"');
  } finally {
    this.deep && Ed(t), yh(), this.cleanupDeps();
  }
  return t;
}),
  (Bu.prototype.addDep = function (t) {
    var e = t.id;
    this.newDepIds.has(e) || (this.newDepIds.add(e), this.newDeps.push(t), this.depIds.has(e) || t.addSub(this));
  }),
  (Bu.prototype.cleanupDeps = function () {
    for (var t = this.deps.length; t--; ) {
      var e = this.deps[t];
      this.newDepIds.has(e.id) || e.removeSub(this);
    }
    var n = this.depIds;
    (this.depIds = this.newDepIds),
      (this.newDepIds = n),
      this.newDepIds.clear(),
      (n = this.deps),
      (this.deps = this.newDeps),
      (this.newDeps = n),
      (this.newDeps.length = 0);
  }),
  (Bu.prototype.update = function () {
    this.lazy
      ? (this.dirty = !0)
      : this.sync
      ? this.run()
      : (function (t) {
          var e = t.id;
          if (null == Fu[e]) {
            if (((Fu[e] = !0), Lu)) {
              for (var n = Tu.length - 1; Iu < n && Tu[n].id > t.id; ) n--;
              Tu.splice(n + 1, 0, t);
            } else Tu.push(t);
            Ru || ((Ru = !0), "production" === process.env.NODE_ENV || Ll.async ? Cd(Uu) : Uu());
          }
        })(this);
  }),
  (Bu.prototype.run = function () {
    var t, e, n;
    !this.active ||
      (((t = this.get()) !== this.value || nl(t) || this.deep) &&
        ((e = this.value),
        (this.value = t),
        this.user
          ? ((n = 'callback for watcher "' + this.expression + '"'), nd(this.cb, this.vm, [t, e], this.vm, n))
          : this.cb.call(this.vm, t, e)));
  }),
  (Bu.prototype.evaluate = function () {
    (this.value = this.get()), (this.dirty = !1);
  }),
  (Bu.prototype.depend = function () {
    for (var t = this.deps.length; t--; ) this.deps[t].depend();
  }),
  (Bu.prototype.teardown = function () {
    if (this.active) {
      this.vm._isBeingDestroyed || pl(this.vm._watchers, this);
      for (var t = this.deps.length; t--; ) this.deps[t].removeSub(this);
      this.active = !1;
    }
  });
var Hu = { enumerable: !0, configurable: !0, get: Nl, set: Nl };
function Wu(t, e, n) {
  (Hu.get = function () {
    return this[e][n];
  }),
    (Hu.set = function (t) {
      this[e][n] = t;
    }),
    Object.defineProperty(t, n, Hu);
}
function zu(t) {
  t._watchers = [];
  var e = t.$options;
  e.props &&
    (function (t, e) {
      var n = t.$options.propsData || {},
        r = (t._props = {}),
        i = (t.$options._propKeys = []),
        a = !t.$parent;
      for (var o in (a || Oh(!1), e))
        !(function (o) {
          i.push(o);
          var s,
            c = Wh(o, e, n, t);
          "production" !== process.env.NODE_ENV
            ? ((s = wl(o)),
              (fl(s) || Ll.isReservedAttr(s)) &&
                hh('"' + s + '" is a reserved attribute and cannot be used as component prop.', t),
              Th(r, o, c, function () {
                a ||
                  Cu ||
                  hh(
                    "Avoid mutating a prop directly since the value will be overwritten whenever the parent component re-renders. Instead, use a data or computed property based on the prop's value. Prop being mutated: \"" +
                      o +
                      '"',
                    t
                  );
              }))
            : Th(r, o, c),
            o in t || Wu(t, "_props", o);
        })(o);
      Oh(!0);
    })(t, e.props),
    e.methods &&
      (function (t, e) {
        var n,
          r = t.$options.props;
        for (n in e)
          "production" !== process.env.NODE_ENV &&
            ("function" != typeof e[n] &&
              hh(
                'Method "' +
                  n +
                  '" has type "' +
                  typeof e[n] +
                  '" in the component definition. Did you reference the function correctly?',
                t
              ),
            r && vl(r, n) && hh('Method "' + n + '" has already been defined as a prop.', t),
            n in t &&
              Gl(n) &&
              hh(
                'Method "' +
                  n +
                  '" conflicts with an existing Vue instance method. Avoid defining component methods that start with _ or $.'
              )),
            (t[n] = "function" != typeof e[n] ? Nl : xl(e[n], t));
      })(t, e.methods),
    e.data
      ? (function (t) {
          var e = t.$options.data;
          al(
            (e = t._data =
              "function" == typeof e
                ? (function (t, e) {
                    mh();
                    try {
                      return t.call(e, e);
                    } catch (t) {
                      return ed(t, e, "data()"), {};
                    } finally {
                      yh();
                    }
                  })(e, t)
                : e || {})
          ) ||
            ((e = {}),
            "production" !== process.env.NODE_ENV &&
              hh(
                "data functions should return an object:\nhttps://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function",
                t
              ));
          for (var n = Object.keys(e), r = t.$options.props, i = t.$options.methods, a = n.length; a--; ) {
            var o = n[a];
            "production" !== process.env.NODE_ENV &&
              i &&
              vl(i, o) &&
              hh('Method "' + o + '" has already been defined as a data property.', t),
              r && vl(r, o)
                ? "production" !== process.env.NODE_ENV &&
                  hh('The data property "' + o + '" is already declared as a prop. Use prop default value instead.', t)
                : Gl(o) || Wu(t, "_data", o);
          }
          Ph(e, !0);
        })(t)
      : Ph((t._data = {}), !0),
    e.computed &&
      (function (t, e) {
        var n,
          r = (t._computedWatchers = Object.create(null)),
          i = eh();
        for (n in e) {
          var a = e[n],
            o = "function" == typeof a ? a : a.get;
          "production" !== process.env.NODE_ENV &&
            null == o &&
            hh('Getter is missing for computed property "' + n + '".', t),
            i || (r[n] = new Bu(t, o || Nl, Nl, Ku)),
            n in t
              ? "production" !== process.env.NODE_ENV &&
                (n in t.$data
                  ? hh('The computed property "' + n + '" is already defined in data.', t)
                  : t.$options.props && n in t.$options.props
                  ? hh('The computed property "' + n + '" is already defined as a prop.', t)
                  : t.$options.methods &&
                    n in t.$options.methods &&
                    hh('The computed property "' + n + '" is already defined as a method.', t))
              : Yu(t, n, a);
        }
      })(t, e.computed),
    e.watch &&
      e.watch !== Ql &&
      (function (t, e) {
        for (var n in e) {
          var r = e[n];
          if (Array.isArray(r)) for (var i = 0; i < r.length; i++) Ju(t, n, r[i]);
          else Ju(t, n, r);
        }
      })(t, e.watch);
}
var Ku = { lazy: !0 };
function Yu(t, e, n) {
  var r = !eh();
  "function" == typeof n
    ? ((Hu.get = r ? qu(e) : Xu(n)), (Hu.set = Nl))
    : ((Hu.get = n.get ? (r && !1 !== n.cache ? qu(e) : Xu(n.get)) : Nl), (Hu.set = n.set || Nl)),
    "production" !== process.env.NODE_ENV &&
      Hu.set === Nl &&
      (Hu.set = function () {
        hh('Computed property "' + e + '" was assigned to but it has no setter.', this);
      }),
    Object.defineProperty(t, e, Hu);
}
function qu(t) {
  return function () {
    var e = this._computedWatchers && this._computedWatchers[t];
    if (e) return e.dirty && e.evaluate(), gh.target && e.depend(), e.value;
  };
}
function Xu(t) {
  return function () {
    return t.call(this, this);
  };
}
function Ju(t, e, n, r) {
  return "string" == typeof (n = al(n) ? (r = n).handler : n) && (n = t[n]), t.$watch(e, n, r);
}
var Qu = 0;
function Zu(t) {
  var e,
    n,
    r = t.options;
  return (
    !t.super ||
      ((e = Zu(t.super)) !== t.superOptions &&
        ((t.superOptions = e),
        (n = (function (t) {
          var e,
            n,
            r = t.options,
            i = t.sealedOptions;
          for (n in r) r[n] !== i[n] && ((e = e || {})[n] = r[n]);
          return e;
        })(t)) && kl(t.extendOptions, n),
        (r = t.options = Bh(e, t.extendOptions)).name && (r.components[r.name] = t))),
    r
  );
}
function tf(t) {
  "production" === process.env.NODE_ENV ||
    this instanceof tf ||
    hh("Vue is a constructor and should be called with the `new` keyword"),
    this._init(t);
}
function ef(t) {
  t.cid = 0;
  var e = 1;
  t.extend = function (t) {
    var n = this,
      r = n.cid,
      i = (t = t || {})._Ctor || (t._Ctor = {});
    if (i[r]) return i[r];
    var a = t.name || n.options.name;
    function o(t) {
      this._init(t);
    }
    return (
      "production" !== process.env.NODE_ENV && a && Uh(a),
      (((o.prototype = Object.create(n.prototype)).constructor = o).cid = e++),
      (o.options = Bh(n.options, t)),
      (o.super = n),
      o.options.props &&
        (function (t) {
          for (var e in t.options.props) Wu(t.prototype, "_props", e);
        })(o),
      o.options.computed &&
        (function (t) {
          var e,
            n = t.options.computed;
          for (e in n) Yu(t.prototype, e, n[e]);
        })(o),
      (o.extend = n.extend),
      (o.mixin = n.mixin),
      (o.use = n.use),
      Ml.forEach(function (t) {
        o[t] = n[t];
      }),
      a && (o.options.components[a] = o),
      (o.superOptions = n.options),
      (o.extendOptions = t),
      (o.sealedOptions = kl({}, o.options)),
      (i[r] = o)
    );
  };
}
function nf(t) {
  return t && (t.Ctor.options.name || t.tag);
}
function rf(t, e) {
  return Array.isArray(t)
    ? -1 < t.indexOf(e)
    : "string" == typeof t
    ? -1 < t.split(",").indexOf(e)
    : !!ol(t) && t.test(e);
}
function af(t, e) {
  var n,
    r = t.cache,
    i = t.keys,
    a = t._vnode;
  for (n in r) {
    var o = r[n];
    !o || ((o = o.name) && !e(o) && of(r, n, i, a));
  }
}
function of(t, e, n, r) {
  var i = t[e];
  !i || (r && i.tag === r.tag) || i.componentInstance.$destroy(), (t[e] = null), pl(n, e);
}
(tf.prototype._init = function (t) {
  var e,
    n,
    r = this;
  (r._uid = Qu++),
    "production" !== process.env.NODE_ENV &&
      Ll.performance &&
      ld &&
      ((e = "vue-perf-start:" + r._uid), (n = "vue-perf-end:" + r._uid), ld(e)),
    (r._isVue = !0),
    t && t._isComponent
      ? (function (t, e) {
          var n = (t.$options = Object.create(t.constructor.options));
          (t = e._parentVnode),
            (n.parent = e.parent),
            (t = (n._parentVnode = t).componentOptions),
            (n.propsData = t.propsData),
            (n._parentListeners = t.listeners),
            (n._renderChildren = t.children),
            (n._componentTag = t.tag),
            e.render && ((n.render = e.render), (n.staticRenderFns = e.staticRenderFns));
        })(r, t)
      : (r.$options = Bh(Zu(r.constructor), t || {}, r)),
    "production" !== process.env.NODE_ENV ? _d(r) : (r._renderProxy = r),
    (function (t) {
      var e = t.$options,
        n = e.parent;
      if (n && !e.abstract) {
        for (; n.$options.abstract && n.$parent; ) n = n.$parent;
        n.$children.push(t);
      }
      (t.$parent = n),
        (t.$root = n ? n.$root : t),
        (t.$children = []),
        (t.$refs = {}),
        (t._watcher = null),
        (t._inactive = null),
        (t._directInactive = !1),
        (t._isMounted = !1),
        (t._isDestroyed = !1),
        (t._isBeingDestroyed = !1);
    })((r._self = r)),
    (function (t) {
      (t._events = Object.create(null)), (t._hasHookEvent = !1);
      var e = t.$options._parentListeners;
      e && wu(t, e);
    })(r),
    (function (t) {
      (t._vnode = null), (t._staticTrees = null);
      var e = t.$options,
        n = (t.$vnode = e._parentVnode),
        r = n && n.context;
      (t.$slots = Id(e._renderChildren, r)),
        (t.$scopedSlots = Jc),
        (t._c = function (e, n, r, i) {
          return fu(t, e, n, r, i, !1);
        }),
        (t.$createElement = function (e, n, r, i) {
          return fu(t, e, n, r, i, !0);
        }),
        (n = n && n.data),
        "production" !== process.env.NODE_ENV
          ? (Th(
              t,
              "$attrs",
              (n && n.attrs) || Jc,
              function () {
                Cu || hh("$attrs is readonly.", t);
              },
              !0
            ),
            Th(
              t,
              "$listeners",
              e._parentListeners || Jc,
              function () {
                Cu || hh("$listeners is readonly.", t);
              },
              !0
            ))
          : (Th(t, "$attrs", (n && n.attrs) || Jc, null, !0), Th(t, "$listeners", e._parentListeners || Jc, null, !0));
    })(r),
    Au(r, "beforeCreate"),
    (function (t) {
      var e = Ld(t.$options.inject, t);
      e &&
        (Oh(!1),
        Object.keys(e).forEach(function (n) {
          "production" !== process.env.NODE_ENV
            ? Th(t, n, e[n], function () {
                hh(
                  'Avoid mutating an injected value directly since the changes will be overwritten whenever the provided component re-renders. injection being mutated: "' +
                    n +
                    '"',
                  t
                );
              })
            : Th(t, n, e[n]);
        }),
        Oh(!0));
    })(r),
    zu(r),
    (function (t) {
      var e = t.$options.provide;
      e && (t._provided = "function" == typeof e ? e.call(t) : e);
    })(r),
    Au(r, "created"),
    "production" !== process.env.NODE_ENV &&
      Ll.performance &&
      ld &&
      ((r._name = fh(r, !1)), ld(n), hd("vue " + r._name + " init", e, n)),
    r.$options.el && r.$mount(r.$options.el);
}),
  (function (t) {
    var e = {
        get: function () {
          return this._data;
        },
      },
      n = {
        get: function () {
          return this._props;
        },
      };
    "production" !== process.env.NODE_ENV &&
      ((e.set = function () {
        hh("Avoid replacing instance root $data. Use nested data properties instead.", this);
      }),
      (n.set = function () {
        hh("$props is readonly.", this);
      })),
      Object.defineProperty(t.prototype, "$data", e),
      Object.defineProperty(t.prototype, "$props", n),
      (t.prototype.$set = Dh),
      (t.prototype.$delete = Fh),
      (t.prototype.$watch = function (t, e, n) {
        if (al(e)) return Ju(this, t, e, n);
        (n = n || {}).user = !0;
        var r = new Bu(this, t, e, n);
        return (
          n.immediate &&
            ((n = 'callback for immediate watcher "' + r.expression + '"'),
            mh(),
            nd(e, this, [r.value], this, n),
            yh()),
          function () {
            r.teardown();
          }
        );
      });
  })(tf),
  (function (t) {
    var e = /^hook:/;
    (t.prototype.$on = function (t, n) {
      var r = this;
      if (Array.isArray(t)) for (var i = 0, a = t.length; i < a; i++) r.$on(t[i], n);
      else (r._events[t] || (r._events[t] = [])).push(n), e.test(t) && (r._hasHookEvent = !0);
      return r;
    }),
      (t.prototype.$once = function (t, e) {
        var n = this;
        function r() {
          n.$off(t, r), e.apply(n, arguments);
        }
        return (r.fn = e), n.$on(t, r), n;
      }),
      (t.prototype.$off = function (t, e) {
        var n = this;
        if (!arguments.length) return (n._events = Object.create(null)), n;
        if (Array.isArray(t)) {
          for (var r = 0, i = t.length; r < i; r++) n.$off(t[r], e);
          return n;
        }
        var a,
          o = n._events[t];
        if (!o) return n;
        if (!e) return (n._events[t] = null), n;
        for (var s = o.length; s--; )
          if ((a = o[s]) === e || a.fn === e) {
            o.splice(s, 1);
            break;
          }
        return n;
      }),
      (t.prototype.$emit = function (t) {
        var e,
          n = this;
        if (
          ("production" === process.env.NODE_ENV ||
            ((e = t.toLowerCase()) !== t &&
              n._events[e] &&
              dh(
                'Event "' +
                  e +
                  '" is emitted in component ' +
                  fh(n) +
                  ' but the handler is registered for "' +
                  t +
                  '". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "' +
                  wl(t) +
                  '" instead of "' +
                  t +
                  '".'
              )),
          (r = n._events[t]))
        )
          for (
            var r = 1 < r.length ? Cl(r) : r,
              i = Cl(arguments, 1),
              a = 'event handler for "' + t + '"',
              o = 0,
              s = r.length;
            o < s;
            o++
          )
            nd(r[o], n, i, n, a);
        return n;
      });
  })(tf),
  (function (t) {
    (t.prototype._update = function (t, e) {
      var n = this,
        r = n.$el,
        i = n._vnode,
        a = ku(n);
      (n._vnode = t),
        (n.$el = i ? n.__patch__(i, t) : n.__patch__(n.$el, t, e, !1)),
        a(),
        r && (r.__vue__ = null),
        n.$el && (n.$el.__vue__ = n),
        n.$vnode && n.$parent && n.$vnode === n.$parent._vnode && (n.$parent.$el = n.$el);
    }),
      (t.prototype.$forceUpdate = function () {
        this._watcher && this._watcher.update();
      }),
      (t.prototype.$destroy = function () {
        var t = this;
        if (!t._isBeingDestroyed) {
          Au(t, "beforeDestroy"), (t._isBeingDestroyed = !0);
          var e = t.$parent;
          !e || e._isBeingDestroyed || t.$options.abstract || pl(e.$children, t), t._watcher && t._watcher.teardown();
          for (var n = t._watchers.length; n--; ) t._watchers[n].teardown();
          t._data.__ob__ && t._data.__ob__.vmCount--,
            (t._isDestroyed = !0),
            t.__patch__(t._vnode, null),
            Au(t, "destroyed"),
            t.$off(),
            t.$el && (t.$el.__vue__ = null),
            t.$vnode && (t.$vnode.parent = null);
        }
      });
  })(tf),
  (function (t) {
    ru(t.prototype),
      (t.prototype.$nextTick = function (t) {
        return Cd(t, this);
      }),
      (t.prototype._render = function () {
        var t,
          e,
          n = this,
          r = (e = n.$options).render;
        (e = e._parentVnode) && (n.$scopedSlots = Vd(e.data.scopedSlots, n.$slots, n.$scopedSlots)), (n.$vnode = e);
        try {
          (vu = n), (t = r.call(n._renderProxy, n.$createElement));
        } catch (e) {
          if ((ed(e, n, "render"), "production" !== process.env.NODE_ENV && n.$options.renderError))
            try {
              t = n.$options.renderError.call(n._renderProxy, n.$createElement, e);
            } catch (e) {
              ed(e, n, "renderError"), (t = n._vnode);
            }
          else t = n._vnode;
        } finally {
          vu = null;
        }
        return (
          (t = Array.isArray(t) && 1 === t.length ? t[0] : t) instanceof _h ||
            ("production" !== process.env.NODE_ENV &&
              Array.isArray(t) &&
              hh(
                "Multiple root nodes returned from render function. Render function should return a single root node.",
                n
              ),
            (t = Sh())),
          (t.parent = e),
          t
        );
      });
  })(tf);
var sf = [String, RegExp, Array],
  cf = {
    name: "keep-alive",
    abstract: !0,
    props: { include: sf, exclude: sf, max: [String, Number] },
    methods: {
      cacheVNode: function () {
        var t,
          e,
          n = this.cache,
          r = this.keys,
          i = this.vnodeToCache,
          a = this.keyToCache;
        i &&
          ((t = i.tag),
          (e = i.componentInstance),
          (i = i.componentOptions),
          (n[a] = { name: nf(i), tag: t, componentInstance: e }),
          r.push(a),
          this.max && r.length > parseInt(this.max) && of(n, r[0], r, this._vnode),
          (this.vnodeToCache = null));
      },
    },
    created: function () {
      (this.cache = Object.create(null)), (this.keys = []);
    },
    destroyed: function () {
      for (var t in this.cache) of(this.cache, t, this.keys);
    },
    mounted: function () {
      var t = this;
      this.cacheVNode(),
        this.$watch("include", function (e) {
          af(t, function (t) {
            return rf(e, t);
          });
        }),
        this.$watch("exclude", function (e) {
          af(t, function (t) {
            return !rf(e, t);
          });
        });
    },
    updated: function () {
      this.cacheVNode();
    },
    render: function () {
      var t = this.$slots.default,
        e = yu(t),
        n = e && e.componentOptions;
      if (n) {
        var r = nf(n),
          i = this.include,
          a = this.exclude;
        if ((i && (!r || !rf(i, r))) || (a && r && rf(a, r))) return e;
        (a = this.cache),
          (r = this.keys),
          a[(n = null == e.key ? n.Ctor.cid + (n.tag ? "::" + n.tag : "") : e.key)]
            ? ((e.componentInstance = a[n].componentInstance), pl(r, n), r.push(n))
            : ((this.vnodeToCache = e), (this.keyToCache = n)),
          (e.data.keepAlive = !0);
      }
      return e || (t && t[0]);
    },
  },
  lf = { KeepAlive: cf };
(function (t) {
  var e = {
    get: function () {
      return Ll;
    },
  };
  "production" !== process.env.NODE_ENV &&
    (e.set = function () {
      hh("Do not replace the Vue.config object, set individual fields instead.");
    }),
    Object.defineProperty(t, "config", e),
    (t.util = { warn: hh, extend: kl, mergeOptions: Bh, defineReactive: Th }),
    (t.set = Dh),
    (t.delete = Fh),
    (t.nextTick = Cd),
    (t.observable = function (t) {
      return Ph(t), t;
    }),
    (t.options = Object.create(null)),
    Ml.forEach(function (e) {
      t.options[e + "s"] = Object.create(null);
    }),
    kl((t.options._base = t).options.components, lf),
    (function (t) {
      t.use = function (t) {
        var e = this._installedPlugins || (this._installedPlugins = []);
        if (-1 < e.indexOf(t)) return this;
        var n = Cl(arguments, 1);
        return (
          n.unshift(this),
          "function" == typeof t.install ? t.install.apply(t, n) : "function" == typeof t && t.apply(null, n),
          e.push(t),
          this
        );
      };
    })(t),
    (function (t) {
      t.mixin = function (t) {
        return (this.options = Bh(this.options, t)), this;
      };
    })(t),
    ef(t),
    (function (t) {
      Ml.forEach(function (e) {
        t[e] = function (t, n) {
          return n
            ? ("production" !== process.env.NODE_ENV && "component" === e && Uh(t),
              "component" === e && al(n) && ((n.name = n.name || t), (n = this.options._base.extend(n))),
              (this.options[e + "s"][t] = n = "directive" === e && "function" == typeof n ? { bind: n, update: n } : n))
            : this.options[e + "s"][t];
        };
      });
    })(t);
})(tf),
  Object.defineProperty(tf.prototype, "$isServer", { get: eh }),
  Object.defineProperty(tf.prototype, "$ssrContext", {
    get: function () {
      return this.$vnode && this.$vnode.ssrContext;
    },
  }),
  Object.defineProperty(tf, "FunctionalRenderContext", { value: iu }),
  (tf.version = "2.6.14");
var hf = dl("style,class"),
  df = dl("input,textarea,option,select,progress"),
  uf = function (t, e, n) {
    return (
      ("value" === n && df(t) && "button" !== e) ||
      ("selected" === n && "option" === t) ||
      ("checked" === n && "input" === t) ||
      ("muted" === n && "video" === t)
    );
  },
  ff = dl("contenteditable,draggable,spellcheck"),
  pf = dl("events,caret,typing,plaintext-only"),
  gf = function (t, e) {
    return bf(e) || "false" === e ? "false" : "contenteditable" === t && pf(e) ? e : "true";
  },
  vf = dl(
    "allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,defaultchecked,defaultmuted,defaultselected,defer,disabled,enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,truespeed,typemustmatch,visible"
  ),
  mf = "http://www.w3.org/1999/xlink",
  yf = function (t) {
    return ":" === t.charAt(5) && "xlink" === t.slice(0, 5);
  },
  _f = function (t) {
    return yf(t) ? t.slice(6, t.length) : "";
  },
  bf = function (t) {
    return null == t || !1 === t;
  };
function Sf(t) {
  for (var e = t.data, n = t, r = t; Zc(r.componentInstance); )
    (r = r.componentInstance._vnode) && r.data && (e = wf(r.data, e));
  for (; Zc((n = n.parent)); ) n && n.data && (e = wf(e, n.data));
  return (function (t, e) {
    return Zc(t) || Zc(e) ? xf(t, Cf(e)) : "";
  })(e.staticClass, e.class);
}
function wf(t, e) {
  return { staticClass: xf(t.staticClass, e.staticClass), class: Zc(t.class) ? [t.class, e.class] : e.class };
}
function xf(t, e) {
  return t ? (e ? t + " " + e : t) : e || "";
}
function Cf(t) {
  return Array.isArray(t)
    ? (function (t) {
        for (var e, n = "", r = 0, i = t.length; r < i; r++)
          Zc((e = Cf(t[r]))) && "" !== e && (n && (n += " "), (n += e));
        return n;
      })(t)
    : nl(t)
    ? (function (t) {
        var e,
          n = "";
        for (e in t) t[e] && (n && (n += " "), (n += e));
        return n;
      })(t)
    : "string" == typeof t
    ? t
    : "";
}
var kf = { svg: "http://www.w3.org/2000/svg", math: "http://www.w3.org/1998/Math/MathML" },
  Ef = dl(
    "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,menuitem,summary,content,element,shadow,template,blockquote,iframe,tfoot"
  ),
  Nf = dl(
    "svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,foreignobject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view",
    !0
  ),
  Of = function (t) {
    return Ef(t) || Nf(t);
  };
function Af(t) {
  return Nf(t) ? "svg" : "math" === t ? "math" : void 0;
}
var Pf = Object.create(null);
var Tf = dl("text,number,password,search,email,tel,url");
function Df(t) {
  return "string" != typeof t
    ? t
    : document.querySelector(t) ||
        ("production" !== process.env.NODE_ENV && hh("Cannot find element: " + t), document.createElement("div"));
}
var Ff = Object.freeze({
    createElement: function (t, e) {
      var n = document.createElement(t);
      return (
        "select" !== t ||
          (e.data && e.data.attrs && void 0 !== e.data.attrs.multiple && n.setAttribute("multiple", "multiple")),
        n
      );
    },
    createElementNS: function (t, e) {
      return document.createElementNS(kf[t], e);
    },
    createTextNode: function (t) {
      return document.createTextNode(t);
    },
    createComment: function (t) {
      return document.createComment(t);
    },
    insertBefore: function (t, e, n) {
      t.insertBefore(e, n);
    },
    removeChild: function (t, e) {
      t.removeChild(e);
    },
    appendChild: function (t, e) {
      t.appendChild(e);
    },
    parentNode: function (t) {
      return t.parentNode;
    },
    nextSibling: function (t) {
      return t.nextSibling;
    },
    tagName: function (t) {
      return t.tagName;
    },
    setTextContent: function (t, e) {
      t.textContent = e;
    },
    setStyleScope: function (t, e) {
      t.setAttribute(e, "");
    },
  }),
  Mf = {
    create: function (t, e) {
      Rf(e);
    },
    update: function (t, e) {
      t.data.ref !== e.data.ref && (Rf(t, !0), Rf(e));
    },
    destroy: function (t) {
      Rf(t, !0);
    },
  };
function Rf(t, e) {
  var n,
    r,
    i = t.data.ref;
  Zc(i) &&
    ((r = t.context),
    (n = t.componentInstance || t.elm),
    (r = r.$refs),
    e
      ? Array.isArray(r[i])
        ? pl(r[i], n)
        : r[i] === n && (r[i] = void 0)
      : t.data.refInFor
      ? Array.isArray(r[i])
        ? r[i].indexOf(n) < 0 && r[i].push(n)
        : (r[i] = [n])
      : (r[i] = n));
}
var Lf = new _h("", {}, []),
  If = ["create", "activate", "update", "remove", "destroy"];
function Gf(t, e) {
  return (
    t.key === e.key &&
    t.asyncFactory === e.asyncFactory &&
    ((t.tag === e.tag &&
      t.isComment === e.isComment &&
      Zc(t.data) === Zc(e.data) &&
      (function (t, e) {
        if ("input" !== t.tag) return !0;
        t = Zc((n = t.data)) && Zc((n = n.attrs)) && n.type;
        var n = Zc((n = e.data)) && Zc((n = n.attrs)) && n.type;
        return t === n || (Tf(t) && Tf(n));
      })(t, e)) ||
      (tl(t.isAsyncPlaceholder) && Qc(e.asyncFactory.error)))
  );
}
function $f(t, e, n) {
  for (var r, i = {}, a = e; a <= n; ++a) Zc((r = t[a].key)) && (i[r] = a);
  return i;
}
var Vf = {
  create: Uf,
  update: Uf,
  destroy: function (t) {
    Uf(t, Lf);
  },
};
function Uf(t, e) {
  (t.data.directives || e.data.directives) &&
    (function (t, e) {
      var n,
        r,
        i,
        a,
        o = t === Lf,
        s = e === Lf,
        c = Bf(t.data.directives, t.context),
        l = Bf(e.data.directives, e.context),
        h = [],
        d = [];
      for (n in l)
        (r = c[n]),
          (i = l[n]),
          r
            ? ((i.oldValue = r.value),
              (i.oldArg = r.arg),
              Wf(i, "update", e, t),
              i.def && i.def.componentUpdated && d.push(i))
            : (Wf(i, "bind", e, t), i.def && i.def.inserted && h.push(i));
      if (
        (h.length &&
          ((a = function () {
            for (var n = 0; n < h.length; n++) Wf(h[n], "inserted", e, t);
          }),
          o ? Td(e, "insert", a) : a()),
        d.length &&
          Td(e, "postpatch", function () {
            for (var n = 0; n < d.length; n++) Wf(d[n], "componentUpdated", e, t);
          }),
        !o)
      )
        for (n in c) l[n] || Wf(c[n], "unbind", t, t, s);
    })(t, e);
}
var jf = Object.create(null);
function Bf(t, e) {
  var n,
    r,
    i = Object.create(null);
  if (!t) return i;
  for (n = 0; n < t.length; n++)
    (r = t[n]).modifiers || (r.modifiers = jf), ((i[Hf(r)] = r).def = Hh(e.$options, "directives", r.name, !0));
  return i;
}
function Hf(t) {
  return t.rawName || t.name + "." + Object.keys(t.modifiers || {}).join(".");
}
function Wf(t, e, n, r, i) {
  var a = t.def && t.def[e];
  if (a)
    try {
      a(n.elm, t, n, r, i);
    } catch (r) {
      ed(r, n.context, "directive " + t.name + " " + e + " hook");
    }
}
var zf = [Mf, Vf];
function Kf(t, e) {
  var n = e.componentOptions;
  if (!((Zc(n) && !1 === n.Ctor.options.inheritAttrs) || (Qc(t.data.attrs) && Qc(e.data.attrs)))) {
    var r,
      i,
      a = e.elm,
      o = t.data.attrs || {},
      s = e.data.attrs || {};
    for (r in (s = Zc(s.__ob__) ? (e.data.attrs = kl({}, s)) : s)) (i = s[r]), o[r] !== i && Yf(a, r, i, e.data.pre);
    for (r in ((Kl || ql) && s.value !== o.value && Yf(a, "value", s.value), o))
      Qc(s[r]) && (yf(r) ? a.removeAttributeNS(mf, _f(r)) : ff(r) || a.removeAttribute(r));
  }
}
function Yf(t, e, n, r) {
  r || -1 < t.tagName.indexOf("-")
    ? qf(t, e, n)
    : vf(e)
    ? bf(n)
      ? t.removeAttribute(e)
      : ((n = "allowfullscreen" === e && "EMBED" === t.tagName ? "true" : e), t.setAttribute(e, n))
    : ff(e)
    ? t.setAttribute(e, gf(e, n))
    : yf(e)
    ? bf(n)
      ? t.removeAttributeNS(mf, _f(e))
      : t.setAttributeNS(mf, e, n)
    : qf(t, e, n);
}
function qf(t, e, n) {
  var r;
  bf(n)
    ? t.removeAttribute(e)
    : (!Kl ||
        Yl ||
        "TEXTAREA" !== t.tagName ||
        "placeholder" !== e ||
        "" === n ||
        t.__ieph ||
        ((r = function (e) {
          e.stopImmediatePropagation(), t.removeEventListener("input", r);
        }),
        t.addEventListener("input", r),
        (t.__ieph = !0)),
      t.setAttribute(e, n));
}
var Xf = { create: Kf, update: Kf };
function Jf(t, e) {
  var n = e.elm,
    r = e.data;
  t = t.data;
  (Qc(r.staticClass) && Qc(r.class) && (Qc(t) || (Qc(t.staticClass) && Qc(t.class)))) ||
    ((t = Sf(e)),
    (t = Zc((e = n._transitionClasses)) ? xf(t, Cf(e)) : t) !== n._prevClass &&
      (n.setAttribute("class", t), (n._prevClass = t)));
}
var Qf,
  Zf,
  tp,
  ep,
  np,
  rp,
  ip,
  ap = { create: Jf, update: Jf },
  op = /[\w).+\-_$\]]/;
function sp(t) {
  for (var e, n, r, i, a = !1, o = !1, s = !1, c = !1, l = 0, h = 0, d = 0, u = 0, f = 0; f < t.length; f++)
    if (((n = e), (e = t.charCodeAt(f)), a)) 39 === e && 92 !== n && (a = !1);
    else if (o) 34 === e && 92 !== n && (o = !1);
    else if (s) 96 === e && 92 !== n && (s = !1);
    else if (c) 47 === e && 92 !== n && (c = !1);
    else if (124 !== e || 124 === t.charCodeAt(f + 1) || 124 === t.charCodeAt(f - 1) || l || h || d) {
      switch (e) {
        case 34:
          o = !0;
          break;
        case 39:
          a = !0;
          break;
        case 96:
          s = !0;
          break;
        case 40:
          d++;
          break;
        case 41:
          d--;
          break;
        case 91:
          h++;
          break;
        case 93:
          h--;
          break;
        case 123:
          l++;
          break;
        case 125:
          l--;
      }
      if (47 === e) {
        for (var p = f - 1, g = void 0; 0 <= p && " " === (g = t.charAt(p)); p--);
        (g && op.test(g)) || (c = !0);
      }
    } else void 0 === r ? ((u = f + 1), (r = t.slice(0, f).trim())) : v();
  function v() {
    (i = i || []).push(t.slice(u, f).trim()), (u = f + 1);
  }
  if ((void 0 === r ? (r = t.slice(0, f).trim()) : 0 !== u && v(), i)) for (f = 0; f < i.length; f++) r = cp(r, i[f]);
  return r;
}
function cp(t, e) {
  var n;
  return (n = e.indexOf("(")) < 0
    ? '_f("' + e + '")(' + t + ")"
    : '_f("' + e.slice(0, n) + '")(' + t + (")" !== (n = e.slice(n + 1)) ? "," + n : n);
}
function lp(t, e) {
  console.error("[Vue compiler]: " + t);
}
function hp(t, e) {
  return t
    ? t
        .map(function (t) {
          return t[e];
        })
        .filter(function (t) {
          return t;
        })
    : [];
}
function dp(t, e, n, r, i) {
  (t.props || (t.props = [])).push(Sp({ name: e, value: n, dynamic: i }, r)), (t.plain = !1);
}
function up(t, e, n, r, i) {
  (i ? t.dynamicAttrs || (t.dynamicAttrs = []) : t.attrs || (t.attrs = [])).push(
    Sp({ name: e, value: n, dynamic: i }, r)
  ),
    (t.plain = !1);
}
function fp(t, e, n, r) {
  (t.attrsMap[e] = n), t.attrsList.push(Sp({ name: e, value: n }, r));
}
function pp(t, e, n, r, i, a, o, s) {
  (t.directives || (t.directives = [])).push(
    Sp({ name: e, rawName: n, value: r, arg: i, isDynamicArg: a, modifiers: o }, s)
  ),
    (t.plain = !1);
}
function gp(t, e, n) {
  return n ? "_p(" + e + ',"' + t + '")' : t + e;
}
function vp(t, e, n, r, i, a, o, s) {
  (r = r || Jc),
    "production" !== process.env.NODE_ENV &&
      a &&
      r.prevent &&
      r.passive &&
      a("passive and prevent can't be used together. Passive handler can't prevent default event.", o),
    r.right
      ? s
        ? (e = "(" + e + ")==='click'?'contextmenu':(" + e + ")")
        : "click" === e && ((e = "contextmenu"), delete r.right)
      : r.middle && (s ? (e = "(" + e + ")==='click'?'mouseup':(" + e + ")") : "click" === e && (e = "mouseup")),
    r.capture && (delete r.capture, (e = gp("!", e, s))),
    r.once && (delete r.once, (e = gp("~", e, s))),
    r.passive && (delete r.passive, (e = gp("&", e, s))),
    (a = r.native ? (delete r.native, t.nativeEvents || (t.nativeEvents = {})) : t.events || (t.events = {})),
    (o = Sp({ value: n.trim(), dynamic: s }, o)),
    r !== Jc && (o.modifiers = r),
    (r = a[e]),
    Array.isArray(r) ? (i ? r.unshift(o) : r.push(o)) : (a[e] = r ? (i ? [o, r] : [r, o]) : o),
    (t.plain = !1);
}
function mp(t, e) {
  return t.rawAttrsMap[":" + e] || t.rawAttrsMap["v-bind:" + e] || t.rawAttrsMap[e];
}
function yp(t, e, n) {
  var r = _p(t, ":" + e) || _p(t, "v-bind:" + e);
  return null != r ? sp(r) : !1 !== n && null != (e = _p(t, e)) ? JSON.stringify(e) : void 0;
}
function _p(t, e, n) {
  var r;
  if (null != (r = t.attrsMap[e]))
    for (var i = t.attrsList, a = 0, o = i.length; a < o; a++)
      if (i[a].name === e) {
        i.splice(a, 1);
        break;
      }
  return n && delete t.attrsMap[e], r;
}
function bp(t, e) {
  for (var n = t.attrsList, r = 0, i = n.length; r < i; r++) {
    var a = n[r];
    if (e.test(a.name)) return n.splice(r, 1), a;
  }
}
function Sp(t, e) {
  return e && (null != e.start && (t.start = e.start), null != e.end && (t.end = e.end)), t;
}
function wp(t, e, n) {
  var r = n || {},
    i = r.number;
  (n = "$$v"),
    (n = r.trim ? "(typeof $$v === 'string'? $$v.trim(): $$v)" : n),
    (n = xp(e, (n = i ? "_n(" + n + ")" : n)));
  t.model = { value: "(" + e + ")", expression: JSON.stringify(e), callback: "function ($$v) {" + n + "}" };
}
function xp(t, e) {
  var n = (function (t) {
    if (((t = t.trim()), (Qf = t.length), t.indexOf("[") < 0 || t.lastIndexOf("]") < Qf - 1))
      return -1 < (ep = t.lastIndexOf("."))
        ? { exp: t.slice(0, ep), key: '"' + t.slice(ep + 1) + '"' }
        : { exp: t, key: null };
    for (Zf = t, ep = np = rp = 0; !kp(); ) Ep((tp = Cp())) ? Op(tp) : 91 === tp && Np(tp);
    return { exp: t.slice(0, np), key: t.slice(np + 1, rp) };
  })(t);
  return null === n.key ? t + "=" + e : "$set(" + n.exp + ", " + n.key + ", " + e + ")";
}
function Cp() {
  return Zf.charCodeAt(++ep);
}
function kp() {
  return Qf <= ep;
}
function Ep(t) {
  return 34 === t || 39 === t;
}
function Np(t) {
  var e = 1;
  for (np = ep; !kp(); )
    if (Ep((t = Cp()))) Op(t);
    else if ((91 === t && e++, 93 === t && e--, 0 === e)) {
      rp = ep;
      break;
    }
}
function Op(t) {
  for (var e = t; !kp() && (t = Cp()) !== e; );
}
var Ap,
  Pp = "__r",
  Tp = "__c";
function Dp(t, e, n) {
  var r = Ap;
  return function i() {
    null !== e.apply(null, arguments) && Rp(t, i, n, r);
  };
}
var Fp = bd && !(Jl && Number(Jl[1]) <= 53);
function Mp(t, e, n, r) {
  var i, a;
  Fp &&
    ((i = $u),
    (e = (a = e)._wrapper =
      function (t) {
        if (t.target === t.currentTarget || t.timeStamp >= i || t.timeStamp <= 0 || t.target.ownerDocument !== document)
          return a.apply(this, arguments);
      })),
    Ap.addEventListener(t, e, Zl ? { capture: n, passive: r } : n);
}
function Rp(t, e, n, r) {
  (r || Ap).removeEventListener(t, e._wrapper || e, n);
}
function Lp(t, e) {
  var n;
  (Qc(t.data.on) && Qc(e.data.on)) ||
    ((n = e.data.on || {}),
    (t = t.data.on || {}),
    (Ap = e.elm),
    (function (t) {
      var e;
      Zc(t[Pp]) && ((t[(e = Kl ? "change" : "input")] = [].concat(t[Pp], t[e] || [])), delete t[Pp]),
        Zc(t[Tp]) && ((t.change = [].concat(t[Tp], t.change || [])), delete t[Tp]);
    })(n),
    Pd(n, t, Mp, Rp, Dp, e.context),
    (Ap = void 0));
}
var Ip,
  Gp = { create: Lp, update: Lp };
function $p(t, e) {
  if (!Qc(t.data.domProps) || !Qc(e.data.domProps)) {
    var n,
      r,
      i = e.elm,
      a = t.data.domProps || {},
      o = e.data.domProps || {};
    for (n in (Zc(o.__ob__) && (o = e.data.domProps = kl({}, o)), a)) n in o || (i[n] = "");
    for (n in o) {
      if (((r = o[n]), "textContent" === n || "innerHTML" === n)) {
        if ((e.children && (e.children.length = 0), r === a[n])) continue;
        1 === i.childNodes.length && i.removeChild(i.childNodes[0]);
      }
      if ("value" === n && "PROGRESS" !== i.tagName) {
        var s = Qc((i._value = r)) ? "" : String(r);
        Vp(i, s) && (i.value = s);
      } else if ("innerHTML" === n && Nf(i.tagName) && Qc(i.innerHTML)) {
        (Ip = Ip || document.createElement("div")).innerHTML = "<svg>" + r + "</svg>";
        for (var c = Ip.firstChild; i.firstChild; ) i.removeChild(i.firstChild);
        for (; c.firstChild; ) i.appendChild(c.firstChild);
      } else if (r !== a[n])
        try {
          i[n] = r;
        } catch (t) {}
    }
  }
}
function Vp(t, e) {
  return (
    !t.composing &&
    ("OPTION" === t.tagName ||
      (function (t, e) {
        var n = !0;
        try {
          n = document.activeElement !== t;
        } catch (t) {}
        return n && t.value !== e;
      })(t, e) ||
      (function (t, e) {
        var n = t.value;
        t = t._vModifiers;
        if (Zc(t)) {
          if (t.number) return hl(n) !== hl(e);
          if (t.trim) return n.trim() !== e.trim();
        }
        return n !== e;
      })(t, e))
  );
}
var Up = { create: $p, update: $p },
  jp = ml(function (t) {
    var e = {},
      n = /:(.+)/;
    return (
      t.split(/;(?![^(]*\))/g).forEach(function (t) {
        !t || (1 < (t = t.split(n)).length && (e[t[0].trim()] = t[1].trim()));
      }),
      e
    );
  });
function Bp(t) {
  var e = Hp(t.style);
  return t.staticStyle ? kl(t.staticStyle, e) : e;
}
function Hp(t) {
  return Array.isArray(t) ? El(t) : "string" == typeof t ? jp(t) : t;
}
var Wp,
  zp = /^--/,
  Kp = /\s*!important$/,
  Yp = function (t, e, n) {
    if (zp.test(e)) t.style.setProperty(e, n);
    else if (Kp.test(n)) t.style.setProperty(wl(e), n.replace(Kp, ""), "important");
    else {
      var r = Xp(e);
      if (Array.isArray(n)) for (var i = 0, a = n.length; i < a; i++) t.style[r] = n[i];
      else t.style[r] = n;
    }
  },
  qp = ["Webkit", "Moz", "ms"],
  Xp = ml(function (t) {
    if (((Wp = Wp || document.createElement("div").style), "filter" !== (t = _l(t)) && t in Wp)) return t;
    for (var e = t.charAt(0).toUpperCase() + t.slice(1), n = 0; n < qp.length; n++) {
      var r = qp[n] + e;
      if (r in Wp) return r;
    }
  });
function Jp(t, e) {
  var n = e.data;
  t = t.data;
  if (!(Qc(n.staticStyle) && Qc(n.style) && Qc(t.staticStyle) && Qc(t.style))) {
    var r,
      i,
      a = e.elm,
      o = ((n = t.staticStyle), (t = t.normalizedStyle || t.style || {}), n || t);
    t = Hp(e.data.style) || {};
    e.data.normalizedStyle = Zc(t.__ob__) ? kl({}, t) : t;
    var s = (function (t, e) {
      var n,
        r = {};
      if (e)
        for (var i = t; i.componentInstance; )
          (i = i.componentInstance._vnode) && i.data && (n = Bp(i.data)) && kl(r, n);
      (n = Bp(t.data)) && kl(r, n);
      for (var a = t; (a = a.parent); ) a.data && (n = Bp(a.data)) && kl(r, n);
      return r;
    })(e, !0);
    for (i in o) Qc(s[i]) && Yp(a, i, "");
    for (i in s) (r = s[i]) !== o[i] && Yp(a, i, null == r ? "" : r);
  }
}
var Qp = { create: Jp, update: Jp },
  Zp = /\s+/;
function tg(t, e) {
  var n;
  (e = e && e.trim()) &&
    (t.classList
      ? -1 < e.indexOf(" ")
        ? e.split(Zp).forEach(function (e) {
            return t.classList.add(e);
          })
        : t.classList.add(e)
      : (n = " " + (t.getAttribute("class") || "") + " ").indexOf(" " + e + " ") < 0 &&
        t.setAttribute("class", (n + e).trim()));
}
function eg(t, e) {
  if ((e = e && e.trim()))
    if (t.classList)
      -1 < e.indexOf(" ")
        ? e.split(Zp).forEach(function (e) {
            return t.classList.remove(e);
          })
        : t.classList.remove(e),
        t.classList.length || t.removeAttribute("class");
    else {
      for (var n = " " + (t.getAttribute("class") || "") + " ", r = " " + e + " "; 0 <= n.indexOf(r); )
        n = n.replace(r, " ");
      (n = n.trim()) ? t.setAttribute("class", n) : t.removeAttribute("class");
    }
}
function ng(t) {
  if (t) {
    if ("object" != typeof t) return "string" == typeof t ? rg(t) : void 0;
    var e = {};
    return !1 !== t.css && kl(e, rg(t.name || "v")), kl(e, t), e;
  }
}
var rg = ml(function (t) {
    return {
      enterClass: t + "-enter",
      enterToClass: t + "-enter-to",
      enterActiveClass: t + "-enter-active",
      leaveClass: t + "-leave",
      leaveToClass: t + "-leave-to",
      leaveActiveClass: t + "-leave-active",
    };
  }),
  ig = Bl && !Yl,
  ag = "transition",
  og = "animation",
  sg = "transition",
  cg = "transitionend",
  lg = "animation",
  hg = "animationend";
ig &&
  (void 0 === window.ontransitionend &&
    void 0 !== window.onwebkittransitionend &&
    ((sg = "WebkitTransition"), (cg = "webkitTransitionEnd")),
  void 0 === window.onanimationend &&
    void 0 !== window.onwebkitanimationend &&
    ((lg = "WebkitAnimation"), (hg = "webkitAnimationEnd")));
var dg = Bl
  ? window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout
  : function (t) {
      return t();
    };
function ug(t) {
  dg(function () {
    dg(t);
  });
}
function fg(t, e) {
  var n = t._transitionClasses || (t._transitionClasses = []);
  n.indexOf(e) < 0 && (n.push(e), tg(t, e));
}
function pg(t, e) {
  t._transitionClasses && pl(t._transitionClasses, e), eg(t, e);
}
function gg(t, e, n) {
  var r = mg(t, e),
    i = r.type,
    a = ((e = r.timeout), r.propCount);
  if (!i) return n();
  function o() {
    t.removeEventListener(s, l), n();
  }
  var s = i === ag ? cg : hg,
    c = 0,
    l = function (e) {
      e.target === t && ++c >= a && o();
    };
  setTimeout(function () {
    c < a && o();
  }, e + 1),
    t.addEventListener(s, l);
}
var vg = /\b(transform|all)(,|$)/;
function mg(t, e) {
  var n,
    r = window.getComputedStyle(t),
    i = (r[sg + "Delay"] || "").split(", "),
    a = (r[sg + "Duration"] || "").split(", "),
    o = yg(i, a),
    s = (r[lg + "Delay"] || "").split(", "),
    c = (r[lg + "Duration"] || "").split(", ");
  (t = yg(s, c)), (i = 0), (s = 0);
  return (
    e === ag
      ? 0 < o && ((n = ag), (i = o), (s = a.length))
      : e === og
      ? 0 < t && ((n = og), (i = t), (s = c.length))
      : (s = (n = 0 < (i = Math.max(o, t)) ? (t < o ? ag : og) : null) ? (n === ag ? a : c).length : 0),
    { type: n, timeout: i, propCount: s, hasTransform: n === ag && vg.test(r[sg + "Property"]) }
  );
}
function yg(t, e) {
  for (; t.length < e.length; ) t = t.concat(t);
  return Math.max.apply(
    null,
    e.map(function (e, n) {
      return _g(e) + _g(t[n]);
    })
  );
}
function _g(t) {
  return 1e3 * Number(t.slice(0, -1).replace(",", "."));
}
function bg(t, e) {
  var n = t.elm;
  if (
    (Zc(n._leaveCb) && ((n._leaveCb.cancelled = !0), n._leaveCb()),
    !Qc((D = ng(t.data.transition))) && !Zc(n._enterCb) && 1 === n.nodeType)
  ) {
    for (
      var r = D.css,
        i = D.type,
        a = D.enterClass,
        o = D.enterToClass,
        s = D.enterActiveClass,
        c = D.appearClass,
        l = D.appearToClass,
        h = D.appearActiveClass,
        d = D.beforeEnter,
        u = D.enter,
        f = D.afterEnter,
        p = D.enterCancelled,
        g = D.beforeAppear,
        v = D.appear,
        m = D.afterAppear,
        y = D.appearCancelled,
        _ = D.duration,
        b = xu,
        S = xu.$vnode;
      S && S.parent;

    )
      (b = S.context), (S = S.parent);
    var w, x, C, k, E, N, O, A, P, T, D;
    ((D = !b._isMounted || !t.isRootInsert) && !v && "" !== v) ||
      ((w = D && c ? c : a),
      (x = D && h ? h : s),
      (C = D && l ? l : o),
      (d = (D && g) || d),
      (k = D && "function" == typeof v ? v : u),
      (E = (D && m) || f),
      (N = (D && y) || p),
      (O = hl(nl(_) ? _.enter : _)),
      "production" !== process.env.NODE_ENV && null != O && wg(O, "enter", t),
      (A = !1 !== r && !Yl),
      (P = Cg(k)),
      (T = n._enterCb =
        Dl(function () {
          A && (pg(n, C), pg(n, x)), T.cancelled ? (A && pg(n, w), N && N(n)) : E && E(n), (n._enterCb = null);
        })),
      t.data.show ||
        Td(t, "insert", function () {
          var e;
          (e = (e = n.parentNode) && e._pending && e._pending[t.key]) &&
            e.tag === t.tag &&
            e.elm._leaveCb &&
            e.elm._leaveCb(),
            k && k(n, T);
        }),
      d && d(n),
      A &&
        (fg(n, w),
        fg(n, x),
        ug(function () {
          pg(n, w), T.cancelled || (fg(n, C), P || (xg(O) ? setTimeout(T, O) : gg(n, i, T)));
        })),
      t.data.show && (e && e(), k && k(n, T)),
      A || P || T());
  }
}
function Sg(t, e) {
  var n = t.elm;
  Zc(n._enterCb) && ((n._enterCb.cancelled = !0), n._enterCb());
  var r,
    i,
    a,
    o,
    s,
    c,
    l,
    h,
    d,
    u,
    f,
    p,
    g,
    v,
    m = ng(t.data.transition);
  if (Qc(m) || 1 !== n.nodeType) return e();
  function y() {
    v.cancelled ||
      (!t.data.show && n.parentNode && ((n.parentNode._pending || (n.parentNode._pending = {}))[t.key] = t),
      c && c(n),
      f &&
        (fg(n, a),
        fg(n, s),
        ug(function () {
          pg(n, a), v.cancelled || (fg(n, o), p || (xg(g) ? setTimeout(v, g) : gg(n, i, v)));
        })),
      l && l(n, v),
      f || p || v());
  }
  Zc(n._leaveCb) ||
    ((r = m.css),
    (i = m.type),
    (a = m.leaveClass),
    (o = m.leaveToClass),
    (s = m.leaveActiveClass),
    (c = m.beforeLeave),
    (l = m.leave),
    (h = m.afterLeave),
    (d = m.leaveCancelled),
    (u = m.delayLeave),
    (m = m.duration),
    (f = !1 !== r && !Yl),
    (p = Cg(l)),
    (g = hl(nl(m) ? m.leave : m)),
    "production" !== process.env.NODE_ENV && Zc(g) && wg(g, "leave", t),
    (v = n._leaveCb =
      Dl(function () {
        n.parentNode && n.parentNode._pending && (n.parentNode._pending[t.key] = null),
          f && (pg(n, o), pg(n, s)),
          v.cancelled ? (f && pg(n, a), d && d(n)) : (e(), h && h(n)),
          (n._leaveCb = null);
      })),
    u ? u(y) : y());
}
function wg(t, e, n) {
  "number" != typeof t
    ? hh("<transition> explicit " + e + " duration is not a valid number - got " + JSON.stringify(t) + ".", n.context)
    : isNaN(t) &&
      hh("<transition> explicit " + e + " duration is NaN - the duration expression might be incorrect.", n.context);
}
function xg(t) {
  return "number" == typeof t && !isNaN(t);
}
function Cg(t) {
  if (Qc(t)) return !1;
  var e = t.fns;
  return Zc(e) ? Cg(Array.isArray(e) ? e[0] : e) : 1 < (t._length || t.length);
}
function kg(t, e) {
  !0 !== e.data.show && bg(e);
}
var Eg = Bl
    ? {
        create: kg,
        activate: kg,
        remove: function (t, e) {
          !0 !== t.data.show ? Sg(t, e) : e();
        },
      }
    : {},
  Ng = (function (t) {
    for (var e, n = {}, r = t.modules, i = t.nodeOps, a = 0; a < If.length; ++a)
      for (n[If[a]] = [], e = 0; e < r.length; ++e) Zc(r[e][If[a]]) && n[If[a]].push(r[e][If[a]]);
    function o(t, e) {
      function n() {
        0 == --n.listeners && s(t);
      }
      return (n.listeners = e), n;
    }
    function s(t) {
      var e = i.parentNode(t);
      Zc(e) && i.removeChild(e, t);
    }
    function c(t, e) {
      return (
        !e &&
        !t.ns &&
        (!Ll.ignoredElements.length ||
          !Ll.ignoredElements.some(function (e) {
            return ol(e) ? e.test(t.tag) : e === t.tag;
          })) &&
        Ll.isUnknownElement(t.tag)
      );
    }
    var l = 0;
    function h(t, e, r, a, o, s, h) {
      ((t = Zc(t.elm) && Zc(s) ? (s[h] = xh(t)) : t).isRootInsert = !o),
        (function (t, e, r, i) {
          var a = t.data;
          if (Zc(a)) {
            var o = Zc(t.componentInstance) && a.keepAlive;
            if ((Zc((a = a.hook)) && Zc((a = a.init)) && a(t, !1), Zc(t.componentInstance)))
              return (
                d(t, e),
                u(r, t.elm, i),
                tl(o) &&
                  (function (t, e, r, i) {
                    for (var a, o = t; o.componentInstance; )
                      if (Zc((a = (o = o.componentInstance._vnode).data)) && Zc((a = a.transition))) {
                        for (a = 0; a < n.activate.length; ++a) n.activate[a](Lf, o);
                        e.push(o);
                        break;
                      }
                    u(r, t.elm, i);
                  })(t, e, r, i),
                !0
              );
          }
        })(t, e, r, a) ||
          ((s = t.data),
          (h = t.children),
          Zc((o = t.tag))
            ? ("production" !== process.env.NODE_ENV &&
                (s && s.pre && l++,
                c(t, l) &&
                  hh(
                    "Unknown custom element: <" +
                      o +
                      '> - did you register the component correctly? For recursive components, make sure to provide the "name" option.',
                    t.context
                  )),
              (t.elm = t.ns ? i.createElementNS(t.ns, o) : i.createElement(o, t)),
              v(t),
              f(t, h, e),
              Zc(s) && g(t, e),
              u(r, t.elm, a),
              "production" !== process.env.NODE_ENV && s && s.pre && l--)
            : (tl(t.isComment) ? (t.elm = i.createComment(t.text)) : (t.elm = i.createTextNode(t.text)),
              u(r, t.elm, a)));
    }
    function d(t, e) {
      Zc(t.data.pendingInsert) && (e.push.apply(e, t.data.pendingInsert), (t.data.pendingInsert = null)),
        (t.elm = t.componentInstance.$el),
        p(t) ? (g(t, e), v(t)) : (Rf(t), e.push(t));
    }
    function u(t, e, n) {
      Zc(t) && (Zc(n) ? i.parentNode(n) === t && i.insertBefore(t, e, n) : i.appendChild(t, e));
    }
    function f(t, e, n) {
      if (Array.isArray(e)) {
        "production" !== process.env.NODE_ENV && b(e);
        for (var r = 0; r < e.length; ++r) h(e[r], n, t.elm, null, !0, e, r);
      } else el(t.text) && i.appendChild(t.elm, i.createTextNode(String(t.text)));
    }
    function p(t) {
      for (; t.componentInstance; ) t = t.componentInstance._vnode;
      return Zc(t.tag);
    }
    function g(t, e) {
      for (var r = 0; r < n.create.length; ++r) n.create[r](Lf, t);
      Zc((a = t.data.hook)) && (Zc(a.create) && a.create(Lf, t), Zc(a.insert) && e.push(t));
    }
    function v(t) {
      var e;
      if (Zc((e = t.fnScopeId))) i.setStyleScope(t.elm, e);
      else
        for (var n = t; n; )
          Zc((e = n.context)) && Zc((e = e.$options._scopeId)) && i.setStyleScope(t.elm, e), (n = n.parent);
      Zc((e = xu)) &&
        e !== t.context &&
        e !== t.fnContext &&
        Zc((e = e.$options._scopeId)) &&
        i.setStyleScope(t.elm, e);
    }
    function m(t, e, n, r, i, a) {
      for (; r <= i; ++r) h(n[r], a, t, e, !1, n, r);
    }
    function y(t) {
      var e,
        r,
        i = t.data;
      if (Zc(i))
        for (Zc((e = i.hook)) && Zc((e = e.destroy)) && e(t), e = 0; e < n.destroy.length; ++e) n.destroy[e](t);
      if (Zc((e = t.children))) for (r = 0; r < t.children.length; ++r) y(t.children[r]);
    }
    function _(t, e, r) {
      for (; e <= r; ++e) {
        var i = t[e];
        Zc(i) &&
          (Zc(i.tag)
            ? ((function t(e, r) {
                if (Zc(r) || Zc(e.data)) {
                  var i,
                    a = n.remove.length + 1;
                  for (
                    Zc(r) ? (r.listeners += a) : (r = o(e.elm, a)),
                      Zc((i = e.componentInstance)) && Zc((i = i._vnode)) && Zc(i.data) && t(i, r),
                      i = 0;
                    i < n.remove.length;
                    ++i
                  )
                    n.remove[i](e, r);
                  Zc((i = e.data.hook)) && Zc((i = i.remove)) ? i(e, r) : r();
                } else s(e.elm);
              })(i),
              y(i))
            : s(i.elm));
      }
    }
    function b(t) {
      for (var e = {}, n = 0; n < t.length; n++) {
        var r = t[n],
          i = r.key;
        Zc(i) &&
          (e[i] ? hh("Duplicate keys detected: '" + i + "'. This may cause an update error.", r.context) : (e[i] = !0));
      }
    }
    function S(t, e, r, a, o, s) {
      if (t !== e) {
        var c = ((e = Zc(e.elm) && Zc(a) ? (a[o] = xh(e)) : e).elm = t.elm);
        if (tl(t.isAsyncPlaceholder)) Zc(e.asyncFactory.resolved) ? k(t.elm, e, r) : (e.isAsyncPlaceholder = !0);
        else if (tl(e.isStatic) && tl(t.isStatic) && e.key === t.key && (tl(e.isCloned) || tl(e.isOnce)))
          e.componentInstance = t.componentInstance;
        else {
          var l,
            d = e.data;
          if (
            (Zc(d) && Zc((l = d.hook)) && Zc((l = l.prepatch)) && l(t, e),
            (a = t.children),
            (o = e.children),
            Zc(d) && p(e))
          ) {
            for (l = 0; l < n.update.length; ++l) n.update[l](t, e);
            Zc((l = d.hook)) && Zc((l = l.update)) && l(t, e);
          }
          Qc(e.text)
            ? Zc(a) && Zc(o)
              ? a !== o &&
                (function (t, e, n, r, a) {
                  var o,
                    s,
                    c,
                    l = 0,
                    d = 0,
                    u = e.length - 1,
                    f = e[0],
                    p = e[u],
                    g = n.length - 1,
                    v = n[0],
                    y = n[g],
                    w = !a;
                  for ("production" !== process.env.NODE_ENV && b(n); l <= u && d <= g; )
                    Qc(f)
                      ? (f = e[++l])
                      : Qc(p)
                      ? (p = e[--u])
                      : Gf(f, v)
                      ? (S(f, v, r, n, d), (f = e[++l]), (v = n[++d]))
                      : Gf(p, y)
                      ? (S(p, y, r, n, g), (p = e[--u]), (y = n[--g]))
                      : Gf(f, y)
                      ? (S(f, y, r, n, g),
                        w && i.insertBefore(t, f.elm, i.nextSibling(p.elm)),
                        (f = e[++l]),
                        (y = n[--g]))
                      : (Gf(p, v)
                          ? (S(p, v, r, n, d), w && i.insertBefore(t, p.elm, f.elm), (p = e[--u]))
                          : (Qc(o) && (o = $f(e, l, u)),
                            !Qc(
                              (s = Zc(v.key)
                                ? o[v.key]
                                : (function (t, e, n, r) {
                                    for (var i = n; i < r; i++) {
                                      var a = e[i];
                                      if (Zc(a) && Gf(t, a)) return i;
                                    }
                                  })(v, e, l, u))
                            ) && Gf((c = e[s]), v)
                              ? (S(c, v, r, n, d), (e[s] = void 0), w && i.insertBefore(t, c.elm, f.elm))
                              : h(v, r, t, f.elm, !1, n, d)),
                        (v = n[++d]));
                  u < l ? m(t, Qc(n[g + 1]) ? null : n[g + 1].elm, n, d, g, r) : g < d && _(e, l, u);
                })(c, a, o, r, s)
              : Zc(o)
              ? ("production" !== process.env.NODE_ENV && b(o),
                Zc(t.text) && i.setTextContent(c, ""),
                m(c, null, o, 0, o.length - 1, r))
              : Zc(a)
              ? _(a, 0, a.length - 1)
              : Zc(t.text) && i.setTextContent(c, "")
            : t.text !== e.text && i.setTextContent(c, e.text),
            Zc(d) && Zc((l = d.hook)) && Zc((l = l.postpatch)) && l(t, e);
        }
      }
    }
    function w(t, e, n) {
      if (tl(n) && Zc(t.parent)) t.parent.data.pendingInsert = e;
      else for (var r = 0; r < e.length; ++r) e[r].data.hook.insert(e[r]);
    }
    var x = !1,
      C = dl("attrs,class,staticClass,staticStyle,key");
    function k(t, e, n, r) {
      var i,
        a,
        o,
        s,
        l = e.tag,
        h = e.data,
        u = e.children;
      if (((r = r || (h && h.pre)), (e.elm = t), tl(e.isComment) && Zc(e.asyncFactory)))
        return (e.isAsyncPlaceholder = !0);
      if (
        "production" === process.env.NODE_ENV ||
        ((a = t),
        (s = r),
        Zc((o = e).tag)
          ? 0 === o.tag.indexOf("vue-component") ||
            (!c(o, s) && o.tag.toLowerCase() === (a.tagName && a.tagName.toLowerCase()))
          : a.nodeType === (o.isComment ? 8 : 3))
      ) {
        if (Zc(h) && (Zc((i = h.hook)) && Zc((i = i.init)) && i(e, !0), Zc((i = e.componentInstance))))
          return d(e, n), 1;
        if (Zc(l)) {
          if (Zc(u))
            if (t.hasChildNodes())
              if (Zc((i = h)) && Zc((i = i.domProps)) && Zc((i = i.innerHTML))) {
                if (i !== t.innerHTML)
                  return void (
                    "production" === process.env.NODE_ENV ||
                    "undefined" == typeof console ||
                    x ||
                    ((x = !0),
                    console.warn("Parent: ", t),
                    console.warn("server innerHTML: ", i),
                    console.warn("client innerHTML: ", t.innerHTML))
                  );
              } else {
                for (var p = !0, v = t.firstChild, m = 0; m < u.length; m++) {
                  if (!v || !k(v, u[m], n, r)) {
                    p = !1;
                    break;
                  }
                  v = v.nextSibling;
                }
                if (!p || v)
                  return void (
                    "production" === process.env.NODE_ENV ||
                    "undefined" == typeof console ||
                    x ||
                    ((x = !0),
                    console.warn("Parent: ", t),
                    console.warn("Mismatching childNodes vs. VNodes: ", t.childNodes, u))
                  );
              }
            else f(e, u, n);
          if (Zc(h)) {
            var y,
              _ = !1;
            for (y in h)
              if (!C(y)) {
                (_ = !0), g(e, n);
                break;
              }
            !_ && h.class && Ed(h.class);
          }
        } else t.data !== e.text && (t.data = e.text);
        return 1;
      }
    }
    return function (t, e, r, a) {
      if (!Qc(e)) {
        var o = !1,
          s = [];
        if (Qc(t)) (o = !0), h(e, s);
        else {
          var c = Zc(t.nodeType);
          if (!c && Gf(t, e)) S(t, e, s, null, null, a);
          else {
            if (c) {
              if ((1 === t.nodeType && t.hasAttribute(Fl) && (t.removeAttribute(Fl), (r = !0)), tl(r))) {
                if (k(t, e, s)) return w(e, s, !0), t;
                "production" !== process.env.NODE_ENV &&
                  hh(
                    "The client-side rendered virtual DOM tree is not matching server-rendered content. This is likely caused by incorrect HTML markup, for example nesting block-level elements inside <p>, or missing <tbody>. Bailing hydration and performing full client-side render."
                  );
              }
              (l = t), (t = new _h(i.tagName(l).toLowerCase(), {}, [], void 0, l));
            }
            r = t.elm;
            var l = i.parentNode(r);
            if ((h(e, s, r._leaveCb ? null : l, i.nextSibling(r)), Zc(e.parent)))
              for (var d = e.parent, u = p(e); d; ) {
                for (var f = 0; f < n.destroy.length; ++f) n.destroy[f](d);
                if (((d.elm = e.elm), u)) {
                  for (var g = 0; g < n.create.length; ++g) n.create[g](Lf, d);
                  var v = d.data.hook.insert;
                  if (v.merged) for (var m = 1; m < v.fns.length; m++) v.fns[m]();
                } else Rf(d);
                d = d.parent;
              }
            Zc(l) ? _([t], 0, 0) : Zc(t.tag) && y(t);
          }
        }
        return w(e, s, o), e.elm;
      }
      Zc(t) && y(t);
    };
  })({ nodeOps: Ff, modules: [Xf, ap, Gp, Up, Qp, Eg].concat(zf) });
Yl &&
  document.addEventListener("selectionchange", function () {
    var t = document.activeElement;
    t && t.vmodel && Rg(t, "input");
  });
var Og = {
  inserted: function (t, e, n, r) {
    "select" === n.tag
      ? (r.elm && !r.elm._vOptions
          ? Td(n, "postpatch", function () {
              Og.componentUpdated(t, e, n);
            })
          : Ag(t, e, n.context),
        (t._vOptions = [].map.call(t.options, Dg)))
      : ("textarea" !== n.tag && !Tf(t.type)) ||
        ((t._vModifiers = e.modifiers),
        e.modifiers.lazy ||
          (t.addEventListener("compositionstart", Fg),
          t.addEventListener("compositionend", Mg),
          t.addEventListener("change", Mg),
          Yl && (t.vmodel = !0)));
  },
  componentUpdated: function (t, e, n) {
    var r, i;
    "select" === n.tag &&
      (Ag(t, e, n.context),
      (r = t._vOptions),
      (i = t._vOptions = [].map.call(t.options, Dg)).some(function (t, e) {
        return !Pl(t, r[e]);
      }) &&
        (t.multiple
          ? e.value.some(function (t) {
              return Tg(t, i);
            })
          : e.value !== e.oldValue && Tg(e.value, i)) &&
        Rg(t, "change"));
  },
};
function Ag(t, e, n) {
  Pg(t, e, n),
    (Kl || ql) &&
      setTimeout(function () {
        Pg(t, e, n);
      }, 0);
}
function Pg(t, e, n) {
  var r = e.value,
    i = t.multiple;
  if (!i || Array.isArray(r)) {
    for (var a, o, s = 0, c = t.options.length; s < c; s++)
      if (((o = t.options[s]), i)) (a = -1 < Tl(r, Dg(o))), o.selected !== a && (o.selected = a);
      else if (Pl(Dg(o), r)) return void (t.selectedIndex !== s && (t.selectedIndex = s));
    i || (t.selectedIndex = -1);
  } else
    "production" !== process.env.NODE_ENV &&
      hh(
        '<select multiple v-model="' +
          e.expression +
          '"> expects an Array value for its binding, but got ' +
          Object.prototype.toString.call(r).slice(8, -1),
        n
      );
}
function Tg(t, e) {
  return e.every(function (e) {
    return !Pl(e, t);
  });
}
function Dg(t) {
  return "_value" in t ? t._value : t.value;
}
function Fg(t) {
  t.target.composing = !0;
}
function Mg(t) {
  t.target.composing && ((t.target.composing = !1), Rg(t.target, "input"));
}
function Rg(t, e) {
  var n = document.createEvent("HTMLEvents");
  n.initEvent(e, !0, !0), t.dispatchEvent(n);
}
function Lg(t) {
  return !t.componentInstance || (t.data && t.data.transition) ? t : Lg(t.componentInstance._vnode);
}
var Ig = {
    bind: function (t, e, n) {
      var r = e.value,
        i =
          ((e = (n = Lg(n)).data && n.data.transition),
          (t.__vOriginalDisplay = "none" === t.style.display ? "" : t.style.display));
      r && e
        ? ((n.data.show = !0),
          bg(n, function () {
            t.style.display = i;
          }))
        : (t.style.display = r ? i : "none");
    },
    update: function (t, e, n) {
      var r = e.value;
      !r != !e.oldValue &&
        ((n = Lg(n)).data && n.data.transition
          ? ((n.data.show = !0),
            r
              ? bg(n, function () {
                  t.style.display = t.__vOriginalDisplay;
                })
              : Sg(n, function () {
                  t.style.display = "none";
                }))
          : (t.style.display = r ? t.__vOriginalDisplay : "none"));
    },
    unbind: function (t, e, n, r, i) {
      i || (t.style.display = t.__vOriginalDisplay);
    },
  },
  Gg = { model: Og, show: Ig },
  $g = {
    name: String,
    appear: Boolean,
    css: Boolean,
    mode: String,
    type: String,
    enterClass: String,
    leaveClass: String,
    enterToClass: String,
    leaveToClass: String,
    enterActiveClass: String,
    leaveActiveClass: String,
    appearClass: String,
    appearActiveClass: String,
    appearToClass: String,
    duration: [Number, String, Object],
  };
function Vg(t) {
  var e = t && t.componentOptions;
  return e && e.Ctor.options.abstract ? Vg(yu(e.children)) : t;
}
function Ug(t) {
  var e,
    n = {},
    r = t.$options;
  for (e in r.propsData) n[e] = t[e];
  var i,
    a = r._parentListeners;
  for (i in a) n[_l(i)] = a[i];
  return n;
}
function jg(t, e) {
  if (/\d-keep-alive$/.test(e.tag)) return t("keep-alive", { props: e.componentOptions.propsData });
}
var Bg = function (t) {
    return t.tag || $d(t);
  },
  Hg = function (t) {
    return "show" === t.name;
  },
  Wg = {
    name: "transition",
    props: $g,
    abstract: !0,
    render: function (t) {
      var e = this;
      if ((c = this.$slots.default) && (c = c.filter(Bg)).length) {
        "production" !== process.env.NODE_ENV &&
          1 < c.length &&
          hh("<transition> can only be used on a single element. Use <transition-group> for lists.", this.$parent);
        var n = this.mode;
        "production" !== process.env.NODE_ENV &&
          n &&
          "in-out" !== n &&
          "out-in" !== n &&
          hh("invalid <transition> mode: " + n, this.$parent);
        var r = c[0];
        if (
          (function (t) {
            for (; (t = t.parent); ) if (t.data.transition) return !0;
          })(this.$vnode)
        )
          return r;
        var i = Vg(r);
        if (!i) return r;
        if (this._leaving) return jg(t, r);
        var a = "__transition-" + this._uid + "-";
        i.key =
          null == i.key
            ? i.isComment
              ? a + "comment"
              : a + i.tag
            : el(i.key) && 0 !== String(i.key).indexOf(a)
            ? a + i.key
            : i.key;
        var o = ((i.data || (i.data = {})).transition = Ug(this));
        a = Vg((c = this._vnode));
        if (
          (i.data.directives && i.data.directives.some(Hg) && (i.data.show = !0),
          a &&
            a.data &&
            !(function (t, e) {
              return e.key === t.key && e.tag === t.tag;
            })(i, a) &&
            !$d(a) &&
            (!a.componentInstance || !a.componentInstance._vnode.isComment))
        ) {
          if (((a = a.data.transition = kl({}, o)), "out-in" === n))
            return (
              (this._leaving = !0),
              Td(a, "afterLeave", function () {
                (e._leaving = !1), e.$forceUpdate();
              }),
              jg(t, r)
            );
          if ("in-out" === n) {
            if ($d(i)) return c;
            var s, c;
            Td(
              o,
              "afterEnter",
              (c = function () {
                s();
              })
            ),
              Td(o, "enterCancelled", c),
              Td(a, "delayLeave", function (t) {
                s = t;
              });
          }
        }
        return r;
      }
    },
  },
  zg = kl({ tag: String, moveClass: String }, $g);
delete zg.mode;
var Kg = {
  props: zg,
  beforeMount: function () {
    var t = this,
      e = this._update;
    this._update = function (n, r) {
      var i = ku(t);
      t.__patch__(t._vnode, t.kept, !1, !0), (t._vnode = t.kept), i(), e.call(t, n, r);
    };
  },
  render: function (t) {
    for (
      var e = this.tag || this.$vnode.data.tag || "span",
        n = Object.create(null),
        r = (this.prevChildren = this.children),
        i = this.$slots.default || [],
        a = (this.children = []),
        o = Ug(this),
        s = 0;
      s < i.length;
      s++
    ) {
      var c,
        l = i[s];
      l.tag &&
        (null != l.key && 0 !== String(l.key).indexOf("__vlist")
          ? (a.push(l), (((n[l.key] = l).data || (l.data = {})).transition = o))
          : "production" !== process.env.NODE_ENV &&
            ((l = (c = l.componentOptions) ? c.Ctor.options.name || c.tag || "" : l.tag),
            hh("<transition-group> children must be keyed: <" + l + ">")));
    }
    if (r) {
      for (var h = [], d = [], u = 0; u < r.length; u++) {
        var f = r[u];
        (f.data.transition = o), (f.data.pos = f.elm.getBoundingClientRect()), (n[f.key] ? h : d).push(f);
      }
      (this.kept = t(e, null, h)), (this.removed = d);
    }
    return t(e, null, a);
  },
  updated: function () {
    var t = this.prevChildren,
      e = this.moveClass || (this.name || "v") + "-move";
    t.length &&
      this.hasMove(t[0].elm, e) &&
      (t.forEach(Yg),
      t.forEach(qg),
      t.forEach(Xg),
      (this._reflow = document.body.offsetHeight),
      t.forEach(function (t) {
        var n;
        t.data.moved &&
          ((t = (n = t.elm).style),
          fg(n, e),
          (t.transform = t.WebkitTransform = t.transitionDuration = ""),
          n.addEventListener(
            cg,
            (n._moveCb = function t(r) {
              (r && r.target !== n) ||
                (r && !/transform$/.test(r.propertyName)) ||
                (n.removeEventListener(cg, t), (n._moveCb = null), pg(n, e));
            })
          ));
      }));
  },
  methods: {
    hasMove: function (t, e) {
      if (!ig) return !1;
      if (this._hasMove) return this._hasMove;
      var n = t.cloneNode();
      return (
        t._transitionClasses &&
          t._transitionClasses.forEach(function (t) {
            eg(n, t);
          }),
        tg(n, e),
        (n.style.display = "none"),
        this.$el.appendChild(n),
        (e = mg(n)),
        this.$el.removeChild(n),
        (this._hasMove = e.hasTransform)
      );
    },
  },
};
function Yg(t) {
  t.elm._moveCb && t.elm._moveCb(), t.elm._enterCb && t.elm._enterCb();
}
function qg(t) {
  t.data.newPos = t.elm.getBoundingClientRect();
}
function Xg(t) {
  var e = t.data.pos,
    n = t.data.newPos,
    r = e.left - n.left;
  n = e.top - n.top;
  (r || n) &&
    ((t.data.moved = !0),
    ((t = t.elm.style).transform = t.WebkitTransform = "translate(" + r + "px," + n + "px)"),
    (t.transitionDuration = "0s"));
}
var Jg = { Transition: Wg, TransitionGroup: Kg };
(tf.config.mustUseProp = uf),
  (tf.config.isReservedTag = Of),
  (tf.config.isReservedAttr = hf),
  (tf.config.getTagNamespace = Af),
  (tf.config.isUnknownElement = function (t) {
    if (!Bl) return !0;
    if (Of(t)) return !1;
    if (((t = t.toLowerCase()), null != Pf[t])) return Pf[t];
    var e = document.createElement(t);
    return -1 < t.indexOf("-")
      ? (Pf[t] = e.constructor === window.HTMLUnknownElement || e.constructor === window.HTMLElement)
      : (Pf[t] = /HTMLUnknownElement/.test(e.toString()));
  }),
  kl(tf.options.directives, Gg),
  kl(tf.options.components, Jg),
  (tf.prototype.__patch__ = Bl ? Ng : Nl),
  (tf.prototype.$mount = function (t, e) {
    return (function (t, e, n) {
      return (
        (t.$el = e),
        t.$options.render ||
          ((t.$options.render = Sh),
          "production" !== process.env.NODE_ENV &&
            ((t.$options.template && "#" !== t.$options.template.charAt(0)) || t.$options.el || e
              ? hh(
                  "You are using the runtime-only build of Vue where the template compiler is not available. Either pre-compile the templates into render functions, or use the compiler-included build.",
                  t
                )
              : hh("Failed to mount component: template or render function not defined.", t))),
        Au(t, "beforeMount"),
        (e =
          "production" !== process.env.NODE_ENV && Ll.performance && ld
            ? function () {
                var e = t._name,
                  r = t._uid,
                  i = "vue-perf-start:" + r,
                  a = "vue-perf-end:" + r;
                ld(i),
                  (r = t._render()),
                  ld(a),
                  hd("vue " + e + " render", i, a),
                  ld(i),
                  t._update(r, n),
                  ld(a),
                  hd("vue " + e + " patch", i, a);
              }
            : function () {
                t._update(t._render(), n);
              }),
        new Bu(
          t,
          e,
          Nl,
          {
            before: function () {
              t._isMounted && !t._isDestroyed && Au(t, "beforeUpdate");
            },
          },
          !0
        ),
        (n = !1),
        null == t.$vnode && ((t._isMounted = !0), Au(t, "mounted")),
        t
      );
    })(this, (t = t && Bl ? Df(t) : void 0), e);
  }),
  Bl &&
    setTimeout(function () {
      Ll.devtools &&
        (nh
          ? nh.emit("init", tf)
          : "production" !== process.env.NODE_ENV &&
            "test" !== process.env.NODE_ENV &&
            console[console.info ? "info" : "log"](
              "Download the Vue Devtools extension for a better development experience:\nhttps://github.com/vuejs/vue-devtools"
            )),
        "production" !== process.env.NODE_ENV &&
          "test" !== process.env.NODE_ENV &&
          !1 !== Ll.productionTip &&
          "undefined" != typeof console &&
          console[console.info ? "info" : "log"](
            "You are running Vue in development mode.\nMake sure to turn on production mode when deploying for production.\nSee more tips at https://vuejs.org/guide/deployment.html"
          );
    }, 0);
var Qg = /\{\{((?:.|\r?\n)+?)\}\}/g,
  Zg = /[-.*+?^${}()|[\]\/\\]/g,
  tv = ml(function (t) {
    var e = t[0].replace(Zg, "\\$&");
    t = t[1].replace(Zg, "\\$&");
    return new RegExp(e + "((?:.|\\n)+?)" + t, "g");
  });
function ev(t, e) {
  var n = e ? tv(e) : Qg;
  if (n.test(t)) {
    for (var r, i, a, o = [], s = [], c = (n.lastIndex = 0); (r = n.exec(t)); ) {
      c < (i = r.index) && (s.push((a = t.slice(c, i))), o.push(JSON.stringify(a)));
      var l = sp(r[1].trim());
      o.push("_s(" + l + ")"), s.push({ "@binding": l }), (c = i + r[0].length);
    }
    return (
      c < t.length && (s.push((a = t.slice(c))), o.push(JSON.stringify(a))), { expression: o.join("+"), tokens: s }
    );
  }
}
var nv = {
  staticKeys: ["staticClass"],
  transformNode: function (t, e) {
    var n = e.warn || lp,
      r = _p(t, "class");
    "production" !== process.env.NODE_ENV &&
      r &&
      ev(r, e.delimiters) &&
      n(
        'class="' +
          r +
          '": Interpolation inside attributes has been removed. Use v-bind or the colon shorthand instead. For example, instead of <div class="{{ val }}">, use <div :class="val">.',
        t.rawAttrsMap.class
      ),
      r && (t.staticClass = JSON.stringify(r)),
      (r = yp(t, "class", !1)) && (t.classBinding = r);
  },
  genData: function (t) {
    var e = "";
    return (
      t.staticClass && (e += "staticClass:" + t.staticClass + ","),
      t.classBinding && (e += "class:" + t.classBinding + ","),
      e
    );
  },
};
var rv,
  iv = {
    staticKeys: ["staticStyle"],
    transformNode: function (t, e) {
      var n = e.warn || lp,
        r = _p(t, "style");
      r &&
        ("production" !== process.env.NODE_ENV &&
          ev(r, e.delimiters) &&
          n(
            'style="' +
              r +
              '": Interpolation inside attributes has been removed. Use v-bind or the colon shorthand instead. For example, instead of <div style="{{ val }}">, use <div :style="val">.',
            t.rawAttrsMap.style
          ),
        (t.staticStyle = JSON.stringify(jp(r)))),
        (r = yp(t, "style", !1)) && (t.styleBinding = r);
    },
    genData: function (t) {
      var e = "";
      return (
        t.staticStyle && (e += "staticStyle:" + t.staticStyle + ","),
        t.styleBinding && (e += "style:(" + t.styleBinding + "),"),
        e
      );
    },
  },
  av = function (t) {
    return ((rv = rv || document.createElement("div")).innerHTML = t), rv.textContent;
  },
  ov = dl("area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr"),
  sv = dl("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source"),
  cv = dl(
    "address,article,aside,base,blockquote,body,caption,col,colgroup,dd,details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,title,tr,track"
  ),
  lv = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/,
  hv = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/,
  dv = "[a-zA-Z_][\\-\\.0-9_a-zA-Z" + Il.source + "]*",
  uv = "((?:" + dv + "\\:)?" + dv + ")",
  fv = new RegExp("^<" + uv),
  pv = /^\s*(\/?)>/,
  gv = new RegExp("^<\\/" + uv + "[^>]*>"),
  vv = /^<!DOCTYPE [^>]+>/i,
  mv = /^<!\--/,
  yv = /^<!\[/,
  _v = dl("script,style,textarea", !0),
  bv = {},
  Sv = { "&lt;": "<", "&gt;": ">", "&quot;": '"', "&amp;": "&", "&#10;": "\n", "&#9;": "\t", "&#39;": "'" },
  wv = /&(?:lt|gt|quot|amp|#39);/g,
  xv = /&(?:lt|gt|quot|amp|#39|#10|#9);/g,
  Cv = dl("pre,textarea", !0),
  kv = function (t, e) {
    return t && Cv(t) && "\n" === e[0];
  };
function Ev(t, e) {
  return t.replace(e ? xv : wv, function (t) {
    return Sv[t];
  });
}
var Nv,
  Ov,
  Av,
  Pv,
  Tv,
  Dv,
  Fv,
  Mv,
  Rv,
  Lv = /^@|^v-on:/,
  Iv = /^v-|^@|^:|^#/,
  Gv = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/,
  $v = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/,
  Vv = /^\(|\)$/g,
  Uv = /^\[.*\]$/,
  jv = /:(.*)$/,
  Bv = /^:|^\.|^v-bind:/,
  Hv = /\.[^.\]]+(?=[^\]]*$)/g,
  Wv = /^v-slot(:|$)|^#/,
  zv = /[\r\n]/,
  Kv = /[ \f\t\r\n]+/g,
  Yv = /[\s"'<>\/=]/,
  qv = ml(av),
  Xv = "_empty_";
function Jv(t, e, n) {
  return { type: 1, tag: t, attrsList: e, attrsMap: im(e), rawAttrsMap: {}, parent: n, children: [] };
}
function Qv(t, e) {
  (Nv = e.warn || lp), (Dv = e.isPreTag || Ol), (Fv = e.mustUseProp || Ol), (Mv = e.getTagNamespace || Ol);
  var n = e.isReservedTag || Ol;
  (Rv = function (t) {
    return !(
      !(t.component || t.attrsMap[":is"] || t.attrsMap["v-bind:is"]) && (t.attrsMap.is ? n(t.attrsMap.is) : n(t.tag))
    );
  }),
    (Av = hp(e.modules, "transformNode")),
    (Pv = hp(e.modules, "preTransformNode")),
    (Tv = hp(e.modules, "postTransformNode")),
    (Ov = e.delimiters);
  var r,
    i,
    a = [],
    o = !1 !== e.preserveWhitespace,
    s = e.whitespace,
    c = !1,
    l = !1,
    h = !1;
  function d(t, e) {
    h || ((h = !0), Nv(t, e));
  }
  function u(t) {
    var n;
    f(t),
      c || t.processed || (t = Zv(t, e)),
      a.length ||
        t === r ||
        (r.if && (t.elseif || t.else)
          ? ("production" !== process.env.NODE_ENV && p(t), em(r, { exp: t.elseif, block: t }))
          : "production" !== process.env.NODE_ENV &&
            d(
              "Component template should contain exactly one root element. If you are using v-if on multiple elements, use v-else-if to chain them instead.",
              { start: t.start }
            )),
      i &&
        !t.forbidden &&
        (t.elseif || t.else
          ? (function (t, e) {
              (e = (function (t) {
                for (var e = t.length; e--; ) {
                  if (1 === t[e].type) return t[e];
                  "production" !== process.env.NODE_ENV &&
                    " " !== t[e].text &&
                    Nv('text "' + t[e].text.trim() + '" between v-if and v-else(-if) will be ignored.', t[e]),
                    t.pop();
                }
              })(e.children)),
                e && e.if
                  ? em(e, { exp: t.elseif, block: t })
                  : "production" !== process.env.NODE_ENV &&
                    Nv(
                      "v-" +
                        (t.elseif ? 'else-if="' + t.elseif + '"' : "else") +
                        " used on element <" +
                        t.tag +
                        "> without corresponding v-if.",
                      t.rawAttrsMap[t.elseif ? "v-else-if" : "v-else"]
                    );
            })(t, i)
          : (t.slotScope && ((n = t.slotTarget || '"default"'), ((i.scopedSlots || (i.scopedSlots = {}))[n] = t)),
            i.children.push(t),
            (t.parent = i))),
      (t.children = t.children.filter(function (t) {
        return !t.slotScope;
      })),
      f(t),
      t.pre && (c = !1),
      Dv(t.tag) && (l = !1);
    for (var o = 0; o < Tv.length; o++) Tv[o](t, e);
  }
  function f(t) {
    if (!l) for (var e; (e = t.children[t.children.length - 1]) && 3 === e.type && " " === e.text; ) t.children.pop();
  }
  function p(t) {
    ("slot" !== t.tag && "template" !== t.tag) ||
      d("Cannot use <" + t.tag + "> as component root element because it may contain multiple nodes.", {
        start: t.start,
      }),
      t.attrsMap.hasOwnProperty("v-for") &&
        d(
          "Cannot use v-for on stateful component root element because it renders multiple elements.",
          t.rawAttrsMap["v-for"]
        );
  }
  return (
    (function (t, e) {
      for (var n, r, i = [], a = e.expectHTML, o = e.isUnaryTag || Ol, s = e.canBeLeftOpenTag || Ol, c = 0; t; ) {
        if (((n = t), r && _v(r))) {
          var l = 0,
            h = r.toLowerCase(),
            d = bv[h] || (bv[h] = new RegExp("([\\s\\S]*?)(</" + h + "[^>]*>)", "i"));
          (d = t.replace(d, function (t, n, r) {
            return (
              (l = r.length),
              _v(h) ||
                "noscript" === h ||
                (n = n.replace(/<!\--([\s\S]*?)-->/g, "$1").replace(/<!\[CDATA\[([\s\S]*?)]]>/g, "$1")),
              kv(h, n) && (n = n.slice(1)),
              e.chars && e.chars(n),
              ""
            );
          })),
            (c += t.length - d.length),
            (t = d),
            y(h, c - l, c);
        } else {
          var u = t.indexOf("<");
          if (0 === u) {
            if (mv.test(t) && 0 <= (d = t.indexOf("--\x3e"))) {
              e.shouldKeepComment && e.comment(t.substring(4, d), c, c + d + 3), m(d + 3);
              continue;
            }
            if (yv.test(t)) {
              var f = t.indexOf("]>");
              if (0 <= f) {
                m(f + 2);
                continue;
              }
            }
            if ((f = t.match(vv))) {
              m(f[0].length);
              continue;
            }
            if ((f = t.match(gv))) {
              var p = c;
              m(f[0].length), y(f[1], p, c);
              continue;
            }
            if (
              ((p = (function () {
                var e,
                  n,
                  r = t.match(fv);
                if (r) {
                  var i = { tagName: r[1], attrs: [], start: c };
                  for (m(r[0].length); !(e = t.match(pv)) && (n = t.match(hv) || t.match(lv)); )
                    (n.start = c), m(n[0].length), (n.end = c), i.attrs.push(n);
                  if (e) return (i.unarySlash = e[1]), m(e[0].length), (i.end = c), i;
                }
              })()),
              p)
            ) {
              !(function (t) {
                var n = t.tagName,
                  c = t.unarySlash;
                a && ("p" === r && cv(n) && y(r), s(n) && r === n && y(n)), (c = o(n) || !!c);
                for (var l = t.attrs.length, h = new Array(l), d = 0; d < l; d++) {
                  var u = t.attrs[d],
                    f = u[3] || u[4] || u[5] || "",
                    p = "a" === n && "href" === u[1] ? e.shouldDecodeNewlinesForHref : e.shouldDecodeNewlines;
                  (h[d] = { name: u[1], value: Ev(f, p) }),
                    "production" !== process.env.NODE_ENV &&
                      e.outputSourceRange &&
                      ((h[d].start = u.start + u[0].match(/^\s*/).length), (h[d].end = u.end));
                }
                c ||
                  (i.push({ tag: n, lowerCasedTag: n.toLowerCase(), attrs: h, start: t.start, end: t.end }), (r = n)),
                  e.start && e.start(n, h, c, t.start, t.end);
              })(p),
                kv(p.tagName, t) && m(1);
              continue;
            }
          }
          p = void 0;
          var g,
            v = void 0;
          if (0 <= u) {
            for (
              v = t.slice(u);
              !(gv.test(v) || fv.test(v) || mv.test(v) || yv.test(v) || (g = v.indexOf("<", 1)) < 0);

            )
              (u += g), (v = t.slice(u));
            p = t.substring(0, u);
          }
          (p = u < 0 ? t : p) && m(p.length), e.chars && p && e.chars(p, c - p.length, c);
        }
        if (t === n) {
          e.chars && e.chars(t),
            "production" !== process.env.NODE_ENV &&
              !i.length &&
              e.warn &&
              e.warn('Mal-formatted tag at end of template: "' + t + '"', { start: c + t.length });
          break;
        }
      }
      function m(e) {
        (c += e), (t = t.substring(e));
      }
      function y(t, n, a) {
        var o, s;
        if ((null == n && (n = c), null == a && (a = c), t))
          for (s = t.toLowerCase(), o = i.length - 1; 0 <= o && i[o].lowerCasedTag !== s; o--);
        else o = 0;
        if (0 <= o) {
          for (var l = i.length - 1; o <= l; l--)
            "production" !== process.env.NODE_ENV &&
              (o < l || !t) &&
              e.warn &&
              e.warn("tag <" + i[l].tag + "> has no matching end tag.", { start: i[l].start, end: i[l].end }),
              e.end && e.end(i[l].tag, n, a);
          (i.length = o), (r = o && i[o - 1].tag);
        } else
          "br" === s
            ? e.start && e.start(t, [], !0, n, a)
            : "p" === s && (e.start && e.start(t, [], !1, n, a), e.end && e.end(t, n, a));
      }
      y();
    })(t, {
      warn: Nv,
      expectHTML: e.expectHTML,
      isUnaryTag: e.isUnaryTag,
      canBeLeftOpenTag: e.canBeLeftOpenTag,
      shouldDecodeNewlines: e.shouldDecodeNewlines,
      shouldDecodeNewlinesForHref: e.shouldDecodeNewlinesForHref,
      shouldKeepComment: e.comments,
      outputSourceRange: e.outputSourceRange,
      start: function (t, n, o, s, h) {
        var d = (i && i.ns) || Mv(t),
          f = Jv(
            t,
            (n =
              Kl && "svg" === d
                ? (function (t) {
                    for (var e = [], n = 0; n < t.length; n++) {
                      var r = t[n];
                      am.test(r.name) || ((r.name = r.name.replace(om, "")), e.push(r));
                    }
                    return e;
                  })(n)
                : n),
            i
          );
        d && (f.ns = d),
          "production" !== process.env.NODE_ENV &&
            (e.outputSourceRange &&
              ((f.start = s),
              (f.end = h),
              (f.rawAttrsMap = f.attrsList.reduce(function (t, e) {
                return (t[e.name] = e), t;
              }, {}))),
            n.forEach(function (t) {
              Yv.test(t.name) &&
                Nv(
                  "Invalid dynamic argument expression: attribute names cannot contain spaces, quotes, <, >, / or =.",
                  { start: t.start + t.name.indexOf("["), end: t.start + t.name.length }
                );
            })),
          (function (t) {
            return (
              "style" === t.tag || ("script" === t.tag && (!t.attrsMap.type || "text/javascript" === t.attrsMap.type))
            );
          })(f) &&
            !eh() &&
            ((f.forbidden = !0),
            "production" !== process.env.NODE_ENV &&
              Nv(
                "Templates should only be responsible for mapping the state to the UI. Avoid placing tags with side-effects in your templates, such as <" +
                  t +
                  ">, as they will not be parsed.",
                { start: f.start }
              ));
        for (var g = 0; g < Pv.length; g++) f = Pv[g](f, e) || f;
        c ||
          ((function (t) {
            null != _p(t, "v-pre") && (t.pre = !0);
          })(f),
          f.pre && (c = !0)),
          Dv(f.tag) && (l = !0),
          c
            ? (function (t) {
                var e = t.attrsList,
                  n = e.length;
                if (n)
                  for (var r = (t.attrs = new Array(n)), i = 0; i < n; i++)
                    (r[i] = { name: e[i].name, value: JSON.stringify(e[i].value) }),
                      null != e[i].start && ((r[i].start = e[i].start), (r[i].end = e[i].end));
                else t.pre || (t.plain = !0);
              })(f)
            : f.processed ||
              (tm(f),
              (function (t) {
                var e = _p(t, "v-if");
                e
                  ? ((t.if = e), em(t, { exp: e, block: t }))
                  : (null != _p(t, "v-else") && (t.else = !0), (e = _p(t, "v-else-if")) && (t.elseif = e));
              })(f),
              (function (t) {
                null != _p(t, "v-once") && (t.once = !0);
              })(f)),
          r || ((r = f), "production" !== process.env.NODE_ENV && p(r)),
          o ? u(f) : ((i = f), a.push(f));
      },
      end: function (t, n, r) {
        var o = a[a.length - 1];
        --a.length,
          (i = a[a.length - 1]),
          "production" !== process.env.NODE_ENV && e.outputSourceRange && (o.end = r),
          u(o);
      },
      chars: function (n, r, a) {
        var h, u, f;
        i
          ? (Kl && "textarea" === i.tag && i.attrsMap.placeholder === n) ||
            ((h = i.children),
            (n =
              l || n.trim()
                ? (function (t) {
                    return "script" === t.tag || "style" === t.tag;
                  })(i)
                  ? n
                  : qv(n)
                : h.length
                ? s
                  ? "condense" === s && zv.test(n)
                    ? ""
                    : " "
                  : o
                  ? " "
                  : ""
                : "") &&
              (l || "condense" !== s || (n = n.replace(Kv, " ")),
              !c && " " !== n && (u = ev(n, Ov))
                ? (f = { type: 2, expression: u.expression, tokens: u.tokens, text: n })
                : (" " === n && h.length && " " === h[h.length - 1].text) || (f = { type: 3, text: n }),
              f &&
                ("production" !== process.env.NODE_ENV && e.outputSourceRange && ((f.start = r), (f.end = a)),
                h.push(f))))
          : "production" !== process.env.NODE_ENV &&
            (n === t
              ? d("Component template requires a root element, rather than just text.", { start: r })
              : (n = n.trim()) && d('text "' + n + '" outside root element will be ignored.', { start: r }));
      },
      comment: function (t, n, r) {
        i &&
          ((t = { type: 3, text: t, isComment: !0 }),
          "production" !== process.env.NODE_ENV && e.outputSourceRange && ((t.start = n), (t.end = r)),
          i.children.push(t));
      },
    }),
    r
  );
}
function Zv(t, e) {
  (function (t) {
    var e,
      n,
      r = yp(t, "key");
    r &&
      ("production" !== process.env.NODE_ENV &&
        ("template" === t.tag &&
          Nv("<template> cannot be keyed. Place the key on real elements instead.", mp(t, "key")),
        t.for &&
          ((e = t.iterator2 || t.iterator1),
          (n = t.parent),
          e &&
            e === r &&
            n &&
            "transition-group" === n.tag &&
            Nv(
              "Do not use v-for index as key on <transition-group> children, this is the same as not using keys.",
              mp(t, "key"),
              !0
            ))),
      (t.key = r));
  })(t),
    (t.plain = !t.key && !t.scopedSlots && !t.attrsList.length),
    (function (t) {
      var e = yp(t, "ref");
      e &&
        ((t.ref = e),
        (t.refInFor = (function (t) {
          for (var e = t; e; ) {
            if (void 0 !== e.for) return !0;
            e = e.parent;
          }
          return !1;
        })(t)));
    })(t),
    (function (t) {
      "template" === t.tag
        ? ((o = _p(t, "scope")),
          "production" !== process.env.NODE_ENV &&
            o &&
            Nv(
              'the "scope" attribute for scoped slots have been deprecated and replaced by "slot-scope" since 2.5. The new "slot-scope" attribute can also be used on plain elements in addition to <template> to denote scoped slots.',
              t.rawAttrsMap.scope,
              !0
            ),
          (t.slotScope = o || _p(t, "slot-scope")))
        : (o = _p(t, "slot-scope")) &&
          ("production" !== process.env.NODE_ENV &&
            t.attrsMap["v-for"] &&
            Nv(
              "Ambiguous combined usage of slot-scope and v-for on <" +
                t.tag +
                "> (v-for takes higher priority). Use a wrapper <template> for the scoped slot to make it clearer.",
              t.rawAttrsMap["slot-scope"],
              !0
            ),
          (t.slotScope = o));
      var e,
        n,
        r,
        i,
        a,
        o = yp(t, "slot");
      o &&
        ((t.slotTarget = '""' === o ? '"default"' : o),
        (t.slotTargetDynamic = !(!t.attrsMap[":slot"] && !t.attrsMap["v-bind:slot"])),
        "template" === t.tag || t.slotScope || up(t, "slot", o, mp(t, "slot"))),
        "template" === t.tag
          ? (r = bp(t, Wv)) &&
            ("production" !== process.env.NODE_ENV &&
              ((t.slotTarget || t.slotScope) && Nv("Unexpected mixed usage of different slot syntaxes.", t),
              t.parent &&
                !Rv(t.parent) &&
                Nv("<template v-slot> can only appear at the root level inside the receiving component", t)),
            (n = (e = nm(r)).name),
            (i = e.dynamic),
            (t.slotTarget = n),
            (t.slotTargetDynamic = i),
            (t.slotScope = r.value || Xv))
          : (e = bp(t, Wv)) &&
            ("production" !== process.env.NODE_ENV &&
              (Rv(t) || Nv("v-slot can only be used on components or <template>.", e),
              (t.slotScope || t.slotTarget) && Nv("Unexpected mixed usage of different slot syntaxes.", t),
              t.scopedSlots &&
                Nv(
                  "To avoid scope ambiguity, the default slot should also use <template> syntax when there are other named slots.",
                  e
                )),
            (n = t.scopedSlots || (t.scopedSlots = {})),
            (r = (i = nm(e)).name),
            (i = i.dynamic),
            ((a = n[r] = Jv("template", [], t)).slotTarget = r),
            (a.slotTargetDynamic = i),
            (a.children = t.children.filter(function (t) {
              if (!t.slotScope) return (t.parent = a), !0;
            })),
            (a.slotScope = e.value || Xv),
            (t.children = []),
            (t.plain = !1));
    })(t),
    (function (t) {
      "slot" === t.tag &&
        ((t.slotName = yp(t, "name")),
        "production" !== process.env.NODE_ENV &&
          t.key &&
          Nv(
            "`key` does not work on <slot> because slots are abstract outlets and can possibly expand into multiple elements. Use the key on a wrapping element instead.",
            mp(t, "key")
          ));
    })(t),
    (function (t) {
      var e;
      (e = yp(t, "is")) && (t.component = e), null != _p(t, "inline-template") && (t.inlineTemplate = !0);
    })(t);
  for (var n = 0; n < Av.length; n++) t = Av[n](t, e) || t;
  return (
    (function (t) {
      for (var e, n, r, i, a, o, s = t.attrsList, c = 0, l = s.length; c < l; c++)
        (i = e = s[c].name),
          (n = s[c].value),
          Iv.test(i)
            ? ((t.hasBindings = !0),
              (r = rm(i.replace(Iv, ""))) && (i = i.replace(Hv, "")),
              Bv.test(i)
                ? ((i = i.replace(Bv, "")),
                  (n = sp(n)),
                  (o = Uv.test(i)) && (i = i.slice(1, -1)),
                  "production" !== process.env.NODE_ENV &&
                    0 === n.trim().length &&
                    Nv('The value for a v-bind expression cannot be empty. Found in "v-bind:' + i + '"'),
                  r &&
                    (r.prop && !o && "innerHtml" === (i = _l(i)) && (i = "innerHTML"),
                    r.camel && !o && (i = _l(i)),
                    r.sync &&
                      ((a = xp(n, "$event")),
                      o
                        ? vp(t, '"update:"+(' + i + ")", a, null, !1, Nv, s[c], !0)
                        : (vp(t, "update:" + _l(i), a, null, !1, Nv, s[c]),
                          wl(i) !== _l(i) && vp(t, "update:" + wl(i), a, null, !1, Nv, s[c])))),
                  ((r && r.prop) || (!t.component && Fv(t.tag, t.attrsMap.type, i)) ? dp : up)(t, i, n, s[c], o))
                : Lv.test(i)
                ? ((i = i.replace(Lv, "")), vp(t, (i = (o = Uv.test(i)) ? i.slice(1, -1) : i), n, r, !1, Nv, s[c], o))
                : ((o = !1),
                  (a = (a = (i = i.replace(Iv, "")).match(jv)) && a[1]) &&
                    ((i = i.slice(0, -(a.length + 1))), Uv.test(a) && ((a = a.slice(1, -1)), (o = !0))),
                  pp(t, i, e, n, a, o, r, s[c]),
                  "production" !== process.env.NODE_ENV && "model" === i && sm(t, n)))
            : ("production" !== process.env.NODE_ENV &&
                ev(n, Ov) &&
                Nv(
                  i +
                    '="' +
                    n +
                    '": Interpolation inside attributes has been removed. Use v-bind or the colon shorthand instead. For example, instead of <div id="{{ val }}">, use <div :id="val">.',
                  s[c]
                ),
              up(t, i, JSON.stringify(n), s[c]),
              !t.component && "muted" === i && Fv(t.tag, t.attrsMap.type, i) && dp(t, i, "true", s[c]));
    })(t),
    t
  );
}
function tm(t) {
  var e, n;
  (e = _p(t, "v-for")) &&
    ((n = (function (t) {
      var e = t.match(Gv);
      if (e) {
        var n = {};
        return (
          (n.for = e[2].trim()),
          (t = e[1].trim().replace(Vv, "")),
          (e = t.match($v))
            ? ((n.alias = t.replace($v, "").trim()), (n.iterator1 = e[1].trim()), e[2] && (n.iterator2 = e[2].trim()))
            : (n.alias = t),
          n
        );
      }
    })(e))
      ? kl(t, n)
      : "production" !== process.env.NODE_ENV && Nv("Invalid v-for expression: " + e, t.rawAttrsMap["v-for"]));
}
function em(t, e) {
  t.ifConditions || (t.ifConditions = []), t.ifConditions.push(e);
}
function nm(t) {
  var e = t.name.replace(Wv, "");
  return (
    e ||
      ("#" !== t.name[0]
        ? (e = "default")
        : "production" !== process.env.NODE_ENV && Nv("v-slot shorthand syntax requires a slot name.", t)),
    Uv.test(e) ? { name: e.slice(1, -1), dynamic: !0 } : { name: '"' + e + '"', dynamic: !1 }
  );
}
function rm(t) {
  if ((t = t.match(Hv))) {
    var e = {};
    return (
      t.forEach(function (t) {
        e[t.slice(1)] = !0;
      }),
      e
    );
  }
}
function im(t) {
  for (var e = {}, n = 0, r = t.length; n < r; n++)
    "production" === process.env.NODE_ENV || !e[t[n].name] || Kl || ql || Nv("duplicate attribute: " + t[n].name, t[n]),
      (e[t[n].name] = t[n].value);
  return e;
}
var am = /^xmlns:NS\d+/,
  om = /^NS\d+:/;
function sm(t, e) {
  for (var n = t; n; )
    n.for &&
      n.alias === e &&
      Nv(
        "<" +
          t.tag +
          ' v-model="' +
          e +
          '">: You are binding v-model directly to a v-for iteration alias. This will not be able to modify the v-for source array because writing to the alias is like modifying a function local variable. Consider using an array of objects and use v-model on an object property instead.',
        t.rawAttrsMap["v-model"]
      ),
      (n = n.parent);
}
function cm(t) {
  return Jv(t.tag, t.attrsList.slice(), t.parent);
}
var lm = {
    preTransformNode: function (t, e) {
      if ("input" === t.tag) {
        var n,
          r = t.attrsMap;
        if (
          r["v-model"] &&
          ((r[":type"] || r["v-bind:type"]) && (n = yp(t, "type")),
          (n = r.type || n || !r["v-bind"] ? n : "(" + r["v-bind"] + ").type"))
        ) {
          var i = _p(t, "v-if", !0),
            a = i ? "&&(" + i + ")" : "",
            o = null != _p(t, "v-else", !0),
            s = _p(t, "v-else-if", !0),
            c = cm(t);
          return (
            tm(c),
            fp(c, "type", "checkbox"),
            Zv(c, e),
            (c.processed = !0),
            (c.if = "(" + n + ")==='checkbox'" + a),
            em(c, { exp: c.if, block: c }),
            _p((r = cm(t)), "v-for", !0),
            fp(r, "type", "radio"),
            Zv(r, e),
            em(c, { exp: "(" + n + ")==='radio'" + a, block: r }),
            _p((t = cm(t)), "v-for", !0),
            fp(t, ":type", n),
            Zv(t, e),
            em(c, { exp: i, block: t }),
            o ? (c.else = !0) : s && (c.elseif = s),
            c
          );
        }
      }
    },
  },
  hm = [nv, iv, lm];
var dm,
  um,
  fm = {
    model: function (t, e, n) {
      ip = n;
      var r = e.value,
        i = e.modifiers;
      if (
        ((n = t.tag),
        (e = t.attrsMap.type),
        "production" !== process.env.NODE_ENV &&
          "input" === n &&
          "file" === e &&
          ip(
            "<" +
              t.tag +
              ' v-model="' +
              r +
              '" type="file">:\nFile inputs are read only. Use a v-on:change listener instead.',
            t.rawAttrsMap["v-model"]
          ),
        t.component)
      )
        return wp(t, r, i), !1;
      if ("select" === n)
        !(function (t, e, n) {
          vp(
            t,
            "change",
            'var $$selectedVal = Array.prototype.filter.call($event.target.options,function(o){return o.selected}).map(function(o){var val = "_value" in o ? o._value : o.value;return ' +
              (n && n.number ? "_n(val)" : "val") +
              "}); " +
              xp(e, "$event.target.multiple ? $$selectedVal : $$selectedVal[0]"),
            null,
            !0
          );
        })(t, r, i);
      else if ("input" === n && "checkbox" === e)
        !(function (t, e, n) {
          var r = n && n.number,
            i = yp(t, "value") || "null",
            a = yp(t, "true-value") || "true";
          n = yp(t, "false-value") || "false";
          dp(
            t,
            "checked",
            "Array.isArray(" +
              e +
              ")?_i(" +
              e +
              "," +
              i +
              ")>-1" +
              ("true" === a ? ":(" + e + ")" : ":_q(" + e + "," + a + ")")
          ),
            vp(
              t,
              "change",
              "var $$a=" +
                e +
                ",$$el=$event.target,$$c=$$el.checked?(" +
                a +
                "):(" +
                n +
                ");if(Array.isArray($$a)){var $$v=" +
                (r ? "_n(" + i + ")" : i) +
                ",$$i=_i($$a,$$v);if($$el.checked){$$i<0&&(" +
                xp(e, "$$a.concat([$$v])") +
                ")}else{$$i>-1&&(" +
                xp(e, "$$a.slice(0,$$i).concat($$a.slice($$i+1))") +
                ")}}else{" +
                xp(e, "$$c") +
                "}",
              null,
              !0
            );
        })(t, r, i);
      else if ("input" === n && "radio" === e)
        !(function (t, e, n) {
          var r = n && n.number;
          n = yp(t, "value") || "null";
          dp(t, "checked", "_q(" + e + "," + (n = r ? "_n(" + n + ")" : n) + ")"), vp(t, "change", xp(e, n), null, !0);
        })(t, r, i);
      else {
        if ("input" !== n && "textarea" !== n) return wp(t, r, i), !1;
        !(function (t, e, n) {
          var r = t.attrsMap.type;
          "production" !== process.env.NODE_ENV &&
            ((a = t.attrsMap["v-bind:value"] || t.attrsMap[":value"]),
            (i = t.attrsMap["v-bind:type"] || t.attrsMap[":type"]),
            a &&
              !i &&
              ((o = t.attrsMap["v-bind:value"] ? "v-bind:value" : ":value"),
              ip(
                o +
                  '="' +
                  a +
                  '" conflicts with v-model on the same element because the latter already expands to a value binding internally',
                t.rawAttrsMap[o]
              )));
          var i = n || {},
            a = i.lazy,
            o = i.number;
          (n = i.trim),
            (i = !a && "range" !== r),
            (a = a ? "change" : "range" === r ? Pp : "input"),
            (r = n ? "$event.target.value.trim()" : "$event.target.value"),
            (r = xp(e, (r = o ? "_n(" + r + ")" : r)));
          i && (r = "if($event.target.composing)return;" + r),
            dp(t, "value", "(" + e + ")"),
            vp(t, a, r, null, !0),
            (n || o) && vp(t, "blur", "$forceUpdate()");
        })(t, r, i);
      }
      return !0;
    },
    text: function (t, e) {
      e.value && dp(t, "textContent", "_s(" + e.value + ")", e);
    },
    html: function (t, e) {
      e.value && dp(t, "innerHTML", "_s(" + e.value + ")", e);
    },
  },
  pm = {
    expectHTML: !0,
    modules: hm,
    directives: fm,
    isPreTag: function (t) {
      return "pre" === t;
    },
    isUnaryTag: ov,
    mustUseProp: uf,
    canBeLeftOpenTag: sv,
    isReservedTag: Of,
    getTagNamespace: Af,
    staticKeys: (function (t) {
      return t
        .reduce(function (t, e) {
          return t.concat(e.staticKeys || []);
        }, [])
        .join(",");
    })(hm),
  },
  gm = ml(function (t) {
    return dl("type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap" + (t ? "," + t : ""));
  });
function vm(t, e) {
  t && ((dm = gm(e.staticKeys || "")), (um = e.isReservedTag || Ol), mm(t), ym(t, !1));
}
function mm(t) {
  if (
    ((t.static = (function (t) {
      return (
        2 !== t.type &&
        (3 === t.type ||
          !(
            !t.pre &&
            (t.hasBindings ||
              t.if ||
              t.for ||
              ul(t.tag) ||
              !um(t.tag) ||
              (function (t) {
                for (; t.parent; ) {
                  if ("template" !== (t = t.parent).tag) return !1;
                  if (t.for) return !0;
                }
                return !1;
              })(t) ||
              !Object.keys(t).every(dm))
          ))
      );
    })(t)),
    1 === t.type && (um(t.tag) || "slot" === t.tag || null != t.attrsMap["inline-template"]))
  ) {
    for (var e = 0, n = t.children.length; e < n; e++) {
      var r = t.children[e];
      mm(r), r.static || (t.static = !1);
    }
    if (t.ifConditions)
      for (var i = 1, a = t.ifConditions.length; i < a; i++) {
        var o = t.ifConditions[i].block;
        mm(o), o.static || (t.static = !1);
      }
  }
}
function ym(t, e) {
  if (1 === t.type)
    if (
      ((t.static || t.once) && (t.staticInFor = e),
      !t.static || !t.children.length || (1 === t.children.length && 3 === t.children[0].type))
    ) {
      if (((t.staticRoot = !1), t.children))
        for (var n = 0, r = t.children.length; n < r; n++) ym(t.children[n], e || !!t.for);
      if (t.ifConditions) for (var i = 1, a = t.ifConditions.length; i < a; i++) ym(t.ifConditions[i].block, e);
    } else t.staticRoot = !0;
}
var _m = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/,
  bm = /\([^)]*?\);*$/,
  Sm = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/,
  wm = { esc: 27, tab: 9, enter: 13, space: 32, up: 38, left: 37, right: 39, down: 40, delete: [8, 46] },
  xm = {
    esc: ["Esc", "Escape"],
    tab: "Tab",
    enter: "Enter",
    space: [" ", "Spacebar"],
    up: ["Up", "ArrowUp"],
    left: ["Left", "ArrowLeft"],
    right: ["Right", "ArrowRight"],
    down: ["Down", "ArrowDown"],
    delete: ["Backspace", "Delete", "Del"],
  },
  Cm = function (t) {
    return "if(" + t + ")return null;";
  },
  km = {
    stop: "$event.stopPropagation();",
    prevent: "$event.preventDefault();",
    self: Cm("$event.target !== $event.currentTarget"),
    ctrl: Cm("!$event.ctrlKey"),
    shift: Cm("!$event.shiftKey"),
    alt: Cm("!$event.altKey"),
    meta: Cm("!$event.metaKey"),
    left: Cm("'button' in $event && $event.button !== 0"),
    middle: Cm("'button' in $event && $event.button !== 1"),
    right: Cm("'button' in $event && $event.button !== 2"),
  };
function Em(t, e) {
  e = e ? "nativeOn:" : "on:";
  var n,
    r = "",
    i = "";
  for (n in t) {
    var a = Nm(t[n]);
    t[n] && t[n].dynamic ? (i += n + "," + a + ",") : (r += '"' + n + '":' + a + ",");
  }
  return (r = "{" + r.slice(0, -1) + "}"), i ? e + "_d(" + r + ",[" + i.slice(0, -1) + "])" : e + r;
}
function Nm(t) {
  if (!t) return "function(){}";
  if (Array.isArray(t))
    return (
      "[" +
      t
        .map(function (t) {
          return Nm(t);
        })
        .join(",") +
      "]"
    );
  var e = Sm.test(t.value),
    n = _m.test(t.value),
    r = Sm.test(t.value.replace(bm, ""));
  if (t.modifiers) {
    var i,
      a,
      o = "",
      s = "",
      c = [];
    for (i in t.modifiers)
      km[i]
        ? ((s += km[i]), wm[i] && c.push(i))
        : "exact" === i
        ? ((a = t.modifiers),
          (s += Cm(
            ["ctrl", "shift", "alt", "meta"]
              .filter(function (t) {
                return !a[t];
              })
              .map(function (t) {
                return "$event." + t + "Key";
              })
              .join("||")
          )))
        : c.push(i);
    return (
      c.length &&
        (o += (function (t) {
          return "if(!$event.type.indexOf('key')&&" + t.map(Om).join("&&") + ")return null;";
        })(c)),
      s && (o += s),
      "function($event){" +
        o +
        (e
          ? "return " + t.value + ".apply(null, arguments)"
          : n
          ? "return (" + t.value + ").apply(null, arguments)"
          : r
          ? "return " + t.value
          : t.value) +
        "}"
    );
  }
  return e || n ? t.value : "function($event){" + (r ? "return " + t.value : t.value) + "}";
}
function Om(t) {
  if ((n = parseInt(t, 10))) return "$event.keyCode!==" + n;
  var e = wm[t],
    n = xm[t];
  return "_k($event.keyCode," + JSON.stringify(t) + "," + JSON.stringify(e) + ",$event.key," + JSON.stringify(n) + ")";
}
var Am = {
    on: function (t, e) {
      "production" !== process.env.NODE_ENV && e.modifiers && hh("v-on without argument does not support modifiers."),
        (t.wrapListeners = function (t) {
          return "_g(" + t + "," + e.value + ")";
        });
    },
    bind: function (t, e) {
      t.wrapData = function (n) {
        return (
          "_b(" +
          n +
          ",'" +
          t.tag +
          "'," +
          e.value +
          "," +
          (e.modifiers && e.modifiers.prop ? "true" : "false") +
          (e.modifiers && e.modifiers.sync ? ",true" : "") +
          ")"
        );
      };
    },
    cloak: Nl,
  },
  Pm = function (t) {
    (this.options = t),
      (this.warn = t.warn || lp),
      (this.transforms = hp(t.modules, "transformCode")),
      (this.dataGenFns = hp(t.modules, "genData")),
      (this.directives = kl(kl({}, Am), t.directives));
    var e = t.isReservedTag || Ol;
    (this.maybeComponent = function (t) {
      return !!t.component || !e(t.tag);
    }),
      (this.onceId = 0),
      (this.staticRenderFns = []),
      (this.pre = !1);
  };
function Tm(t, e) {
  return (
    (e = new Pm(e)),
    {
      render: "with(this){return " + (t ? ("script" === t.tag ? "null" : Dm(t, e)) : '_c("div")') + "}",
      staticRenderFns: e.staticRenderFns,
    }
  );
}
function Dm(t, e) {
  if ((t.parent && (t.pre = t.pre || t.parent.pre), t.staticRoot && !t.staticProcessed)) return Fm(t, e);
  if (t.once && !t.onceProcessed) return Mm(t, e);
  if (t.for && !t.forProcessed) return Im(t, e);
  if (t.if && !t.ifProcessed) return Rm(t, e);
  if ("template" !== t.tag || t.slotTarget || e.pre) {
    if ("slot" === t.tag)
      return (function (t, e) {
        var n = t.slotName || '"default"',
          r = Um(t, e);
        (e = "_t(" + n + (r ? ",function(){return " + r + "}" : "")),
          (n =
            t.attrs || t.dynamicAttrs
              ? zm(
                  (t.attrs || []).concat(t.dynamicAttrs || []).map(function (t) {
                    return { name: _l(t.name), value: t.value, dynamic: t.dynamic };
                  })
                )
              : null),
          (t = t.attrsMap["v-bind"]);
        return (
          (!n && !t) || r || (e += ",null"), n && (e += "," + n), t && (e += (n ? "" : ",null") + "," + t), e + ")"
        );
      })(t, e);
    var n, r, i;
    i = t.component
      ? (function (t, e, n) {
          var r = e.inlineTemplate ? null : Um(e, n, !0);
          return "_c(" + t + "," + Gm(e, n) + (r ? "," + r : "") + ")";
        })(t.component, t, e)
      : ((!t.plain || (t.pre && e.maybeComponent(t))) && (n = Gm(t, e)),
        (r = t.inlineTemplate ? null : Um(t, e, !0)),
        "_c('" + t.tag + "'" + (n ? "," + n : "") + (r ? "," + r : "") + ")");
    for (var a = 0; a < e.transforms.length; a++) i = e.transforms[a](t, i);
    return i;
  }
  return Um(t, e) || "void 0";
}
function Fm(t, e) {
  t.staticProcessed = !0;
  var n = e.pre;
  return (
    t.pre && (e.pre = t.pre),
    e.staticRenderFns.push("with(this){return " + Dm(t, e) + "}"),
    (e.pre = n),
    "_m(" + (e.staticRenderFns.length - 1) + (t.staticInFor ? ",true" : "") + ")"
  );
}
function Mm(t, e) {
  if (((t.onceProcessed = !0), t.if && !t.ifProcessed)) return Rm(t, e);
  if (t.staticInFor) {
    for (var n = "", r = t.parent; r; ) {
      if (r.for) {
        n = r.key;
        break;
      }
      r = r.parent;
    }
    return n
      ? "_o(" + Dm(t, e) + "," + e.onceId++ + "," + n + ")"
      : ("production" !== process.env.NODE_ENV &&
          e.warn("v-once can only be used inside v-for that is keyed. ", t.rawAttrsMap["v-once"]),
        Dm(t, e));
  }
  return Fm(t, e);
}
function Rm(t, e, n, r) {
  return (t.ifProcessed = !0), Lm(t.ifConditions.slice(), e, n, r);
}
function Lm(t, e, n, r) {
  if (!t.length) return r || "_e()";
  var i = t.shift();
  return i.exp ? "(" + i.exp + ")?" + a(i.block) + ":" + Lm(t, e, n, r) : "" + a(i.block);
  function a(t) {
    return (n || (t.once ? Mm : Dm))(t, e);
  }
}
function Im(t, e, n, r) {
  var i = t.for,
    a = t.alias,
    o = t.iterator1 ? "," + t.iterator1 : "",
    s = t.iterator2 ? "," + t.iterator2 : "";
  return (
    "production" !== process.env.NODE_ENV &&
      e.maybeComponent(t) &&
      "slot" !== t.tag &&
      "template" !== t.tag &&
      !t.key &&
      e.warn(
        "<" +
          t.tag +
          ' v-for="' +
          a +
          " in " +
          i +
          '">: component lists rendered with v-for should have explicit keys. See https://vuejs.org/guide/list.html#key for more info.',
        t.rawAttrsMap["v-for"],
        !0
      ),
    (t.forProcessed = !0),
    (r || "_l") + "((" + i + "),function(" + a + o + s + "){return " + (n || Dm)(t, e) + "})"
  );
}
function Gm(t, e) {
  var n = "{",
    r = (function (t, e) {
      var n = t.directives;
      if (n) {
        for (var r = "directives:[", i = !1, a = 0, o = n.length; a < o; a++) {
          var s = n[a],
            c = !0,
            l = e.directives[s.name];
          (c = l ? !!l(t, s, e.warn) : c) &&
            ((i = !0),
            (r +=
              '{name:"' +
              s.name +
              '",rawName:"' +
              s.rawName +
              '"' +
              (s.value ? ",value:(" + s.value + "),expression:" + JSON.stringify(s.value) : "") +
              (s.arg ? ",arg:" + (s.isDynamicArg ? s.arg : '"' + s.arg + '"') : "") +
              (s.modifiers ? ",modifiers:" + JSON.stringify(s.modifiers) : "") +
              "},"));
        }
        return i ? r.slice(0, -1) + "]" : void 0;
      }
    })(t, e);
  r && (n += r + ","),
    t.key && (n += "key:" + t.key + ","),
    t.ref && (n += "ref:" + t.ref + ","),
    t.refInFor && (n += "refInFor:true,"),
    t.pre && (n += "pre:true,"),
    t.component && (n += 'tag:"' + t.tag + '",');
  for (var i = 0; i < e.dataGenFns.length; i++) n += e.dataGenFns[i](t);
  return (
    t.attrs && (n += "attrs:" + zm(t.attrs) + ","),
    t.props && (n += "domProps:" + zm(t.props) + ","),
    t.events && (n += Em(t.events, !1) + ","),
    t.nativeEvents && (n += Em(t.nativeEvents, !0) + ","),
    t.slotTarget && !t.slotScope && (n += "slot:" + t.slotTarget + ","),
    t.scopedSlots &&
      (n +=
        (function (t, e, n) {
          var r =
              t.for ||
              Object.keys(e).some(function (t) {
                return (t = e[t]).slotTargetDynamic || t.if || t.for || $m(t);
              }),
            i = !!t.if;
          if (!r)
            for (var a = t.parent; a; ) {
              if ((a.slotScope && a.slotScope !== Xv) || a.for) {
                r = !0;
                break;
              }
              a.if && (i = !0), (a = a.parent);
            }
          return (
            (t = Object.keys(e)
              .map(function (t) {
                return Vm(e[t], n);
              })
              .join(",")),
            "scopedSlots:_u([" +
              t +
              "]" +
              (r ? ",null,true" : "") +
              (!r && i
                ? ",null,false," +
                  (function (t) {
                    for (var e = 5381, n = t.length; n; ) e = (33 * e) ^ t.charCodeAt(--n);
                    return e >>> 0;
                  })(t)
                : "") +
              ")"
          );
        })(t, t.scopedSlots, e) + ","),
    t.model &&
      (n +=
        "model:{value:" + t.model.value + ",callback:" + t.model.callback + ",expression:" + t.model.expression + "},"),
    !t.inlineTemplate ||
      ((r = (function (t, e) {
        var n = t.children[0];
        if (
          ("production" === process.env.NODE_ENV ||
            (1 === t.children.length && 1 === n.type) ||
            e.warn("Inline-template components must have exactly one child element.", { start: t.start }),
          n && 1 === n.type)
        )
          return (
            "inlineTemplate:{render:function(){" +
            (e = Tm(n, e.options)).render +
            "},staticRenderFns:[" +
            e.staticRenderFns
              .map(function (t) {
                return "function(){" + t + "}";
              })
              .join(",") +
            "]}"
          );
      })(t, e)) &&
        (n += r + ",")),
    (n = n.replace(/,$/, "") + "}"),
    t.dynamicAttrs && (n = "_b(" + n + ',"' + t.tag + '",' + zm(t.dynamicAttrs) + ")"),
    t.wrapData && (n = t.wrapData(n)),
    t.wrapListeners ? t.wrapListeners(n) : n
  );
}
function $m(t) {
  return 1 === t.type && ("slot" === t.tag || t.children.some($m));
}
function Vm(t, e) {
  var n = t.attrsMap["slot-scope"];
  if (t.if && !t.ifProcessed && !n) return Rm(t, e, Vm, "null");
  if (t.for && !t.forProcessed) return Im(t, e, Vm);
  var r = t.slotScope === Xv ? "" : String(t.slotScope);
  e =
    "function(" +
    r +
    "){return " +
    ("template" === t.tag
      ? t.if && n
        ? "(" + t.if + ")?" + (Um(t, e) || "undefined") + ":undefined"
        : Um(t, e) || "undefined"
      : Dm(t, e)) +
    "}";
  return "{key:" + (t.slotTarget || '"default"') + ",fn:" + e + (r ? "" : ",proxy:true") + "}";
}
function Um(t, e, n, r, i) {
  var a = t.children;
  if (a.length) {
    var o = a[0];
    if (1 === a.length && o.for && "template" !== o.tag && "slot" !== o.tag)
      return (t = n ? (e.maybeComponent(o) ? ",1" : ",0") : ""), (r || Dm)(o, e) + t;
    n = n
      ? (function (t, e) {
          for (var n = 0, r = 0; r < t.length; r++) {
            var i = t[r];
            if (1 === i.type) {
              if (
                jm(i) ||
                (i.ifConditions &&
                  i.ifConditions.some(function (t) {
                    return jm(t.block);
                  }))
              ) {
                n = 2;
                break;
              }
              (e(i) ||
                (i.ifConditions &&
                  i.ifConditions.some(function (t) {
                    return e(t.block);
                  }))) &&
                (n = 1);
            }
          }
          return n;
        })(a, e.maybeComponent)
      : 0;
    var s = i || Bm;
    return (
      "[" +
      a
        .map(function (t) {
          return s(t, e);
        })
        .join(",") +
      "]" +
      (n ? "," + n : "")
    );
  }
}
function jm(t) {
  return void 0 !== t.for || "template" === t.tag || "slot" === t.tag;
}
function Bm(t, e) {
  return 1 === t.type ? Dm(t, e) : (3 === t.type && t.isComment ? Wm : Hm)(t);
}
function Hm(t) {
  return "_v(" + (2 === t.type ? t.expression : Km(JSON.stringify(t.text))) + ")";
}
function Wm(t) {
  return "_e(" + JSON.stringify(t.text) + ")";
}
function zm(t) {
  for (var e = "", n = "", r = 0; r < t.length; r++) {
    var i = t[r],
      a = Km(i.value);
    i.dynamic ? (n += i.name + "," + a + ",") : (e += '"' + i.name + '":' + a + ",");
  }
  return (e = "{" + e.slice(0, -1) + "}"), n ? "_d(" + e + ",[" + n.slice(0, -1) + "])" : e;
}
function Km(t) {
  return t.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
var Ym = new RegExp(
    "\\b" +
      "do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,super,throw,while,yield,delete,export,import,return,switch,default,extends,finally,continue,debugger,function,arguments"
        .split(",")
        .join("\\b|\\b") +
      "\\b"
  ),
  qm = new RegExp("\\b" + "delete,typeof,void".split(",").join("\\s*\\([^\\)]*\\)|\\b") + "\\s*\\([^\\)]*\\)"),
  Xm = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;
function Jm(t, e) {
  t && Qm(t, e);
}
function Qm(t, e) {
  if (1 === t.type) {
    for (var n in t.attrsMap) {
      var r, i;
      !Iv.test(n) ||
        ((r = t.attrsMap[n]) &&
          ((i = t.rawAttrsMap[n]),
          "v-for" === n
            ? ty(t, 'v-for="' + r + '"', e, i)
            : ("v-slot" === n || "#" === n[0] ? ry : Lv.test(n) ? Zm : ny)(r, n + '="' + r + '"', e, i)));
    }
    if (t.children) for (var a = 0; a < t.children.length; a++) Qm(t.children[a], e);
  } else 2 === t.type && ny(t.expression, t.text, e, t);
}
function Zm(t, e, n, r) {
  var i = t.replace(Xm, ""),
    a = i.match(qm);
  a &&
    "$" !== i.charAt(a.index - 1) &&
    n('avoid using JavaScript unary operator as property name: "' + a[0] + '" in expression ' + e.trim(), r),
    ny(t, e, n, r);
}
function ty(t, e, n, r) {
  ny(t.for || "", e, n, r),
    ey(t.alias, "v-for alias", e, n, r),
    ey(t.iterator1, "v-for iterator", e, n, r),
    ey(t.iterator2, "v-for iterator", e, n, r);
}
function ey(t, e, n, r, i) {
  if ("string" == typeof t)
    try {
      new Function("var " + t + "=_");
    } catch (a) {
      r("invalid " + e + ' "' + t + '" in expression: ' + n.trim(), i);
    }
}
function ny(t, e, n, r) {
  try {
    new Function("return " + t);
  } catch (a) {
    var i = t.replace(Xm, "").match(Ym);
    n(
      i
        ? 'avoid using JavaScript keyword as property name: "' + i[0] + '"\n  Raw expression: ' + e.trim()
        : "invalid expression: " + a.message + " in\n\n    " + t + "\n\n  Raw expression: " + e.trim() + "\n",
      r
    );
  }
}
function ry(t, e, n, r) {
  try {
    new Function(t, "");
  } catch (i) {
    n(
      "invalid function parameter expression: " +
        i.message +
        " in\n\n    " +
        t +
        "\n\n  Raw expression: " +
        e.trim() +
        "\n",
      r
    );
  }
}
var iy = 2;
function ay(t, e) {
  var n = "";
  if (0 < e) for (; 1 & e && (n += t), !((e >>>= 1) <= 0); ) t += t;
  return n;
}
function oy(t, e) {
  try {
    return new Function(t);
  } catch (n) {
    return e.push({ err: n, code: t }), Nl;
  }
}
function sy(t) {
  var e = Object.create(null);
  return function (n, r, i) {
    var a = (r = kl({}, r)).warn || hh;
    if ((delete r.warn, "production" !== process.env.NODE_ENV))
      try {
        new Function("return 1");
      } catch (r) {
        r.toString().match(/unsafe-eval|CSP/) &&
          a(
            "It seems you are using the standalone build of Vue.js in an environment with Content Security Policy that prohibits unsafe-eval. The template compiler cannot work in this environment. Consider relaxing the policy to allow unsafe-eval or pre-compiling your templates into render functions."
          );
      }
    var o = r.delimiters ? String(r.delimiters) + n : n;
    if (e[o]) return e[o];
    var s = t(n, r);
    "production" !== process.env.NODE_ENV &&
      (s.errors &&
        s.errors.length &&
        (r.outputSourceRange
          ? s.errors.forEach(function (t) {
              a(
                "Error compiling template:\n\n" +
                  t.msg +
                  "\n\n" +
                  (function (t, e, n) {
                    void 0 === e && (e = 0), void 0 === n && (n = t.length);
                    for (var r = t.split(/\r?\n/), i = 0, a = [], o = 0; o < r.length; o++)
                      if (e <= (i += r[o].length + 1)) {
                        for (var s, c, l, h = o - iy; h <= o + iy || i < n; h++)
                          h < 0 ||
                            h >= r.length ||
                            (a.push("" + (h + 1) + ay(" ", 3 - String(h + 1).length) + "|  " + r[h]),
                            (s = r[h].length),
                            h === o
                              ? ((c = e - (i - s) + 1),
                                (l = i < n ? s - c : n - e),
                                a.push("   |  " + ay(" ", c) + ay("^", l)))
                              : o < h &&
                                (i < n && ((l = Math.min(n - i, s)), a.push("   |  " + ay("^", l))), (i += s + 1)));
                        break;
                      }
                    return a.join("\n");
                  })(n, t.start, t.end),
                i
              );
            })
          : a(
              "Error compiling template:\n\n" +
                n +
                "\n\n" +
                s.errors
                  .map(function (t) {
                    return "- " + t;
                  })
                  .join("\n") +
                "\n",
              i
            )),
      s.tips &&
        s.tips.length &&
        (r.outputSourceRange
          ? s.tips.forEach(function (t) {
              return dh(t.msg, i);
            })
          : s.tips.forEach(function (t) {
              return dh(t, i);
            })));
    var c = [];
    return (
      ((r = {}).render = oy(s.render, c)),
      (r.staticRenderFns = s.staticRenderFns.map(function (t) {
        return oy(t, c);
      })),
      "production" !== process.env.NODE_ENV &&
        ((s.errors && s.errors.length) ||
          !c.length ||
          a(
            "Failed to generate render function:\n\n" +
              c
                .map(function (t) {
                  var e = t.err;
                  t = t.code;
                  return e.toString() + " in\n\n" + t + "\n";
                })
                .join("\n"),
            i
          )),
      (e[o] = r)
    );
  };
}
var cy,
  ly,
  hy =
    ((ly = function (t, e) {
      return (
        (t = Qv(t.trim(), e)),
        !1 !== e.optimize && vm(t, e),
        { ast: t, render: (e = Tm(t, e)).render, staticRenderFns: e.staticRenderFns }
      );
    }),
    function (t) {
      function e(e, n) {
        var r,
          i,
          a = Object.create(t),
          o = [],
          s = [],
          c = function (t, e, n) {
            (n ? s : o).push(t);
          };
        if (n)
          for (i in ("production" !== process.env.NODE_ENV &&
            n.outputSourceRange &&
            ((r = e.match(/^\s*/)[0].length),
            (c = function (t, e, n) {
              (t = { msg: t }),
                e && (null != e.start && (t.start = e.start + r), null != e.end && (t.end = e.end + r)),
                (n ? s : o).push(t);
            })),
          n.modules && (a.modules = (t.modules || []).concat(n.modules)),
          n.directives && (a.directives = kl(Object.create(t.directives || null), n.directives)),
          n))
            "modules" !== i && "directives" !== i && (a[i] = n[i]);
        return (
          (a.warn = c),
          (e = ly(e.trim(), a)),
          "production" !== process.env.NODE_ENV && Jm(e.ast, c),
          (e.errors = o),
          (e.tips = s),
          e
        );
      }
      return { compile: e, compileToFunctions: sy(e) };
    }),
  dy = hy(pm).compileToFunctions;
function uy(t) {
  return (
    ((cy = cy || document.createElement("div")).innerHTML = t ? '<a href="\n"/>' : '<div a="\n"/>'),
    0 < cy.innerHTML.indexOf("&#10;")
  );
}
var fy = !!Bl && uy(!1),
  py = !!Bl && uy(!0),
  gy = ml(function (t) {
    return (t = Df(t)) && t.innerHTML;
  }),
  vy = tf.prototype.$mount;
(tf.prototype.$mount = function (t, e) {
  if ((t = t && Df(t)) === document.body || t === document.documentElement)
    return (
      "production" !== process.env.NODE_ENV &&
        hh("Do not mount Vue to <html> or <body> - mount to normal elements instead."),
      this
    );
  var n = this.$options;
  if (!n.render) {
    var r,
      i = n.template;
    if (i)
      if ("string" == typeof i)
        "#" === i.charAt(0) &&
          ((i = gy(i)),
          "production" === process.env.NODE_ENV ||
            i ||
            hh("Template element not found or is empty: " + n.template, this));
      else {
        if (!i.nodeType) return "production" !== process.env.NODE_ENV && hh("invalid template option:" + i, this), this;
        i = i.innerHTML;
      }
    else
      t &&
        (i = (function (t) {
          if (t.outerHTML) return t.outerHTML;
          var e = document.createElement("div");
          return e.appendChild(t.cloneNode(!0)), e.innerHTML;
        })(t));
    i &&
      ("production" !== process.env.NODE_ENV && Ll.performance && ld && ld("compile"),
      (i = (r = dy(
        i,
        {
          outputSourceRange: "production" !== process.env.NODE_ENV,
          shouldDecodeNewlines: fy,
          shouldDecodeNewlinesForHref: py,
          delimiters: n.delimiters,
          comments: n.comments,
        },
        this
      )).render),
      (r = r.staticRenderFns),
      (n.render = i),
      (n.staticRenderFns = r),
      "production" !== process.env.NODE_ENV &&
        Ll.performance &&
        ld &&
        (ld("compile end"), hd("vue " + this._name + " compile", "compile", "compile end")));
  }
  return vy.call(this, t, e);
}),
  (tf.compile = dy),
  (exports.Konva = Va),
  (exports.Vue = tf),
  (exports.fs = Xc);
