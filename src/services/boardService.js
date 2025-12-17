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
        return axiosClient.put(`/Board/${boardId}/Title`, { string: title }); // Lưu ý key body là "string" theo swagger
    },

    updateDescription: (boardId, description) => {
        return axiosClient.put(`/Board/${boardId}/Description`, { string: description });
    },

    delete: (boardId) => {
        return axiosClient.delete(`/Board/${boardId}`);
    }
};

export default boardService;