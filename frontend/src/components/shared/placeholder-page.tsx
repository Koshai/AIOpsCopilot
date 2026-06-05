import { PageHeader } from "@/components/shared/page-header";
import { PlaceholderPanel } from "@/components/shared/placeholder-panel";

type PlaceholderPageProps = {
  title: string;
  description: string;
  panelTitle?: string;
  panelDescription?: string;
};

export function PlaceholderPage({
  title,
  description,
  panelTitle = "Coming soon",
  panelDescription = "This view will connect to the platform API in a future iteration.",
}: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <PlaceholderPanel title={panelTitle} description={panelDescription} />
    </>
  );
}
