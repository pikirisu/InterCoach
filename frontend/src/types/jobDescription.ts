export type JobDescriptionRequirementsStatus = "pending" | "extracted" | "failed";

export interface JobDescriptionSummary {
  jobDescriptionId: string;
  title: string;
  company: string;
  requirementsStatus: JobDescriptionRequirementsStatus;
  createdAt: string;
  updatedAt: string;
}

export interface JobDescriptionDetail extends JobDescriptionSummary {
  rawText: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  keyResponsibilities: string[];
}
