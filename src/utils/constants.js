export const ResumeStatusEnum = {
  UPLOADED: "uploaded",
  PROCESSING: "processing",
  PROCESSED: "processed",
  FAILED: "failed",
};

export const AvailableResumeStatuses = Object.values(ResumeStatusEnum);

export const RESUME_MAX_FILE_SIZE = 5 * 1024 * 1024;

export const AnalysisStatusEnum = {
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

export const AvailableAnalysisStatuses = Object.values(AnalysisStatusEnum);

export const JobDescriptionRequirementsStatusEnum = {
  PENDING: "pending",
  EXTRACTED: "extracted",
  FAILED: "failed",
};

export const AvailableJobDescriptionRequirementsStatuses = Object.values(
  JobDescriptionRequirementsStatusEnum,
);

export const JD_MIN_LENGTH = 50;
export const JD_MAX_LENGTH = 20000;

export const MatchStatusEnum = {
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

export const AvailableMatchStatuses = Object.values(MatchStatusEnum);
