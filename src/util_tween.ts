export default {
    // Linear：线性匀速运动效果；
    Linear: function (t: number, b: number, c: number, d: number) {
        return c * t / d + b;
    },
    // Quadratic：二次方的缓动（t^2）；


    Quad: { // currentTime, startValue, changeValue, duration
        easeIn: function (t: number, b: number, c: number, d: number) {
            return c * (t /= d) * t + b;
        },
        easeOut: function (t: number, b: number, c: number, d: number) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOut: function (t: number, b: number, c: number, d: number) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        }
    },
    // Cubic：三次方的缓动（t^3）；
    Cubic: {
        easeIn: function (t: number, b: number, c: number, d: number) {
            return c * (t /= d) * t * t + b;
        },
        easeOut: function (t: number, b: number, c: number, d: number) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOut: function (t: number, b: number, c: number, d: number) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        }
    },
    // Quartic：四次方的缓动（t^4）；
    Quart: {
        easeIn: function (t: number, b: number, c: number, d: number) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOut: function (t: number, b: number, c: number, d: number) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOut: function (t: number, b: number, c: number, d: number) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        }
    },
    // Quintic：五次方的缓动（t^5）；
    Quint: {
        easeIn: function (t: number, b: number, c: number, d: number) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOut: function (t: number, b: number, c: number, d: number) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOut: function (t: number, b: number, c: number, d: number) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        }
    },
    // Sinusoidal：正弦曲线的缓动（sin(t)）；
    Sine: {
        easeIn: function (t: number, b: number, c: number, d: number) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOut: function (t: number, b: number, c: number, d: number) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOut: function (t: number, b: number, c: number, d: number) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        }
    },
    // Exponential：指数曲线的缓动（2^t）；
    Expo: {
        easeIn: function (t: number, b: number, c: number, d: number) {
            return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOut: function (t: number, b: number, c: number, d: number) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOut: function (t: number, b: number, c: number, d: number) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
    },
    // Circular：圆形曲线的缓动（sqrt(1-t^2)）；
    Circ: {
        easeIn: function (t: number, b: number, c: number, d: number) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOut: function (t: number, b: number, c: number, d: number) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOut: function (t: number, b: number, c: number, d: number) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        }
    },
    // Elastic：指数衰减的正弦曲线缓动；
    Elastic: {
        easeIn: function (t: number, b: number, c: number, d: number, a: number, p: number) {
            let s;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (typeof p == "undefined") p = d * .3;
            if (!a || a < Math.abs(c)) {
                s = p / 4;
                a = c;
            } else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        easeOut: function (t: number, b: number, c: number, d: number, a: number, p: number) {
            let s;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (typeof p == "undefined") p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            } else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
        },
        easeInOut: function (t: number, b: number, c: number, d: number, a: number, p: number) {
            let s;
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (typeof p == "undefined") p = d * (.3 * 1.5);
            if (!a || a < Math.abs(c)) {
                a = c;
                s = p / 4;
            } else {
                s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        }
    },
    // Back：超过范围的三次方缓动（(s+1)*t^3 – s*t^2）；
    Back: {
        easeIn: function (t: number, b: number, c: number, d: number, s: number) {
            if (typeof s == "undefined") s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOut: function (t: number, b: number, c: number, d: number, s: number) {
            if (typeof s == "undefined") s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOut: function (t: number, b: number, c: number, d: number, s: number) {
            if (typeof s == "undefined") s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        }
    },
    // Bounce：指数衰减的反弹缓动。
    Bounce: {
        easeIn: function (t: number, b: number, c: number, d: number) {
            return c - this.Bounce.easeOut(d - t, 0, c, d) + b;
        },
        easeOut: function (t: number, b: number, c: number, d: number) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        },
        easeInOut: function (t: number, b: number, c: number, d: number) {
            if (t < d / 2) {
                return this.Bounce.easeIn(t * 2, 0, c, d) * .5 + b;
            } else {
                return this.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
            }
        }
    }
}



