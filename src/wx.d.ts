declare namespace wx {
    interface CommonOptions {
        success?: (res:{errMsg:string}) => void;
        fail?: (res:{errMsg:string}) => void;
        complete?: (res:{errMsg:string}) => void;
    }

    class SocketTask {
        close(options: CommonOptions & {
            code?: number;
            reason?: string
        }): void;

        onOpen(callback?: (res: {
            header: { [field: string]: string }
        }) => void): void;

        onClose(callback?: (res?: any) => void): void;

        onError(callback?: (res: { errMsg: string }) => void): void;

        onMessage(callback?: (res: {
            data: string | ArrayBuffer
        }) => void): void;

        send(options: CommonOptions & {
            data: string | ArrayBuffer
        }): void;
    }

    const connectSocket: (options: CommonOptions & {
        url: string;
        header: { [field: string]: string };
        method?: string;
        protocols: string[];
    }) => SocketTask;

    const closeSocket: (options: CommonOptions & {
        code: number;
        reason: string;
    }) => void;

    const onSocketOpen: (callback?: (res: {
        header: { [field: string]: string }
    }) => void) => void;

    const onSocketClose: (callback?: () => void) => void;

    const onSocketMessage: (callback?: () => void) => void;

    const onSockerError: (callback?: () => void) => void;

    const sendSocketMessage: (msg: CommonOptions & {
        data: string | ArrayBuffer;
    }) => void;
}
