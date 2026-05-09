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

const uploadSyllabus = async (file, title) => {
  try {
    // 1. Upload the file as a document first
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    const uploadResponse = await axiosInstance.post(
      API_PATHS.DOCUMENTS.UPLOAD,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const documentId = uploadResponse.data.data._id;

    // 2. Poll for document readiness (max 15 seconds)
    // The backend generatePlanner requires extractedText which is populated during background processing
    let isReady = false;
    let attempts = 0;
    while (!isReady && attempts < 15) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const docResponse = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(documentId));
      if (docResponse.data.data.status === "ready") {
        isReady = true;
      } else if (docResponse.data.data.status === "failed") {
        throw new Error("Syllabus processing failed. Please try a different PDF.");
      }
      attempts++;
    }

    if (!isReady) {
      throw new Error("Syllabus processing is taking longer than expected. It will appear in 'Detect Syllabus' once ready.");
    }

    // 3. Generate planner from the ready document
    const plannerResponse = await axiosInstance.post(
      API_PATHS.STUDY_PLANNER.GENERATE,
      { documentId }
    );

    return plannerResponse.data.data;
  } catch (error) {
    throw error.response?.data || { message: error.message || "Failed to upload and generate planner" };
  }
};

const studyPlannerService = {
  detectSyllabusDocs,
  generatePlanner,
  createPlanner: generatePlanner,
  uploadSyllabus,
  getPlanners,
  getPlannerById,
  plannerChat,
  modifyPlanner: plannerChat,
  toggleWeekComplete,
  deletePlanner,
};

export default studyPlannerService;
