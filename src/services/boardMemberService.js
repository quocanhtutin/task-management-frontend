import axiosClient from '../utils/axiosConfig';

const boardMemberService = {
    getAllMembers: (boardId) => {
        return axiosClient.get(`/BoardMember/${boardId}/Members`);
    },

    addMember: (boardId, userId, role) => {
        return axiosClient.post(`/BoardMember/${boardId}/Members`, {
            userId: userId,
            role: Number(role)
        });
    },

    updateRole: (boardId, userId, newRole) => {
        return axiosClient.put(`/BoardMember/${boardId}/Members/${userId}`, {
            role: Number(newRole)
        });
    },

    removeMember: (boardId, userId) => {
        return axiosClient.delete(`/BoardMember/${boardId}/Members/${userId}`);
    }
};

export default boardMemberService;