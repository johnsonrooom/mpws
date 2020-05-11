///<reference path="wx.d.ts"/>
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var eventemitter3_1 = require("eventemitter3");
var MpEvent = /** @class */ (function () {
    function MpEvent(type, target) {
        this.target = target;
        this.type = type;
    }
    return MpEvent;
}());
exports.MpEvent = MpEvent;
var MpMessageEvent = /** @class */ (function (_super) {
    __extends(MpMessageEvent, _super);
    function MpMessageEvent(data, target) {
        var _this = _super.call(this, 'message', target) || this;
        _this.data = data;
        return _this;
    }
    return MpMessageEvent;
}(MpEvent));
exports.MpMessageEvent = MpMessageEvent;
var MpCloseEvent = /** @class */ (function (_super) {
    __extends(MpCloseEvent, _super);
    function MpCloseEvent(code, reason, target) {
        var _this = _super.call(this, 'close', target) || this;
        _this.wasClean = void 0;
        _this.reason = reason;
        _this.code = code;
        return _this;
    }
    return MpCloseEvent;
}(MpEvent));
exports.MpCloseEvent = MpCloseEvent;
var MpOpenEvent = /** @class */ (function (_super) {
    __extends(MpOpenEvent, _super);
    function MpOpenEvent(target) {
        return _super.call(this, 'open', target) || this;
    }
    return MpOpenEvent;
}(MpEvent));
exports.MpOpenEvent = MpOpenEvent;
var MpErrorEvent = /** @class */ (function (_super) {
    __extends(MpErrorEvent, _super);
    function MpErrorEvent(errMsg, target) {
        var _this = _super.call(this, 'error', target) || this;
        _this.error = new Error(errMsg);
        _this.message = _this.error.message;
        return _this;
    }
    return MpErrorEvent;
}(MpEvent));
exports.MpErrorEvent = MpErrorEvent;
var mpEventTarget = {
    addEventListener: function (method, listener) {
        if (typeof listener !== 'function')
            return;
        function onMessage(data) {
            listener.call(this, new MpMessageEvent(data, this));
        }
        function onClose(code, reason) {
            listener.call(this, new MpCloseEvent(code, reason, this));
        }
        function onError(errMsg) {
            listener.call(this, new MpErrorEvent(errMsg, this));
        }
        function onOpen() {
            listener.call(this, new MpOpenEvent(this));
        }
        if (method === 'message') {
            onMessage._listener = listener;
            this.on(method, onMessage);
        }
        else if (method === 'close') {
            onClose._listener = listener;
            this.on(method, onClose);
        }
        else if (method === 'error') {
            onError._listener = listener;
            this.on(method, onError);
        }
        else if (method === 'open') {
            onOpen._listener = listener;
            this.on(method, onOpen);
        }
        else {
            this.on(method, listener);
        }
    },
    removeEventListener: function (method, listener) {
        var listeners = this.listeners(method);
        for (var i = 0; i < listeners.length; i++) {
            if (listeners[i] === listener || listeners[i]._listener === listener) {
                this.removeListener(method, listeners[i]);
            }
        }
    },
    dispatchEvent: function (ev) {
        return this.emit(ev.type, ev);
    }
};
var MpWebSocket = /** @class */ (function (_super) {
    __extends(MpWebSocket, _super);
    function MpWebSocket(url, protocols) {
        if (protocols === void 0) { protocols = []; }
        var _this = _super.call(this) || this;
        _this.CONNECTING = 0;
        _this.OPEN = 1;
        _this.CLOSING = 2;
        _this.CLOSED = 3;
        _this.responseHeaders = {};
        _this.addEventListener = mpEventTarget.addEventListener;
        _this.removeEventListener = mpEventTarget.removeEventListener;
        _this.dispatchEvent = mpEventTarget.dispatchEvent;
        _this._url = url;
        _this._readyState = _this.CONNECTING;
        var isSuccess = true;
        var errMsg;
        _this.socket = wx.connectSocket({
            url: url,
            header: {},
            protocols: Array.isArray(protocols) ? protocols : [protocols],
            fail: function (res) {
                {
                    isSuccess = false;
                    errMsg = res.errMsg;
                }
            }
        });
        if (isSuccess) {
            _this.socket.onOpen(function (res) {
                _this._readyState = _this.OPEN;
                for (var i in res.header) {
                    _this.responseHeaders[i.toLowerCase()] = res.header[i];
                }
                ;
                _this.emit("open");
            });
            _this.socket.onMessage(function (res) {
                _this.emit("message", res.data);
            });
            _this.socket.onClose(function (res) {
                _this._readyState = _this.CLOSED;
                _this.emit("close", res.code, res.reason);
            });
            _this.socket.onError(function (res) {
                _this.emit("error", res.errMsg);
            });
        }
        else {
            _this._readyState = _this.CLOSED;
            var NOOP = function () { };
            _this.socket = {
                onOpen: NOOP,
                onMessage: NOOP,
                onClose: NOOP,
                onError: NOOP,
                send: NOOP,
                close: NOOP
            };
            setTimeout(function () { return _this.emit("error", errMsg); }, 0);
        }
        return _this;
    }
    Object.defineProperty(MpWebSocket.prototype, "binaryType", {
        get: function () {
            return this.socket["binaryType"] || "arraybuffer";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MpWebSocket.prototype, "bufferedAmount", {
        get: function () {
            return this.socket["bufferedAmount"] || void 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MpWebSocket.prototype, "extensions", {
        get: function () {
            return this.socket["extensions"]
                || this.responseHeaders["sec-websocket-extensions"]
                || "";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MpWebSocket.prototype, "protocol", {
        get: function () {
            return this.socket["protocol"]
                || this.responseHeaders["sec-websocket-protocol"]
                || "";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MpWebSocket.prototype, "readyState", {
        get: function () {
            return this.socket["readyState"] || this._readyState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MpWebSocket.prototype, "url", {
        get: function () {
            return this.socket["url"] || this._url;
        },
        enumerable: true,
        configurable: true
    });
    MpWebSocket.prototype.close = function (code, reason) {
        this._readyState = this.CLOSING;
        this.socket.close({
            code: code,
            reason: reason
        });
    };
    MpWebSocket.prototype.send = function (data) {
        this.socket.send({ data: data });
    };
    MpWebSocket.CONNECTING = 0;
    MpWebSocket.OPEN = 1;
    MpWebSocket.CLOSING = 2;
    MpWebSocket.CLOSED = 3;
    return MpWebSocket;
}(eventemitter3_1.EventEmitter));
//
// Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
// See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface
//
['open', 'error', 'close', 'message'].forEach(function (method) {
    Object.defineProperty(MpWebSocket.prototype, "on" + method, {
        /**
         * Return the listener of the event.
         *
         * @return {(Function|undefined)} The event listener or `undefined`
         * @public
         */
        get: function () {
            var listeners = this.listeners(method);
            for (var i = 0; i < listeners.length; i++) {
                if (listeners[i]._listener)
                    return listeners[i]._listener;
            }
            return undefined;
        },
        /**
         * Add a listener for the event.
         *
         * @param {Function} listener The listener to add
         * @public
         */
        set: function (listener) {
            var listeners = this.listeners(method);
            for (var i = 0; i < listeners.length; i++) {
                //
                // Remove only the listeners added via `addEventListener`.
                //
                if (listeners[i]._listener)
                    this.removeListener(method, listeners[i]);
            }
            this.addEventListener(method, listener);
        }
    });
});
exports.WebSocket = MpWebSocket;
//# sourceMappingURL=mpws.js.map