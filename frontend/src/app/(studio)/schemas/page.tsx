import { SchemaCatalog } from "@/components/schemas/schema-catalog";
import { PageHeader } from "@/components/shared/page-header";

export default function SchemasPage() {
  return (
    <>
      <PageHeader
        title="Schemas"
        description="Explore field definitions, validation rules, and extraction capabilities per workflow type."
      />

      <SchemaCatalog />
    </>
  );
}
