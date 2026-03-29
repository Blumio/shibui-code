#!/usr/bin/env python3
"""Merge Cobertura XML reports and emit a simple HTML summary."""

from __future__ import annotations

import argparse
import html
import pathlib
import xml.etree.ElementTree as ET


def _as_int(value: str | None) -> int:
    if value is None or value == "":
        return 0
    return int(float(value))


def _safe_div(numerator: int, denominator: int) -> float:
    return float(numerator) / float(denominator) if denominator > 0 else 0.0


def _load_report(path: pathlib.Path) -> ET.Element:
    tree = ET.parse(path)
    return tree.getroot()


def _collect_sources(root: ET.Element) -> list[str]:
    sources = root.find("sources")
    if sources is None:
        return []

    values: list[str] = []
    for source in sources.findall("source"):
        if source.text:
            values.append(source.text)
    return values


def merge_cobertura(inputs: list[pathlib.Path], output_xml: pathlib.Path, output_html: pathlib.Path) -> None:
    merged_root = ET.Element("coverage", attrib={"version": "merged-by-shibui"})
    merged_sources = ET.SubElement(merged_root, "sources")
    merged_packages = ET.SubElement(merged_root, "packages")

    source_values: set[str] = set()
    lines_covered = 0
    lines_valid = 0
    branches_covered = 0
    branches_valid = 0

    for input_path in inputs:
        root = _load_report(input_path)
        for source in _collect_sources(root):
            source_values.add(source)

        lines_covered += _as_int(root.attrib.get("lines-covered"))
        lines_valid += _as_int(root.attrib.get("lines-valid"))
        branches_covered += _as_int(root.attrib.get("branches-covered"))
        branches_valid += _as_int(root.attrib.get("branches-valid"))

        packages = root.find("packages")
        if packages is None:
            continue

        for package in packages.findall("package"):
            merged_packages.append(package)

    for value in sorted(source_values):
        source_element = ET.SubElement(merged_sources, "source")
        source_element.text = value

    line_rate = _safe_div(lines_covered, lines_valid)
    branch_rate = _safe_div(branches_covered, branches_valid)

    merged_root.attrib["lines-covered"] = str(lines_covered)
    merged_root.attrib["lines-valid"] = str(lines_valid)
    merged_root.attrib["line-rate"] = f"{line_rate:.6f}"
    merged_root.attrib["branches-covered"] = str(branches_covered)
    merged_root.attrib["branches-valid"] = str(branches_valid)
    merged_root.attrib["branch-rate"] = f"{branch_rate:.6f}"

    output_xml.parent.mkdir(parents=True, exist_ok=True)
    ET.ElementTree(merged_root).write(output_xml, encoding="utf-8", xml_declaration=True)

    output_html.parent.mkdir(parents=True, exist_ok=True)
    report_rows = "".join(
        f"<tr><td>{html.escape(path.name)}</td><td>{html.escape(str(path))}</td></tr>"
        for path in inputs
    )
    output_html.write_text(
        """
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Shibui Coverage Merge</title>
    <style>
      body {{ font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; margin: 2rem; }}
      table {{ border-collapse: collapse; width: 100%; margin-top: 1rem; }}
      th, td {{ border: 1px solid #d0d7de; padding: 0.5rem; text-align: left; }}
      th {{ background: #f6f8fa; }}
      .metric {{ font-size: 1.1rem; margin: 0.2rem 0; }}
    </style>
  </head>
  <body>
    <h1>Shibui Unified Coverage</h1>
    <p class="metric">Line coverage: <strong>{line_rate:.2%}</strong> ({lines_covered}/{lines_valid})</p>
    <p class="metric">Branch coverage: <strong>{branch_rate:.2%}</strong> ({branches_covered}/{branches_valid})</p>
    <p>Merged Cobertura report: <code>{xml_path}</code></p>
    <table>
      <thead>
        <tr><th>Report</th><th>Path</th></tr>
      </thead>
      <tbody>{report_rows}</tbody>
    </table>
  </body>
</html>
""".format(
            line_rate=line_rate,
            lines_covered=lines_covered,
            lines_valid=lines_valid,
            branch_rate=branch_rate,
            branches_covered=branches_covered,
            branches_valid=branches_valid,
            xml_path=html.escape(str(output_xml)),
            report_rows=report_rows,
        ),
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-xml", required=True, type=pathlib.Path)
    parser.add_argument("--output-html", required=True, type=pathlib.Path)
    parser.add_argument("inputs", nargs="+", type=pathlib.Path)
    args = parser.parse_args()

    merge_cobertura(args.inputs, args.output_xml, args.output_html)


if __name__ == "__main__":
    main()
