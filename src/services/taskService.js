import axiosClient from '../utils/axiosConfig';

const taskService = {
    getTasks: (cardId) => {
        return axiosClient.get(`/Cards/${cardId}/Tasks`);
    },

    create: (data) => {
        return axiosClient.post('/Task', data);
    },

    delete: (taskId) => {
        return axiosClient.delete(`/Task/${taskId}`);
    },

    updateTitle: (taskId, newTitle) => {
        return axiosClient.put(`/Task/${taskId}/Title`, JSON.stringify(newTitle), {
            headers: { 'Content-Type': 'application/json' }
        });
    },

    updatePosition: (taskId, newPosition) => {
        return axiosClient.put(`/Task/${taskId}/Move`, {
            newPosition: newPosition
        });
    }
};

export default taskService;