import axiosClient from '../utils/axiosConfig';

const listService = {
    getLists: (boardId) => {
        return axiosClient.get(`/Boards/${boardId}/Lists`);
    },

    create: (data) => {
        return axiosClient.post('/List', data);
    },

    updateTitle: (listId, title) => {
        return axiosClient.put(
            `/List/${listId}/Title`,
            JSON.stringify(title),
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    },

    updatePosition: (listId, position) => {
        return axiosClient.put(
            `/List/${listId}/Position`,
            position,
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    },
    
    move: (listId, targetBoardId) => {
        return axiosClient.put(
            `/List/${listId}/Move`,
            { targetBoardId },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    },

    archive: (listId) => {
        return axiosClient.put(`/List/${listId}/Archive`);
    },

    unarchive: (listId) => {
        return axiosClient.put(`/List/${listId}/Unarchive`);
    },

    clone: (listId, copyCards = true) => {
        return axiosClient.post(`/List/${listId}/Clone`, {
            copyCards: copyCards
        });
    }
};

export default listService;