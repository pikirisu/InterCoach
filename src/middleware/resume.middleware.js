import fs from "fs";
import path from "path";
import multer from "multer";
import { RESUME_MAX_FILE_SIZE } from "../utils/constants.js";

const uploadsRoot = path.join(process.cwd(), "uploads", "resumes");

const ensureUploadDirectory = () => {
  fs.mkdirSync(uploadsRoot, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDirectory();
    cb(null, uploadsRoot);
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname) || ".pdf";
    const safeBaseName = path
      .basename(file.originalname, fileExtension)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 50);

    cb(null, `${Date.now()}-${safeBaseName || "resume"}${fileExtension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isPdf =
    file.mimetype === "application/pdf" &&
    path.extname(file.originalname).toLowerCase() === ".pdf";

  if (!isPdf) {
    cb(new Error("Only PDF resumes are allowed"));
    return;
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: RESUME_MAX_FILE_SIZE,
  },
  fileFilter,
});

export const uploadResumeFile = (req, res, next) => {
  upload.single("resume")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "Resume must be 5 MB or smaller",
        });
      }

      return res.status(400).json({
        message: error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        message: error.message || "Invalid file upload",
      });
    }

    next();
  });
};
