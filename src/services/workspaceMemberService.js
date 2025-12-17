import axiosClient from '../utils/axiosConfig';

const workspaceMemberService = {
    getAllMembers: (workspaceId) => {
        return axiosClient.get(`/WorkSpaceMember/${workspaceId}/Members`);
    },

    addMember: (workspaceId, userId, role) => {
        return axiosClient.post(`/WorkSpaceMember/${workspaceId}/Members`, {
            userId: userId,
            role: Number(role)
        });
    },

    updateRole: (workspaceId, userId, newRole) => {
        return axiosClient.put(`/WorkSpaceMember/${workspaceId}/Members/${userId}`, {
            role: Number(newRole)
        });
    },

    removeMember: (workspaceId, userId) => {
        return axiosClient.delete(`/WorkSpaceMember/${workspaceId}/Members/${userId}`);
    }
};

export default workspaceMemberService;