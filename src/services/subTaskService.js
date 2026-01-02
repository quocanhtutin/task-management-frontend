import axiosClient from '../utils/axiosConfig';

const subTaskService = {
    getSubTasks: (taskId) => {
        return axiosClient.get(`/Tasks/${taskId}/Subtasks`);
    },

    create: (data) => {
        return axiosClient.post('/SubTask', data);
    },

    delete: (subTaskId) => {
        return axiosClient.delete(`/SubTask/${subTaskId}`);
    },

    updateTitle: (subTaskId, newTitle) => {
        return axiosClient.put(`/SubTask/${subTaskId}/Title`, JSON.stringify(newTitle), {
            headers: { 'Content-Type': 'application/json' }
        });
    },

    updateStatus: (subTaskId, statusInt) => {
        return axiosClient.put(`/SubTask/${subTaskId}/Status`, {
            status: statusInt
        });
    },

    updatePosition: (subTaskId, newPosition) => {
        return axiosClient.put(`/SubTask/${subTaskId}/Move`, {
            newPosition: newPosition
        });
    },

    updateDates: (subTaskId, data) => {
        return axiosClient.put(`/SubTask/${subTaskId}/Dates`, data);
    }
};

export default subTaskService;