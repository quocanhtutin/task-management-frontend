import axiosClient from '../utils/axiosConfig';

const userService = {
    search: (keyword) => {
        return axiosClient.get('/User', {
            params: {
                Search: keyword,
                PageIndex: 1,
                PageSize: 5
            }
        });
    }
};

export default userService;