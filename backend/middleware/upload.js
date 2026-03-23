import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "memorax",
    resource_type: "auto", // VERY IMPORTANT (PDF support)
  },
});

const upload = multer({ storage });

export default upload;