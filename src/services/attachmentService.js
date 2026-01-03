import axiosClient from '../utils/axiosConfig';

const attachmentService = {
    getAttachments: (cardId) => {
        return axiosClient.get(`/Attachment/Cards/${cardId}/Attachments`);
    },

    upload: (cardId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        return axiosClient.post(`/Attachment/Cards/${cardId}/Attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    delete: (attachmentId) => {
        return axiosClient.delete(`/Attachment/${attachmentId}`);
    }
};

export default attachmentService;