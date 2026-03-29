#include "app.hpp"

#include <algorithm>
#include <cctype>
#include <exception>
#include <string_view>

#include "frontend_bundle.hpp"
#include "snapshot.hpp"
#include "window_snap.hpp"
#include "window_snap_mac.hpp"

namespace {

std::string Trim(std::string_view input) {
  std::size_t start = 0;
  while (start < input.size() &&
         std::isspace(static_cast<unsigned char>(input[start])) != 0) {
    ++start;
  }

  std::size_t end = input.size();
  while (end > start &&
         std::isspace(static_cast<unsigned char>(input[end - 1])) != 0) {
    --end;
  }

  return std::string(input.substr(start, end - start));
}

std::string ParseJsonString(std::string_view input, std::size_t start_index) {
  std::string output;
  std::size_t index = start_index;

  while (index < input.size()) {
    const char current = input[index];
    if (current == '\"') {
      return output;
    }

    if (current == '\\' && index + 1 < input.size()) {
      const char escaped = input[index + 1];
      switch (escaped) {
        case '\"':
        case '\\':
        case '/':
          output.push_back(escaped);
          break;
        case 'b':
          output.push_back('\b');
          break;
        case 'f':
          output.push_back('\f');
          break;
        case 'n':
          output.push_back('\n');
          break;
        case 'r':
          output.push_back('\r');
          break;
        case 't':
          output.push_back('\t');
          break;
        case 'u':
          // Keep unicode escape as-is if present. Snapshot normalization can
          // still process content safely even without decoding the code point.
          if (index + 5 < input.size()) {
            output.push_back('\\');
            output.push_back('u');
            output.push_back(input[index + 2]);
            output.push_back(input[index + 3]);
            output.push_back(input[index + 4]);
            output.push_back(input[index + 5]);
            index += 4;
          }
          break;
        default:
          output.push_back(escaped);
          break;
      }
      index += 2;
      continue;
    }

    output.push_back(current);
    ++index;
  }

  return output;
}

std::string DecodeBoundRequestPayload(const std::string& req) {
  const std::string trimmed = Trim(req);
  if (trimmed.empty()) {
    return "";
  }

  if (trimmed.front() == '[') {
    std::size_t index = 1;
    while (index < trimmed.size() &&
           std::isspace(static_cast<unsigned char>(trimmed[index])) != 0) {
      ++index;
    }

    if (index < trimmed.size() && trimmed[index] == '\"') {
      return ParseJsonString(trimmed, index + 1);
    }

    const std::size_t end = trimmed.find_first_of(",]", index);
    if (end == std::string::npos) {
      return Trim(std::string_view(trimmed).substr(index));
    }
    return Trim(std::string_view(trimmed).substr(index, end - index));
  }

  if (trimmed.front() == '\"') {
    return ParseJsonString(trimmed, 1);
  }

  return trimmed;
}

}  // namespace

App::App() : window_(true, nullptr) {
  window_.set_title("Shibui-Code");
  window_.set_size(window_width_, window_height_, WEBVIEW_HINT_NONE);
  BindNativeApi();
  window_.set_html(kFrontendBundleHtml);
}

void App::BindNativeApi() {
  window_.bind("sync_snapshot", [this](const std::string& req) {
    latest_snapshot_ = NormalizeSnapshotPayload(DecodeBoundRequestPayload(req));
    return std::string("true");
  });

  window_.bind("clear_snapshot", [this](const std::string&) {
    latest_snapshot_.clear();
    return std::string("true");
  });

  window_.bind("resize_window", [this](const std::string& req) {
    ResizeWindow(DecodeBoundRequestPayload(req));
    return std::string("true");
  });

  window_.bind("copy_text", [this](const std::string& req) {
    const bool copied = clipboard_.Copy(DecodeBoundRequestPayload(req));
    return copied ? std::string("true") : std::string("false");
  });
}

int App::Run() {
  try {
    window_.run();
  } catch (const std::exception&) {
    return 1;
  }

  if (!latest_snapshot_.empty()) {
    const bool copied = clipboard_.Copy(latest_snapshot_);
    if (!copied) {
      return 2;
    }
  }

  latest_snapshot_.clear();
  return 0;
}

void App::ResizeWindow(const std::string& direction) {
  if (!IsSnapDirection(direction)) {
    return;
  }

  auto native_window = window_.window();
  if (native_window.has_value()) {
    if (SnapNativeMacWindow(native_window.value(), direction, window_width_,
                            window_height_)) {
      return;
    }
  }

  constexpr int kStep = 90;
  constexpr int kMinWidth = 780;
  constexpr int kMinHeight = 520;

  if (direction == "up") {
    window_height_ += kStep;
  } else if (direction == "down") {
    window_height_ = std::max(kMinHeight, window_height_ - kStep);
  } else if (direction == "left") {
    window_width_ = std::max(kMinWidth, window_width_ - kStep);
  } else {
    window_width_ += kStep;
  }

  window_.set_size(window_width_, window_height_, WEBVIEW_HINT_NONE);
}
