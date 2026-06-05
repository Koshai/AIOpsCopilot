import { ReviewQueue } from "@/components/reviews/review-queue";
import { PageHeader } from "@/components/shared/page-header";

export default function ReviewsPage() {
  return (
    <>
      <PageHeader
        title="Reviews"
        description="Human-in-the-loop queue for workflows that require approval before completion."
      />

      <ReviewQueue />
    </>
  );
}
