"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ClipboardCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { ReviewTable } from "@/components/reviews/review-table";
import { Button } from "@/components/ui/button";
import { reviewsApi } from "@/services/api";
import type { ReviewItem } from "@/types/api";

export function ReviewQueue() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await reviewsApi.listPending();
      setReviews(data.pending_approvals);
    } catch (err) {
      setReviews([]);
      setError(
        err instanceof Error ? err.message : "Failed to load review queue"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const handleApprove = useCallback(
    async (item: ReviewItem) => {
      setPendingThreadId(item.thread_id);

      try {
        await reviewsApi.approve(item.thread_id);
        toast.success("Review approved", {
          description: `${item.document_name ?? "Workflow"} will continue processing.`,
        });
        await loadReviews();
      } catch (err) {
        toast.error("Approval failed", {
          description:
            err instanceof Error ? err.message : "Could not approve this review.",
        });
      } finally {
        setPendingThreadId(null);
      }
    },
    [loadReviews]
  );

  const handleReject = useCallback(
    async (item: ReviewItem) => {
      setPendingThreadId(item.thread_id);

      try {
        await reviewsApi.reject(item.thread_id);
        toast.success("Review rejected", {
          description: `${item.document_name ?? "Workflow"} was marked as rejected.`,
        });
        await loadReviews();
      } catch (err) {
        toast.error("Rejection failed", {
          description:
            err instanceof Error ? err.message : "Could not reject this review.",
        });
      } finally {
        setPendingThreadId(null);
      }
    },
    [loadReviews]
  );

  const toolbar = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {loading ? (
          "Loading review queue..."
        ) : (
          <>
            <span className="font-medium text-foreground">{reviews.length}</span>{" "}
            pending review{reviews.length === 1 ? "" : "s"}
          </>
        )}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => void loadReviews()}
        disabled={loading || !!pendingThreadId}
      >
        <RefreshCw className="size-4" />
        Refresh
      </Button>
    </div>
  );

  if (error) {
    return (
      <div className="space-y-6">
        {toolbar}
        <div
          role="alert"
          className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <AlertCircle className="size-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Could not load review queue
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadReviews()}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!loading && reviews.length === 0) {
    return (
      <div className="space-y-6">
        {toolbar}
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
            <ClipboardCheck className="size-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            No pending reviews
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Workflows that require human approval will appear here when they
            pause for review.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toolbar}
      <ReviewTable
        reviews={reviews}
        loading={loading}
        pendingThreadId={pendingThreadId}
        onApprove={(item) => void handleApprove(item)}
        onReject={(item) => void handleReject(item)}
      />
    </div>
  );
}
