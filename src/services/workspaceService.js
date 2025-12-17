import axiosClient from '../utils/axiosConfig';

const workspaceService = {
    getAll: (search = '') => {
        return axiosClient.get('/WorkSpace', { params: { search } });
    },

    getById: (id) => {
        return axiosClient.get(`/WorkSpace/${id}`);
    },

    create: (data) => {
        return axiosClient.post('/WorkSpace/Create', {
            workSpace: {
                name: data.name,
                description: data.description,
                background: data.background || '#ffffff',
                type: Number(data.type)
            }
        });
    },

    updateName: (id, name) => axiosClient.put(`/WorkSpace/${id}/Name`, { name }),
    updateDescription: (id, description) => axiosClient.put(`/WorkSpace/${id}/Description`, { description }),
    updateType: (id, type) => axiosClient.put(`/WorkSpace/${id}/Type`, { type: Number(type) }),
    updateBackground: (id, background) => {
        return axiosClient.put(`/WorkSpace/${id}/Background`, { background });
    },

    delete: (id) => axiosClient.delete(`/WorkSpace/${id}`)
};

export default workspaceService;