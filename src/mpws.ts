///<reference path="wx.d.ts"/>
'use strict';
import { EventEmitter }  from 'eventemitter3'

export class MpEvent {
    target:WebSocket;
    type:string;

    constructor(type:string, target:WebSocket) {
        this.target = target;
        this.type = type;
    }
}
  
export class MpMessageEvent extends MpEvent {
    data:string|ArrayBuffer;

    constructor(data:string|ArrayBuffer, target:WebSocket) {
        super('message', target);

        this.data = data;
}
}
  
export class MpCloseEvent extends MpEvent {
    wasClean:boolean;
    reason:string;
    code:number;

    constructor(code:number, reason:string, target:WebSocket) {
        super('close', target);

        this.wasClean = void 0;
        this.reason = reason;
        this.code = code;
    }
}
  

export class MpOpenEvent extends MpEvent {

    constructor(target:WebSocket) {
        super('open', target);
    }
}
  
export class MpErrorEvent extends MpEvent {
    error:Error;
    message:String;

    constructor(errMsg:string, target:WebSocket) {
        super('error', target);
        this.error = new Error(errMsg);
        this.message = this.error.message;
    }
}
  
const mpEventTarget = {

    addEventListener(method:any, listener:any) {
        if (typeof listener !== 'function') return;

        function onMessage(data:string|ArrayBuffer) {
        listener.call(this, new MpMessageEvent(data, this));
    }

    function onClose(code:number, reason:string) {
        listener.call(this, new MpCloseEvent(code, reason, this));
    }

    function onError(errMsg:string) {
        listener.call(this, new MpErrorEvent(errMsg, this));
    }

    function onOpen() {
        listener.call(this, new MpOpenEvent(this));
    }

    if (method === 'message') {
        onMessage._listener = listener;
        this.on(method, onMessage);
    } else if (method === 'close') {
        onClose._listener = listener;
        this.on(method, onClose);
    } else if (method === 'error') {
        onError._listener = listener;
        this.on(method, onError);
    } else if (method === 'open') {
        onOpen._listener = listener;
        this.on(method, onOpen);
    } else {
        this.on(method, listener);
    }
},

removeEventListener(method, listener) {
    const listeners = this.listeners(method);

    for (var i = 0; i < listeners.length; i++) {
        if (listeners[i] === listener || listeners[i]._listener === listener) {
            this.removeListener(method, listeners[i]);
        }
    }
},

dispatchEvent(ev): boolean {
    return this.emit(ev.type,ev);
}
};

class MpWebSocket extends EventEmitter implements WebSocket,EventTarget {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;
    readonly CONNECTING = 0;
    readonly OPEN = 1;
    readonly CLOSING = 2;
    readonly CLOSED = 3;
    private _url:string;
    private _readyState:number;
    private socket: wx.SocketTask;
    private responseHeaders: { [field: string]: string } = {};

    constructor(url: string, protocols: string | string[] = []) {
        super();
        this._url = url;
        this._readyState = this.CONNECTING;
        let isSuccess:boolean = true;
        let errMsg:string;
        this.socket = wx.connectSocket({
            url,
            header: {},
            protocols: Array.isArray(protocols) ? protocols : [protocols],
            fail:(res)=>{
                {
                    isSuccess=false;
                    errMsg=res.errMsg;                
                }
            }
        });
        if(isSuccess){
            this.socket.onOpen((res)=>{
                this._readyState = this.OPEN;
                for (let i in res.header) {
                    this.responseHeaders[i.toLowerCase()] = res.header[i];
                };
                this.emit("open");
            });
            this.socket.onMessage((res)=>{
                this.emit("message",res.data);
            });
            this.socket.onClose((res)=>{
                this._readyState = this.CLOSED;
                this.emit("close",res.code,res.reason);
            });
            this.socket.onError((res)=>{
                this.emit("error",res.errMsg);
            });
        }
        else {
            this._readyState=this.CLOSED;
            let NOOP=()=>{};
            this.socket={
                onOpen:NOOP,
                onMessage:NOOP,
                onClose:NOOP,
                onError:NOOP,
                send:NOOP,
                close:NOOP
            };
            setTimeout(()=>this.emit("error", errMsg),0); 
        }
    }

    get binaryType(): "blob" | "arraybuffer" {
        return this.socket["binaryType"] || "arraybuffer";
    }

    get bufferedAmount(): number {
        return this.socket["bufferedAmount"] || void 0;
    }

    get extensions(): string {
        return this.socket["extensions"]
            || this.responseHeaders["sec-websocket-extensions"]
            || "";
    }

    get protocol(): string {
        return this.socket["protocol"]
            || this.responseHeaders["sec-websocket-protocol"]
            || "";
    }

    get readyState(): number {
        return this.socket["readyState"] || this._readyState;
    }

    get url(): string {
        return this.socket["url"] || this._url;
    }
    onopen:any;
    onmessage:any;
    onerror:any;
    onclose:any;

    close(code?:number, reason?:string) {
        this._readyState = this.CLOSING;
        this.socket.close({
            code,
            reason
        });
    }

    send(data: string | ArrayBuffer) {
        this.socket.send({ data });
    }

    addEventListener:(type: string, listener: (evt: Event) => void)=>void=mpEventTarget.addEventListener;
    removeEventListener:(type: string, listener: (evt: Event) => void)=>void=mpEventTarget.removeEventListener;
    dispatchEvent:(event: Event)=>boolean = mpEventTarget.dispatchEvent;
}

//
// Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
// See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface
//
['open', 'error', 'close', 'message'].forEach((method) => {
    Object.defineProperty(MpWebSocket.prototype, `on${method}`, {
      /**
       * Return the listener of the event.
       *
       * @return {(Function|undefined)} The event listener or `undefined`
       * @public
       */
      get():any {
        const listeners = this.listeners(method);
        for (var i = 0; i < listeners.length; i++) {
          if (listeners[i]._listener) return listeners[i]._listener;
        }
  
        return undefined;
      },
      /**
       * Add a listener for the event.
       *
       * @param {Function} listener The listener to add
       * @public
       */
      set(listener:any) {
        const listeners = this.listeners(method);
        for (var i = 0; i < listeners.length; i++) {
          //
          // Remove only the listeners added via `addEventListener`.
          //
          if (listeners[i]._listener) this.removeListener(method, listeners[i]);
        }
        this.addEventListener(method, listener);
      }
    });
  });
  
export var WebSocket: {
    prototype: WebSocket;
    new(url: string, protocols?: string | string[]): WebSocket;
    readonly CLOSED: number;
    readonly CLOSING: number;
    readonly CONNECTING: number;
    readonly OPEN: number;
} = MpWebSocket;
