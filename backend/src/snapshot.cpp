#include <shibui/snapshot.hpp>

#include <cctype>

namespace {

std::string NormalizeLineEndings(const std::string& input) {
  std::string output;
  output.reserve(input.size());

  for (std::size_t i = 0; i < input.size(); ++i) {
    if (input[i] == '\r') {
      if (i + 1 < input.size() && input[i + 1] == '\n') {
        continue;
      }
      output.push_back('\n');
      continue;
    }
    output.push_back(input[i]);
  }

  return output;
}

std::string TrimTrailingWhitespace(const std::string& input) {
  std::size_t end = input.size();
  while (end > 0 && std::isspace(static_cast<unsigned char>(input[end - 1])) != 0) {
    --end;
  }
  return input.substr(0, end);
}

std::string StripNulBytes(const std::string& input) {
  std::string output;
  output.reserve(input.size());

  for (const char ch : input) {
    if (ch != '\0') {
      output.push_back(ch);
    }
  }

  return output;
}

}  // namespace

std::string NormalizeSnapshotPayload(const std::string& payload) {
  const std::string without_nul = StripNulBytes(payload);
  const std::string with_unix_lines = NormalizeLineEndings(without_nul);
  const std::string trimmed = TrimTrailingWhitespace(with_unix_lines);

  if (trimmed.empty()) {
    return "Shibui-Code session\n\n(no content)";
  }

  return trimmed;
}
