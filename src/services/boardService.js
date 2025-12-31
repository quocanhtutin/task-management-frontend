import axiosClient from '../utils/axiosConfig';

const boardService = {
    getBoards: (workspaceId, params = {}) => {
        const queryParams = { ...params };
        if (workspaceId) {
            queryParams.WorkspaceId = workspaceId;
        }
        return axiosClient.get('/Board', {
            params: queryParams
        });
    },

    getBoard: (boardId) => {
        return axiosClient.get(`/Board/${boardId}`);
    },

    getBoardFull: (boardId) => {
        return axiosClient.get(`/Board/${boardId}/Full`);
    },

    create: (data) => {
        return axiosClient.post('/Board/Create', data);
    },

    updateTitle: (boardId, title) => {
        return axiosClient.put(
            `/Board/${boardId}/Title`, 
            JSON.stringify(title),
            {
                headers: { 'Content-Type': 'application/json' }
            }
        ); 
    },

    updateDescription: (boardId, description) => {
        return axiosClient.put(
            `/Board/${boardId}/Description`, 
            JSON.stringify(description), 
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    },

    updateBackground: (boardId, background) => {
        return axiosClient.put(
            `/Board/${boardId}/Background`, 
            JSON.stringify(background), 
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    },

    updateVisibility: (boardId, visibility) => {
        return axiosClient.put(
            `/Board/${boardId}/Visibility`, 
            visibility, 
            {
                headers: { 'Content-Type': 'application/json' }
            }
        ); 
    },

    delete: (boardId) => {
        return axiosClient.delete(`/Board/${boardId}`);
    },

    updateLabels: (boardId, labelIndices) => {
        return axiosClient.put(`/Board/${boardId}/Labels`, labelIndices);
    },

    updateVisibility: (boardId, visibility) => {
        return axiosClient.put(`/Board/${boardId}/Visibility`, visibility, {
            headers: { 'Content-Type': 'application/json' }
        });
    },

    updatePinned: (boardId, isPinned) => {
        return axiosClient.put(`/Board/${boardId}/Pinned`, isPinned, {
            headers: { 'Content-Type': 'application/json' }
        });
    },

    duplicate: (boardId, copyLists, copyCards) => {
        return axiosClient.post(`/Board/${boardId}/Duplicate`, {
            copyLists: copyLists,
            copyCards: copyCards
        });
    }
};

export default boardService;