from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def test_required_top_level_files_exist() -> None:
    required = [
      "README.md",
      "package.json",
      "CMakeLists.txt",
      "src/main.cpp",
      "frontend/src/main.ts",
      "cli/shibui-code.js",
      ".github/workflows/ci.yml",
    ]

    for relative in required:
        assert (ROOT / relative).exists(), f"missing file: {relative}"


def test_readme_contains_install_and_usage_sections() -> None:
    content = (ROOT / "README.md").read_text(encoding="utf8") if (ROOT / "README.md").exists() else ""

    assert "npm install -g shibui-code" in content
    assert "shibui-code" in content
    assert "Packaging" in content


def test_language_list_contains_required_languages() -> None:
    language_source = (ROOT / "frontend/src/language.ts").read_text(encoding="utf8")
    required_ids = [
      "python",
      "javascript",
      "typescript",
      "cpp",
      "c",
      "rust",
      "java",
      "go",
      "html",
      "css",
      "json",
      "bash",
      "markdown",
    ]

    for language_id in required_ids:
        assert f'"{language_id}"' in language_source
