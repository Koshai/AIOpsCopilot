from app.extraction.schema_registry import SchemaRegistry


def test_available_schema_count():
    assert len(SchemaRegistry.list_types()) >= 2
    assert "invoice" in SchemaRegistry.list_types()
    assert "resume" in SchemaRegistry.list_types()
