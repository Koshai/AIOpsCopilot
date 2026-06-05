from app.extraction.resume_helpers import infer_education_from_context


def test_infer_education_from_context_finds_section():
    context = """
Skills
Unity, C#, Python

Education
MS, Software Engineering | 2012 | Stevens Institute of Technology
BE, Engineering Management | 2010 | Stevens Institute of Technology

Clearance: Secret
"""
    result = infer_education_from_context(context)
    assert result is not None
    assert "Stevens Institute of Technology" in result
    assert "Software Engineering" in result


def test_infer_education_ignores_inline_word_match():
    context = """
Design of an educational consultancy company website.
Education
MS, Software Engineering | 2012 | Stevens Institute of Technology
Skills
Unity
"""
    result = infer_education_from_context(context)
    assert result is not None
    assert "Stevens Institute of Technology" in result
    assert "consultancy" not in result


def test_is_missing_treats_literal_null_string_as_missing():
    from app.extraction.validation import ExtractionValidationService

    assert ExtractionValidationService._is_missing("null") is True
    assert ExtractionValidationService._is_missing("N/A") is True
    assert ExtractionValidationService._is_missing("MS, Computer Science") is False
    assert infer_education_from_context("No degrees listed here.") is None
