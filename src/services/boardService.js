import axiosClient from '../utils/axiosConfig';

const boardService = {
    getBoards: (workspaceId, params = {}) => {
        return axiosClient.get('/Board', {
            params: {
                WorkspaceId: workspaceId,
                ...params
            }
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
    }
};

export default boardService;