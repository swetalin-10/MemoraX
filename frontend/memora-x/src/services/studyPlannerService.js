import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const detectSyllabusDocs = async () => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.STUDY_PLANNER.DETECT_SYLLABUS
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to detect syllabus documents" };
  }
};

const generatePlanner = async (documentId) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.STUDY_PLANNER.GENERATE,
      { documentId }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to generate planner" };
  }
};

const getPlanners = async () => {
  try {
    const response = await axiosInstance.get(`${API_PATHS.STUDY_PLANNER.GET_ALL}?t=${Date.now()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch planners" };
  }
};

const getPlannerById = async (id) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.STUDY_PLANNER.GET_BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch planner details" };
  }
};

const plannerChat = async (id, message) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.STUDY_PLANNER.CHAT(id),
      { message }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update planner" };
  }
};

const toggleWeekComplete = async (id, weekIndex) => {
  try {
    const response = await axiosInstance.patch(
      API_PATHS.STUDY_PLANNER.TOGGLE_WEEK(id, weekIndex)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to toggle week completion" };
  }
};

const deletePlanner = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.STUDY_PLANNER.DELETE(id)
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete planner" };
  }
};

const studyPlannerService = {
  detectSyllabusDocs,
  generatePlanner,
  getPlanners,
  getPlannerById,
  plannerChat,
  toggleWeekComplete,
  deletePlanner,
};

export default studyPlannerService;
