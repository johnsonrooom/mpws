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
/**Event changes much under different platform, we choose the minimal common property to easy to compile in TS*/
var Event = /** @class */ (function () {
    function Event(type) {
        this.type = type;
    }
    return Event;
}());
var MpMessageEvent = /** @class */ (function (_super) {
    __extends(MpMessageEvent, _super);
    function MpMessageEvent(data) {
        var _this = _super.call(this, 'message') || this;
        _this.data = data;
        return _this;
    }
    return MpMessageEvent;
}(Event));
exports.MpMessageEvent = MpMessageEvent;
var MpCloseEvent = /** @class */ (function (_super) {
    __extends(MpCloseEvent, _super);
    function MpCloseEvent(code, reason) {
        var _this = _super.call(this, 'close') || this;
        _this.wasClean = void 0;
        _this.reason = reason;
        _this.code = code;
        return _this;
    }
    return MpCloseEvent;
}(Event));
exports.MpCloseEvent = MpCloseEvent;
var MpOpenEvent = /** @class */ (function (_super) {
    __extends(MpOpenEvent, _super);
    function MpOpenEvent() {
        return _super.call(this, 'open') || this;
    }
    return MpOpenEvent;
}(Event));
exports.MpOpenEvent = MpOpenEvent;
var MpErrorEvent = /** @class */ (function (_super) {
    __extends(MpErrorEvent, _super);
    function MpErrorEvent(errMsg) {
        var _this = _super.call(this, 'error') || this;
        _this.error = new Error(errMsg);
        _this.message = _this.error.message;
        return _this;
    }
    return MpErrorEvent;
}(Event));
exports.MpErrorEvent = MpErrorEvent;
/** if we want to use the common interface in development mode,
 * just uncomment "implements WebSocket,EventTarget"
 * we don't do that in production because the d.ts file makes more sense here.
*/
var MpWebSocket = /** @class */ (function (_super) {
    __extends(MpWebSocket, _super); /*implements WebSocket,EventTarget*/
    function MpWebSocket(url, protocols) {
        if (protocols === void 0) { protocols = []; }
        var _this = _super.call(this) || this;
        _this.CONNECTING = 0;
        _this.OPEN = 1;
        _this.CLOSING = 2;
        _this.CLOSED = 3;
        _this.responseHeaders = {};
        _this._url = url;
        _this._readyState = _this.CONNECTING;
        var isSuccess = true;
        var errMsg = "silently closed without emitting any event by wechat";
        _this.socket = wx.connectSocket({
            url: url,
            header: {},
            protocols: Array.isArray(protocols) ? protocols : [protocols],
            fail: function (res) {
                isSuccess = false;
                errMsg = res.errMsg;
            }
        });
        if (isSuccess) {
            if (_this.socket['readyState'] === _this.CLOSED) {
                _this._readyState = _this.socket['readyState'];
                /**emit it in another event loop to buy time for setting listener*/
                setTimeout(function () { return _this.dispatchEvent(new MpErrorEvent(errMsg)); }, 0);
            }
            _this.socket.onOpen(function (res) {
                _this._readyState = _this.OPEN;
                /**We can't get res.header here, maybe future*/
                //for (let i in res.header) {
                //    this.responseHeaders[i.toLowerCase()] = res.header[i];
                //};
                _this.dispatchEvent(new MpOpenEvent());
            });
            _this.socket.onMessage(function (res) {
                _this.dispatchEvent(new MpMessageEvent(res.data));
            });
            _this.socket.onClose(function (res) {
                _this._readyState = _this.CLOSED;
                _this.dispatchEvent(new MpCloseEvent(res.code, res.reason));
            });
            _this.socket.onError(function (res) {
                _this.dispatchEvent(new MpErrorEvent(res.errMsg));
            });
        }
        else {
            var NOOP = function () { };
            /**Just to make it easy for getters*/
            _this.socket = {
                onOpen: NOOP,
                onMessage: NOOP,
                onClose: NOOP,
                onError: NOOP,
                send: NOOP,
                close: NOOP
            };
            _this._readyState = _this.CLOSED;
            /**emit it in another event loop to buy time for setting listener*/
            setTimeout(function () { return _this.dispatchEvent(new MpErrorEvent(errMsg)); }, 0);
        }
        return _this;
    }
    Object.defineProperty(MpWebSocket.prototype, "binaryType", {
        /**binaryType is not real but maybe future, for now arraybuffer*/
        get: function () {
            return this.socket["binaryType"] || "arraybuffer";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MpWebSocket.prototype, "bufferedAmount", {
        /**bufferedAmount is not real but maybe future, for now undefined */
        get: function () {
            return this.socket["bufferedAmount"] || void 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MpWebSocket.prototype, "extensions", {
        /**extensions is not real but maybe future, for now ""*/
        get: function () {
            return this.socket["extensions"]
                || this.responseHeaders["sec-websocket-extensions"]
                || "";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MpWebSocket.prototype, "protocol", {
        /**protocol is not real but maybe future, for now ""*/
        get: function () {
            return this.socket["protocol"]
                || this.responseHeaders["sec-websocket-protocol"]
                || "";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MpWebSocket.prototype, "readyState", {
        /**readyState is real, even this property is undocumented,
         * this._readyState is not always exactly the same, but will not affect action*/
        get: function () {
            return this.socket["readyState"] || this._readyState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MpWebSocket.prototype, "url", {
        /**url is real, socket doesn't have url for now, this._url is trusted*/
        get: function () {
            return this.socket["url"] || this._url;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MpWebSocket.prototype, "onopen", {
        //
        // Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
        // See https://html.spec.whatwg.org/multipage/web-sockets.html#network
        //
        //onopen: ((this: MpWebSocket, evt: MpOpenEvent) => any) | null;
        get: function () {
            var method = "open";
            var listeners = this.listeners(method);
            for (var i = 0; i < listeners.length; i++) {
                return listeners[i];
            }
            return void 0;
        },
        set: function (callback) {
            var method = "open";
            this.removeListener(method).addListener(method, callback);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MpWebSocket.prototype, "onerror", {
        //onerror: ((this: MpWebSocket, evt: MpErrorEvent) => any) | null;
        get: function () {
            var method = "error";
            var listeners = this.listeners(method);
            for (var i = 0; i < listeners.length; i++) {
                return listeners[i];
            }
            return void 0;
        },
        set: function (callback) {
            var method = "error";
            this.removeListener(method).addListener(method, callback);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MpWebSocket.prototype, "onclose", {
        //onclose: ((this: MpWebSocket, evt: MpCloseEvent) => any) | null;
        get: function () {
            var method = "close";
            var listeners = this.listeners(method);
            for (var i = 0; i < listeners.length; i++) {
                return listeners[i];
            }
            return void 0;
        },
        set: function (callback) {
            var method = "close";
            this.removeListener(method).addListener(method, callback);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MpWebSocket.prototype, "onmessage", {
        //onmessage: ((this: MpWebSocket, evt: MpMessageEvent) => any) | null;
        get: function () {
            var method = "message";
            var listeners = this.listeners(method);
            for (var i = 0; i < listeners.length; i++) {
                return listeners[i];
            }
            return void 0;
        },
        set: function (callback) {
            var method = "message";
            this.removeListener(method).addListener(method, callback);
        },
        enumerable: true,
        configurable: true
    });
    MpWebSocket.prototype.send = function (data) {
        this.socket.send({ data: data });
    };
    MpWebSocket.prototype.close = function (code, reason) {
        this._readyState = this.CLOSING;
        this.socket.close({
            code: code,
            reason: reason
        });
    };
    MpWebSocket.prototype.addEventListener = function (type, listener) {
        this.addListener(type, listener);
    };
    MpWebSocket.prototype.removeEventListener = function (type, listener) {
        this.removeListener(type, listener);
    };
    MpWebSocket.prototype.dispatchEvent = function (evt) {
        return this.emit(evt.type, evt);
    };
    MpWebSocket.CONNECTING = 0;
    MpWebSocket.OPEN = 1;
    MpWebSocket.CLOSING = 2;
    MpWebSocket.CLOSED = 3;
    return MpWebSocket;
}(eventemitter3_1.EventEmitter /*implements WebSocket,EventTarget*/));
exports.WebSocket = MpWebSocket;
//# sourceMappingURL=mpws.js.map