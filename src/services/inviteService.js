import axiosClient from '../utils/axiosConfig';

const inviteService = {
    createInviteLink: (data) => {
        let expiredAt = null;
        if (data.hours) {
            const date = new Date();
            date.setHours(date.getHours() + Number(data.hours));
            expiredAt = date.toISOString();
        }

        return axiosClient.post('/InviteLink', {
            type: Number(data.type),
            targetId: data.targetId,
            invitedUserId: null,
            slug: "",
            expiredAt: expiredAt
        });
    },

    getInviteLinks: (type, targetId) => {
        return axiosClient.get('/InviteLink', {
            params: { 
                Type: type, 
                TargetId: targetId 
            }
        });
    },

    revokeInviteLink: (inviteLinkId) => {
        return axiosClient.post(`/InviteLink/${inviteLinkId}/Revoke`);
    }
};

export default inviteService;