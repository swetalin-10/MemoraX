import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const getDashboardData = async (range) => {
    try {
        const url = range ? `${API_PATHS.PROGRESS.GET_DASHBOARD}?range=${range}` : API_PATHS.PROGRESS.GET_DASHBOARD;
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch dashboard data" };
    }
};

const progressService = {
    getDashboardData,
};

export default progressService;