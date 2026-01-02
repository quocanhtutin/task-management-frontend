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

    move: (cardId, data) => {
        return axiosClient.put(`/Card/${cardId}/Move`, data);
    },
};

export default cardService;