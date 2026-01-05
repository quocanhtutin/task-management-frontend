import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

class SignalRService {
    constructor() {
        this.connection = null;
        this.token = null;
        this.listeners = [];
    }

    async startConnection(token) {
        if (this.connection && this.connection.state !== "Disconnected") return;
        
        this.token = token;
        const HUB_URL = "http://localhost:5174/hubs/board";

        this.connection = new HubConnectionBuilder()
            .withUrl(HUB_URL, {
                accessTokenFactory: () => this.token
            })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        this.connection.on("boardnotification", (data) => {
            console.log("🔔 [SignalR] Event Received:", data);
            
            this.listeners.forEach(callback => callback(data));
        });

        try {
            await this.connection.start();
            console.log("✅ SignalR Connected");
        } catch (err) {
            console.error("❌ SignalR Connection Error: ", err);
        }
    }

    async joinBoard(boardId) {
        if (this.connection?.state === "Connected") {
            try {
                await this.connection.invoke("JoinBoard", boardId);
            } catch (err) {
                console.error("JoinBoard Error:", err);
            }
        }
    }

    async leaveBoard(boardId) {
        if (this.connection?.state === "Connected") {
            try {
                await this.connection.invoke("LeaveBoard", boardId);
            } catch (err) {
                console.error("LeaveBoard Error:", err);
            }
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
        console.log("➕ Đã thêm listener. Tổng số:", this.listeners.length);
        
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
            console.log("➖ Đã xóa listener. Tổng số:", this.listeners.length);
        };
    }

    async stopConnection() {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
            this.listeners = [];
        }
    }
}

export default new SignalRService();