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
    }

    createConnection(url, token) {
        return new HubConnectionBuilder()
            .withUrl(url, { accessTokenFactory: () => token })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();
    }

    async startBoardConnection(token) {
        if (this.boardConnection && this.boardConnection.state !== "Disconnected") return;
        this.token = token;
        
        this.boardConnection = this.createConnection("http://localhost:5174/hubs/board", token);

        this.boardConnection.on("boardnotification", (data) => {
            console.log("🔔 [BoardHub] Event:", data);
            this.boardListeners.forEach(cb => cb(data));
        });

        try { await this.boardConnection.start(); console.log("✅ BoardHub Connected"); } 
        catch (err) { console.error("❌ BoardHub Error:", err); }
    }

    async joinBoard(boardId) {
        if (this.boardConnection?.state === "Connected") {
            try {
                await this.boardConnection.invoke("JoinBoard", boardId);
            } catch (error) {
                console.warn(`⚠️ Cannot join board ${boardId}:`, error.message);
            }
        }
    }

    subscribeBoard(callback) {
        this.boardListeners.push(callback);
        return () => { this.boardListeners = this.boardListeners.filter(cb => cb !== callback); };
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