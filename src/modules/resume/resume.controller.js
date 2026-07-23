import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { Resume } from "./resume.model.js";
import { extractResumeText } from "./resume.service.js";
import { ResumeStatusEnum } from "../../utils/constants.js";
import { ApiError } from "../../utils/api-error.js";
import { ApiResponse } from "../../utils/api-response.js";

const buildStoredFilePath = (absolutePath) =>
  path.relative(process.cwd(), absolutePath).replace(/\\/g, "/");

const getAbsoluteFilePath = (storedPath) =>
  path.join(process.cwd(), storedPath);

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const serializeResumeSummary = (resume) => ({
  resumeId: resume._id,
  fileName: resume.originalFileName,
  filePath: resume.filePath,
  fileSize: resume.fileSize,
  status: resume.status,
  createdAt: resume.createdAt,
  updatedAt: resume.updatedAt,
});

const serializeResumeDetail = (resume) => ({
  ...serializeResumeSummary(resume),
  mimeType: resume.mimeType,
  extractedText: resume.extractedText,
});

export const uploadResume = async (req, res) => {
  let resume = null;

  try {
    if (!req.file) {
      throw new ApiError(400, "Resume PDF is required");
    }

    resume = await Resume.create({
      user: req.user._id,
      originalFileName: req.file.originalname,
      filePath: buildStoredFilePath(req.file.path),
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      status: ResumeStatusEnum.UPLOADED,
    });

    resume.status = ResumeStatusEnum.PROCESSING;
    await resume.save();

    try {
      const extractedText = await extractResumeText(req.file.path);

      resume.extractedText = extractedText;
      resume.status = ResumeStatusEnum.PROCESSED;
      await resume.save();
    } catch (error) {
      resume.status = ResumeStatusEnum.FAILED;
      await resume.save();

      throw new ApiError(
        500,
        "Resume uploaded but text extraction failed",
        [],
        "",
        {
          resume: {
            resumeId: resume._id,
            status: resume.status,
          },
        },
      );
    }

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          resume: serializeResumeDetail(resume),
        },
        "Resume uploaded successfully",
      ),
    );
  } catch (error) {
    if (!resume && req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        if (unlinkError.code !== "ENOENT") {
          console.error(unlinkError);
        }
      }
    }

    throw error;
  }
};

export const getMyResumes = async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select(
      "_id originalFileName filePath fileSize status createdAt updatedAt",
    );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        resumes: resumes.map((resume) => serializeResumeSummary(resume)),
      },
      "Resumes fetched successfully",
    ),
  );
};

export const getResumeById = async (req, res) => {
  const { resumeId } = req.params;

  if (!isValidObjectId(resumeId)) {
    throw new ApiError(400, "Invalid resume id");
  }

  const resume = await Resume.findOne({
    _id: resumeId,
    user: req.user._id,
  }).select(
    "_id originalFileName filePath mimeType fileSize extractedText status createdAt updatedAt",
  );

  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        resume: serializeResumeDetail(resume),
      },
      "Resume fetched successfully",
    ),
  );
};

export const deleteResume = async (req, res) => {
  const { resumeId } = req.params;

  if (!isValidObjectId(resumeId)) {
    throw new ApiError(400, "Invalid resume id");
  }

  const resume = await Resume.findOneAndDelete({
    _id: resumeId,
    user: req.user._id,
  });

  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }

  const absoluteFilePath = getAbsoluteFilePath(resume.filePath);

  try {
    await fs.unlink(absoluteFilePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        resumeId: resume._id,
      },
      "Resume deleted successfully",
    ),
  );
};
