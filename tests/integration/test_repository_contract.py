import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent.parent


def test_required_top_level_files_exist() -> None:
    required = [
        "README.md",
        "LICENSE",
        "package.json",
        "CMakeLists.txt",
        "CMakePresets.json",
        "backend/CMakeLists.txt",
        "backend/src/snapshot.cpp",
        "backend/include/shibui/snapshot.hpp",
        "app/CMakeLists.txt",
        "app/src/main.cpp",
        "frontend/src/main.ts",
        "frontend/playwright.config.ts",
        "cli/shibui-code.js",
        ".github/workflows/ci.yml",
        ".github/pull_request_template.md",
        "docs/release-checklist.md",
    ]

    for relative in required:
        assert (ROOT / relative).exists(), f"missing file: {relative}"


def test_readme_contains_core_reference_sections() -> None:
    content = (ROOT / "README.md").read_text(encoding="utf8") if (ROOT / "README.md").exists() else ""

    assert "Why this exists" in content
    assert "Who it is for" in content
    assert "npm install -g shibui-code" in content
    assert "Hello world in 30 seconds" in content
    assert "Architecture and design choices" in content
    assert "Tradeoffs and limitations" in content
    assert "Roadmap" in content
    assert "Security and contribution" in content
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


def test_package_json_metadata_is_publish_ready() -> None:
    package_data = json.loads((ROOT / "package.json").read_text(encoding="utf8"))

    assert package_data["name"] == "shibui-code"
    assert isinstance(package_data["version"], str) and package_data["version"].count(".") == 2
    assert package_data["license"] == "MIT"
    assert package_data["repository"]["url"].startswith("git+https://github.com/")
    assert package_data["homepage"].startswith("https://github.com/")
    assert package_data["bugs"]["url"].startswith("https://github.com/")
    assert package_data["bin"]["shibui-code"] == "cli/shibui-code.js"
    assert package_data["main"] == "./cli/shibui-code.js"
    assert package_data["publishConfig"]["access"] == "public"
    assert package_data["publishConfig"]["provenance"] is True


def test_package_publish_whitelist_excludes_internal_content() -> None:
    package_data = json.loads((ROOT / "package.json").read_text(encoding="utf8"))
    files = package_data["files"]

    assert "tests" not in files
    assert "frontend" not in files
    assert "scripts" not in files
    assert "LICENSE" in files


def test_codeql_uses_source_analysis_without_generated_bundle() -> None:
    workflow = (ROOT / ".github/workflows/codeql.yml").read_text(encoding="utf8")
    codeql_config = ROOT / ".github/codeql/codeql-config.yml"
    assert codeql_config.exists()
    config = codeql_config.read_text(encoding="utf8")
    gitignore = (ROOT / ".gitignore").read_text(encoding="utf8")

    assert "github/codeql-action/init@v4" in workflow
    assert "github/codeql-action/analyze@v4" in workflow
    assert "build-mode: ${{ matrix.build-mode }}" in workflow
    assert "cmake --preset ci" not in workflow
    assert "cmake --build --preset ci" not in workflow
    assert "app/generated/**" in config
    assert "build/**" in config
    assert "build-coverage/**" in config
    assert ".native-build/**" in config
    assert "app/generated/frontend_bundle.hpp" in gitignore
