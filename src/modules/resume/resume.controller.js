import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { Resume } from "./resume.model.js";
import { extractResumeText } from "./resume.service.js";
import { ResumeStatusEnum } from "../../utils/constants.js";

const buildStoredFilePath = (absolutePath) =>
  path.relative(process.cwd(), absolutePath).replace(/\\/g, "/");

const getAbsoluteFilePath = (storedPath) =>
  path.join(process.cwd(), storedPath);

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const uploadResume = async (req, res) => {
  let resume = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Resume PDF is required",
      });
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

      return res.status(500).json({
        message: "Resume uploaded but text extraction failed",
        resumeId: resume._id,
        status: resume.status,
      });
    }

    return res.status(201).json({
      resumeId: resume._id,
      fileName: resume.originalFileName,
      status: resume.status,
    });
  } catch (error) {
    console.error(error);

    if (!resume && req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        if (unlinkError.code !== "ENOENT") {
          console.error(unlinkError);
        }
      }
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select(
        "_id originalFileName filePath fileSize status createdAt updatedAt",
      );

    return res.status(200).json(
      resumes.map((resume) => ({
        resumeId: resume._id,
        fileName: resume.originalFileName,
        filePath: resume.filePath,
        fileSize: resume.fileSize,
        status: resume.status,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      })),
    );
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const { resumeId } = req.params;

    if (!isValidObjectId(resumeId)) {
      return res.status(400).json({
        message: "Invalid resume id",
      });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user._id,
    }).select(
      "_id originalFileName filePath mimeType fileSize extractedText status createdAt updatedAt",
    );

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    return res.status(200).json({
      resumeId: resume._id,
      fileName: resume.originalFileName,
      filePath: resume.filePath,
      mimeType: resume.mimeType,
      fileSize: resume.fileSize,
      extractedText: resume.extractedText,
      status: resume.status,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    if (!isValidObjectId(resumeId)) {
      return res.status(400).json({
        message: "Invalid resume id",
      });
    }

    const resume = await Resume.findOneAndDelete({
      _id: resumeId,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    const absoluteFilePath = getAbsoluteFilePath(resume.filePath);

    try {
      await fs.unlink(absoluteFilePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    return res.status(200).json({
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
