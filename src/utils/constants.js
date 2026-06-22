export const UserRolesEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member",
};

export const AvailableRoles = Object.values(UserRolesEnum);

export const TaskStatusEnum = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

export const AvailableTaskStatus = Object.values(TaskStatusEnum);

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
