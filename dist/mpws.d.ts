/// <reference path="../src/wx.d.ts" />
import { EventEmitter } from 'eventemitter3';
/**Event changes much under different platform, we choose the minimal common property to easy to compile in TS*/
declare class Event {
    type: string;
    constructor(type: string);
}
export declare class MpMessageEvent extends Event {
    data: string | ArrayBuffer;
    constructor(data: string | ArrayBuffer);
}
export declare class MpCloseEvent extends Event {
    wasClean: boolean;
    reason: string;
    code: number;
    constructor(code: number, reason: string);
}
export declare class MpOpenEvent extends Event {
    constructor();
}
export declare class MpErrorEvent extends Event {
    error: Error;
    message: String;
    constructor(errMsg: string);
}
/** if we want to use the common interface in development mode,
 * just uncomment "implements WebSocket,EventTarget"
 * we don't do that in production because the d.ts file makes more sense here.
*/
declare class MpWebSocket extends EventEmitter {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;
    readonly CONNECTING = 0;
    readonly OPEN = 1;
    readonly CLOSING = 2;
    readonly CLOSED = 3;
    private _url;
    private _readyState;
    private socket;
    private responseHeaders;
    constructor(url: string, protocols?: string | string[]);
    /**binaryType is not real but maybe future, for now arraybuffer*/
    get binaryType(): "blob" | "arraybuffer";
    /**bufferedAmount is not real but maybe future, for now undefined */
    get bufferedAmount(): number;
    /**extensions is not real but maybe future, for now ""*/
    get extensions(): string;
    /**protocol is not real but maybe future, for now ""*/
    get protocol(): string;
    /**readyState is real, even this property is undocumented,
     * this._readyState is not always exactly the same, but will not affect action*/
    get readyState(): number;
    /**url is real, socket doesn't have url for now, this._url is trusted*/
    get url(): string;
    get onopen(): ((this: MpWebSocket, evt: MpOpenEvent) => any);
    set onopen(callback: ((this: MpWebSocket, evt: MpOpenEvent) => any));
    get onerror(): ((this: MpWebSocket, evt: MpErrorEvent) => any);
    set onerror(callback: ((this: MpWebSocket, evt: MpErrorEvent) => any));
    get onclose(): ((this: MpWebSocket, evt: MpCloseEvent) => any);
    set onclose(callback: ((this: MpWebSocket, evt: MpCloseEvent) => any));
    get onmessage(): ((this: MpWebSocket, evt: MpMessageEvent) => any);
    set onmessage(callback: ((this: MpWebSocket, evt: MpMessageEvent) => any));
    send(data: string | ArrayBuffer): void;
    close(code?: number, reason?: string): void;
    addEventListener(type: string, listener: (evt: Event) => void): void;
    removeEventListener(type: string, listener: (evt: Event) => void): void;
    dispatchEvent(evt: Event): boolean;
}
export declare var WebSocket: {
    prototype: MpWebSocket;
    new (url: string, protocols?: string | string[]): MpWebSocket;
    readonly CLOSED: number;
    readonly CLOSING: number;
    readonly CONNECTING: number;
    readonly OPEN: number;
};
export {};
