import { Briefcase, Building2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "../components/layout/PageHeader";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  Skeleton,
  StatusBadge,
  useToast,
} from "../components/ui";
import { JobDescriptionService } from "../features/jobDescription/JobDescriptionService";
import type { JobDescriptionSummary } from "../types/jobDescription";
import { formatDate } from "../utils/format";
import { getApiErrorMessage } from "../utils/apiError";

const RAW_TEXT_MIN_LENGTH = 50;

function JobDescriptionListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved job descriptions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton className="h-16 w-full" key={index} />
        ))}
      </CardContent>
    </Card>
  );
}

export function JobDescriptionsPage() {
  const { showToast, updateToast } = useToast();
  const [jobDescriptions, setJobDescriptions] = useState<JobDescriptionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [rawText, setRawText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<JobDescriptionSummary | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadJobDescriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await JobDescriptionService.listJobDescriptions();
      setJobDescriptions(response.data.jobDescriptions);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobDescriptions();
  }, [loadJobDescriptions]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!title.trim() || !rawText.trim()) {
      setFormError("Title and job description text are required.");
      return;
    }

    if (rawText.trim().length < RAW_TEXT_MIN_LENGTH) {
      setFormError(`Job description text must be at least ${RAW_TEXT_MIN_LENGTH} characters long.`);
      return;
    }

    setIsCreating(true);
    const toastId = showToast({ description: title, duration: 0, title: "Saving job description", tone: "loading" });

    try {
      const response = await JobDescriptionService.createJobDescription({
        title: title.trim(),
        company: company.trim() || undefined,
        rawText: rawText.trim(),
      });
      setJobDescriptions((current) => [
        {
          jobDescriptionId: response.data.jobDescription.jobDescriptionId,
          title: response.data.jobDescription.title,
          company: response.data.jobDescription.company,
          requirementsStatus: response.data.jobDescription.requirementsStatus,
          createdAt: response.data.jobDescription.createdAt,
          updatedAt: response.data.jobDescription.updatedAt,
        },
        ...current,
      ]);
      setTitle("");
      setCompany("");
      setRawText("");
      updateToast(toastId, { description: "You can now match resumes against it.", title: "Job description saved", tone: "success" });
    } catch (createError) {
      const message = getApiErrorMessage(createError);
      setFormError(message);
      updateToast(toastId, { description: message, title: "Save failed", tone: "error" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeletingId(deleteTarget.jobDescriptionId);
    const toastId = showToast({ description: deleteTarget.title, duration: 0, title: "Deleting job description", tone: "loading" });

    try {
      const response = await JobDescriptionService.deleteJobDescription(deleteTarget.jobDescriptionId);
      setJobDescriptions((current) =>
        current.filter((jobDescription) => jobDescription.jobDescriptionId !== response.data.jobDescriptionId),
      );
      updateToast(toastId, { description: response.message, title: "Job description deleted", tone: "success" });
      setDeleteTarget(null);
    } catch (deleteError) {
      const message = getApiErrorMessage(deleteError);
      updateToast(toastId, { description: message, title: "Delete failed", tone: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-surface-in">
      <PageHeader
        description="Save target job postings once, then match any resume against them to see real skill coverage."
        eyebrow="Job descriptions"
        title="Job Descriptions"
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Save a job description</CardTitle>
            <CardDescription>Paste the posting text. Requirements are extracted automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreate}>
              <Input label="Title" onChange={(event) => setTitle(event.target.value)} placeholder="Backend Engineer" value={title} />
              <Input label="Company (optional)" onChange={(event) => setCompany(event.target.value)} placeholder="Acme Corp" value={company} />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200" htmlFor="job-description-text">
                  Job description text
                </label>
                <textarea
                  className="min-h-48 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-50 outline-none transition placeholder:text-slate-500 hover:border-slate-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                  id="job-description-text"
                  onChange={(event) => setRawText(event.target.value)}
                  placeholder="Paste the full job posting here..."
                  value={rawText}
                />
              </div>

              {formError ? (
                <p className="text-sm text-red-400" role="alert">
                  {formError}
                </p>
              ) : null}

              <Button className="w-full" isLoading={isCreating} type="submit">
                Save job description
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading ? (
          <JobDescriptionListSkeleton />
        ) : error && !jobDescriptions.length ? (
          <ErrorState message={error} onRetry={loadJobDescriptions} title="Unable to load job descriptions" />
        ) : jobDescriptions.length ? (
          <Card>
            <CardHeader>
              <CardTitle>Saved job descriptions</CardTitle>
              <CardDescription>{jobDescriptions.length} saved</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobDescriptions.map((jobDescription) => (
                <div
                  className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-800/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                  key={jobDescription.jobDescriptionId}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-50">{jobDescription.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {jobDescription.company ? (
                        <span className="inline-flex items-center gap-1">
                          <Building2 aria-hidden="true" size={13} />
                          {jobDescription.company}
                        </span>
                      ) : null}
                      <span>Saved {formatDate(jobDescription.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={jobDescription.requirementsStatus} />
                    <Button
                      aria-label={`Delete ${jobDescription.title}`}
                      isLoading={deletingId === jobDescription.jobDescriptionId}
                      onClick={() => setDeleteTarget(jobDescription)}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 aria-hidden="true" size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            description="Save a job posting to start matching resumes against it and see real skill coverage."
            icon={Briefcase}
            title="No job descriptions yet"
          />
        )}
      </div>

      <Modal
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button onClick={() => setDeleteTarget(null)} variant="secondary">
              Cancel
            </Button>
            <Button isLoading={Boolean(deletingId)} onClick={handleDelete} variant="danger">
              Delete
            </Button>
          </div>
        }
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete job description"
      >
        <p className="text-sm leading-6 text-slate-400">
          This will delete <span className="font-semibold text-slate-50">{deleteTarget?.title}</span> and its match history will no
          longer be linked to it.
        </p>
      </Modal>
    </div>
  );
}
