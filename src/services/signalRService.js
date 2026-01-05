import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

class SignalRService {
    constructor() {
        this.boardConnection = null;
        this.workspaceConnection = null;
        this.userConnection = null;
        this.token = null;
        
        this.boardListeners = [];
        this.workspaceListeners = [];
        this.userListeners = [];
        this.connection = null;
        this.token = null;
        this.listeners = [];
    }

    createConnection(url, token) {
        return new HubConnectionBuilder()
            .withUrl(url, { accessTokenFactory: () => token })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();
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

    async startWorkspaceConnection(token) {
        if (this.workspaceConnection && this.workspaceConnection.state !== "Disconnected") return;
        this.token = token;
        this.workspaceConnection = this.createConnection("http://localhost:5174/hubs/workSpace", token);

        this.workspaceConnection.on("workspacenotification", (data) => {
            console.log("🔔 [WorkspaceHub] Event:", data);
            this.workspaceListeners.forEach(cb => cb(data));
        });

        this.workspaceConnection.on("ReceiveWorkspaceUpdate", (data) => {
             console.log("🔔 [WorkspaceHub] Update:", data);
             this.workspaceListeners.forEach(cb => cb(data));
        });

        try { await this.workspaceConnection.start(); console.log("✅ WorkspaceHub Connected"); } 
        catch (err) { console.error("❌ WorkspaceHub Error:", err); }
    }

    async joinWorkspace(workspaceId) {
        if (this.workspaceConnection?.state === "Connected") {
            try {
                await this.workspaceConnection.invoke("JoinWorkspace", workspaceId);
            } catch (error) {
                console.warn(`⚠️ Skipped joining workspace ${workspaceId} (Access Denied)`);
            }
        }
    }

    subscribeWorkspace(callback) {
        this.workspaceListeners.push(callback);
        return () => { this.workspaceListeners = this.workspaceListeners.filter(cb => cb !== callback); };
    }

    async startUserConnection(token) {
        if (this.userConnection && this.userConnection.state !== "Disconnected") return;
        this.token = token;

        this.userConnection = this.createConnection("http://localhost:5174/hubs/user", token);

        this.userConnection.on("usernotification", (data) => {
            console.log("🔔 [UserHub] Event:", data);
            this.userListeners.forEach(cb => cb(data));
        });

        try { await this.userConnection.start(); console.log("✅ UserHub Connected"); } 
        catch (err) { console.error("❌ UserHub Error:", err); }
    }

    subscribeUser(callback) {
        this.userListeners.push(callback);
        return () => { this.userListeners = this.userListeners.filter(cb => cb !== callback); };
    }

    async stopAll() {
        if (this.boardConnection) await this.boardConnection.stop();
        if (this.workspaceConnection) await this.workspaceConnection.stop();
        if (this.userConnection) await this.userConnection.stop();
        this.boardListeners = [];
        this.workspaceListeners = [];
        this.userListeners = [];
    }
}

export default new SignalRService();