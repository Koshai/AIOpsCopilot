import { DocumentLibrary } from "@/components/documents/document-library";
import { PageHeader } from "@/components/shared/page-header";

export default function DocumentsPage() {
  return (
    <>
      <PageHeader
        title="Documents"
        description="Manage uploaded files, ingestion status, and document scope for workflow runs."
      />

      <DocumentLibrary />
    </>
  );
}
