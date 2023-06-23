export class Room {
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.storage = state.storage;
    }

    async fetch(request) {
        if (request.headers.get("Upgrade") != "websocket") {
            return new Response("expected websocket", { status: 400 });
        }
        let url = new URL(request.url);
        let name = "default name";
        if (url.searchParams.has("name")) {
            name = url.searchParams.get("name");
        }
        const [client, websocket] = Object.values(new WebSocketPair())
        websocket.serializeAttachment(name);
        this.state.acceptWebSocket(websocket);
        this.broadcast(name + " joined");
        return new Response(null, { status: 101, webSocket: client });
    }

    getSockets() {
        return this.state.getWebSockets();
    }

    async webSocketMessage(ws, message) {
        let name = ws.deserializeAttachment();
        this.broadcast(name + ":" + message);
    }

    async webSocketClose(ws) {
        let name = ws.deserializeAttachment();
        this.broadcast(name + " left");
    }

    async broadcast(message) {
        let sockets = this.getSockets();
        for (let socket of sockets) {
            try {
                socket.send(message);
            } catch (error) {
                console.error(error);
            }
        }
    }
}