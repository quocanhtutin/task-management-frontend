import axiosClient from '../utils/axiosConfig';

const commentService = {
    getComments: (cardId) => {
        return axiosClient.get(`/Card/${cardId}/Comments`);
    },

    create: (cardId, content) => {
        return axiosClient.post(`/Card/${cardId}/Comments`, { content });
    },

    update: (commentId, content) => {
        return axiosClient.put(`/Card/Comments/${commentId}`, { content });
    },

    delete: (commentId) => {
        return axiosClient.delete(`/Card/Comments/${commentId}`);
    }
};

export default commentService;