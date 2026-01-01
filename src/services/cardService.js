import axiosClient from '../utils/axiosConfig';

const cardService = {
    create: (data) => {
        return axiosClient.post('/Card', data);
    },

    getDetail: (cardId) => {
        return axiosClient.get(`/Card/${cardId}`);
    }
};

export default cardService;