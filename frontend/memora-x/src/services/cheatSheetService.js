import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const generateCheatSheet = async (documentId, options = {}) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.CHEAT_SHEETS.GENERATE(documentId),
      options
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to generate cheat sheet" };
  }
};

const getCheatSheetsForDocument = async (documentId) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.CHEAT_SHEETS.GET_FOR_DOCUMENT(documentId)
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch cheat sheets" }
    );
  }
};

const getAllCheatSheets = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.CHEAT_SHEETS.GET_ALL);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch all cheat sheets" }
    );
  }
};

const getCheatSheetById = async (id) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.CHEAT_SHEETS.GET_BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch cheat sheet" }
    );
  }
};

const deleteCheatSheet = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.CHEAT_SHEETS.DELETE(id)
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to delete cheat sheet" }
    );
  }
};

const regenerateSection = async (id, options = {}) => {
  try {
    const response = await axiosInstance.patch(
      API_PATHS.CHEAT_SHEETS.REGENERATE_SECTION(id),
      options
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to regenerate section",
      }
    );
  }
};

const cheatSheetService = {
  generateCheatSheet,
  getCheatSheetsForDocument,
  getAllCheatSheets,
  getCheatSheetById,
  deleteCheatSheet,
  regenerateSection,
};

export default cheatSheetService;
