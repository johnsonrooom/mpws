/// <reference path="../src/wx.d.ts" />
export declare class MpEvent {
    target: WebSocket;
    type: string;
    constructor(type: string, target: WebSocket);
}
export declare class MpMessageEvent extends MpEvent {
    data: string | ArrayBuffer;
    constructor(data: string | ArrayBuffer, target: WebSocket);
}
export declare class MpCloseEvent extends MpEvent {
    wasClean: boolean;
    reason: string;
    code: number;
    constructor(code: number, reason: string, target: WebSocket);
}
export declare class MpOpenEvent extends MpEvent {
    constructor(target: WebSocket);
}
export declare class MpErrorEvent extends MpEvent {
    error: Error;
    message: String;
    constructor(errMsg: string, target: WebSocket);
}
export declare var WebSocket: {
    prototype: WebSocket;
    new (url: string, protocols?: string | string[]): WebSocket;
    readonly CLOSED: number;
    readonly CLOSING: number;
    readonly CONNECTING: number;
    readonly OPEN: number;
};
