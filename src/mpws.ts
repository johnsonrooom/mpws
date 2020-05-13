///<reference path="wx.d.ts"/>
'use strict';
import { EventEmitter }  from 'eventemitter3'
/**Event changes much under different platform, we choose the minimal common property to easy to compile in TS*/
class Event{
    type: string;
    constructor(type:string) {
        this.type=type;
    }
}
export class MpMessageEvent extends Event {
    data:string|ArrayBuffer;
    constructor(data:string|ArrayBuffer) {
        super('message');
        this.data = data;
    }
}
export class MpCloseEvent extends Event {
    wasClean:boolean;
    reason:string;
    code:number;
    constructor(code:number, reason:string) {
        super('close');
        this.wasClean = void 0;
        this.reason = reason;
        this.code = code;
    }
}
export class MpOpenEvent extends Event {
    constructor() {
        super('open');
    }
}
export class MpErrorEvent extends Event {
    error:Error;
    message:String;
    constructor(errMsg:string) {
        super('error');
        this.error = new Error(errMsg);
        this.message = this.error.message;
    }
}
/** if we want to use the common interface in development mode, 
 * just uncomment "implements WebSocket,EventTarget"
 * we don't do that in production because the d.ts file makes more sense here.
*/
class MpWebSocket extends EventEmitter /*implements WebSocket,EventTarget*/{
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
        let errMsg:string="silently closed without emitting any event by wechat";
        this.socket = wx.connectSocket({
            url,
            header: {},
            protocols: Array.isArray(protocols) ? protocols : [protocols],
            fail:(res)=>{           
                isSuccess=false;
                errMsg=res.errMsg;                
            }
        });
        if(isSuccess){
            if(this.socket['readyState']===this.CLOSED){
                this._readyState=this.socket['readyState'];
                /**emit it in another event loop to buy time for setting listener*/
                setTimeout(()=>this.dispatchEvent(new MpErrorEvent(errMsg)),0)
            }
            this.socket.onOpen((res)=>{
                this._readyState = this.OPEN;
                /**We can't get res.header here, maybe future*/
                //for (let i in res.header) {
                //    this.responseHeaders[i.toLowerCase()] = res.header[i];
                //};
                this.dispatchEvent(new MpOpenEvent());
            });
            this.socket.onMessage((res)=>{
                this.dispatchEvent(new MpMessageEvent(res.data))
            });
            this.socket.onClose((res)=>{
                this._readyState = this.CLOSED;
                this.dispatchEvent(new MpCloseEvent(res.code,res.reason));
            });
            this.socket.onError((res)=>{
                this.dispatchEvent(new MpErrorEvent(res.errMsg))
            });
        }
        else {
            let NOOP=()=>{};
            /**Just to make it easy for getters*/
            this.socket={
                onOpen:NOOP,
                onMessage:NOOP,
                onClose:NOOP,
                onError:NOOP,
                send:NOOP,
                close:NOOP
            };
            this._readyState=this.CLOSED;
            /**emit it in another event loop to buy time for setting listener*/
            setTimeout(()=>this.dispatchEvent(new MpErrorEvent(errMsg)),0)
        }
    }
    /**binaryType is not real but maybe future, for now arraybuffer*/
    get binaryType(): "blob" | "arraybuffer" {
        return this.socket["binaryType"] || "arraybuffer";
    }
    /**bufferedAmount is not real but maybe future, for now undefined */
    get bufferedAmount(): number {
        return this.socket["bufferedAmount"] || void 0;
    }
    /**extensions is not real but maybe future, for now ""*/
    get extensions(): string {
        return this.socket["extensions"]
            || this.responseHeaders["sec-websocket-extensions"]
            || "";
    }
    /**protocol is not real but maybe future, for now ""*/
    get protocol(): string {
        return this.socket["protocol"]
            || this.responseHeaders["sec-websocket-protocol"]
            || "";
    }
    /**readyState is real, even this property is undocumented, 
     * this._readyState is not always exactly the same, but will not affect action*/
    get readyState(): number {
        return this.socket["readyState"] || this._readyState;
    }
    /**url is real, socket doesn't have url for now, this._url is trusted*/
    get url(): string {
        return this.socket["url"] || this._url;
    }
    //
    // Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
    // See https://html.spec.whatwg.org/multipage/web-sockets.html#network
    //
    //onopen: ((this: MpWebSocket, evt: MpOpenEvent) => any) | null;
    get onopen(){
        let method:string="open"
        const listeners = this.listeners(method);
        for (var i = 0; i < listeners.length; i++) {
            return listeners[i];
        }
        return void 0;        
    }
    set onopen(callback:((this: MpWebSocket, evt: MpOpenEvent) => any)){
        let method:string="open";
        this.removeListener(method).addListener(method,callback);
    }
    //onerror: ((this: MpWebSocket, evt: MpErrorEvent) => any) | null;
    get onerror(){
        let method:string="error"
        const listeners = this.listeners(method);
        for (var i = 0; i < listeners.length; i++) {
            return listeners[i];
        }
        return void 0;        
    }
    set onerror(callback:((this: MpWebSocket, evt: MpErrorEvent) => any)){
        let method:string="error";
        this.removeListener(method).addListener(method,callback);
    }
    //onclose: ((this: MpWebSocket, evt: MpCloseEvent) => any) | null;
    get onclose(){
        let method:string="close"
        const listeners = this.listeners(method);
        for (var i = 0; i < listeners.length; i++) {
            return listeners[i];
        }
        return void 0;        
    }
    set onclose(callback:((this: MpWebSocket, evt: MpCloseEvent) => any)){
        let method:string="close";
        this.removeListener(method).addListener(method,callback);
    }
    //onmessage: ((this: MpWebSocket, evt: MpMessageEvent) => any) | null;
    get onmessage(){
        let method:string="message"
        const listeners = this.listeners(method);
        for (var i = 0; i < listeners.length; i++) {
            return listeners[i];
        }
        return void 0;        
    }
    set onmessage(callback:((this: MpWebSocket, evt: MpMessageEvent) => any)){
        let method:string="message";
        this.removeListener(method).addListener(method,callback);
    }
    send(data: string | ArrayBuffer) {
        this.socket.send({ data });
    }
    close(code?:number, reason?:string) {
        this._readyState = this.CLOSING;
        this.socket.close({
            code,
            reason
        });
    }
    addEventListener(type: string, listener: (evt: Event) => void){
        this.addListener(type,listener);
    }
    removeEventListener(type: string, listener: (evt: Event) => void){
        this.removeListener(type,listener);
    }
    dispatchEvent(evt: Event){
        return this.emit(evt.type,evt);
    }
}

export var WebSocket: {
    prototype: MpWebSocket;
    new(url: string, protocols?: string | string[]): MpWebSocket;
    readonly CLOSED: number;
    readonly CLOSING: number;
    readonly CONNECTING: number;
    readonly OPEN: number;
} = MpWebSocket;
