import axiosClient from '../utils/axiosConfig';

const cardService = {
    create: (data) => {
        return axiosClient.post('/Card', data);
    },

    getDetail: (cardId) => {
        return axiosClient.get(`/Card/${cardId}`);
    },

    delete: (cardId) => {
        return axiosClient.delete(`/Card/${cardId}`);
    },

    restore: (cardId) => {
        return axiosClient.put(`/Card/${cardId}/Restore`);
    },

    updateTitle: (cardId, title) => {
        return axiosClient.put(
            `/Card/${cardId}/Title`,
            JSON.stringify(title),
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    },

    updateDescription: (cardId, description) => {
        return axiosClient.put(
            `/Card/${cardId}/Description`,
            JSON.stringify(description),
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    },

    updateLabels: (cardId, labelIndices) => {
        return axiosClient.put(
            `/Card/${cardId}/Labels`,
            JSON.stringify(labelIndices),
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    },

    updateDates: (cardId, data) => {
        return axiosClient.put(`/Card/${cardId}/Dates`, data);
    },

    updateStatus: (cardId, status) => {
        return axiosClient.put(
            `/Card/${cardId}/Status`,
            JSON.stringify(status),
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    },

    move: (cardId, data) => {
        return axiosClient.put(`/Card/${cardId}/Move`, data);
    },

    getAssignees: (cardId) => {
        return axiosClient.get(`/Cards/${cardId}/Assignees`);
    },

    addAssignee: (cardId, userId) => {
        return axiosClient.post(`/Cards/${cardId}/Assignees`, { userId });
    },

    removeAssignee: (cardId, userId) => {
        return axiosClient.delete(`/Cards/${cardId}/Assignees/${userId}`);
    },
};

export default cardService;