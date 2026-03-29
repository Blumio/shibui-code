#include "app.hpp"

#include <algorithm>
#include <exception>
#include <string_view>

#include <shibui/bridge_contract.hpp>
#include <shibui/snapshot.hpp>
#include <shibui/window_snap.hpp>

#include "frontend_bundle.hpp"
#include "window_snap_mac.hpp"

namespace {

std::string JsonStringLiteral(std::string_view input) {
  std::string output;
  output.reserve(input.size() + 2);
  output.push_back('"');

  constexpr char kHexDigits[] = "0123456789abcdef";
  for (const unsigned char current : input) {
    switch (current) {
      case '"':
        output.append("\\\"");
        break;
      case '\\':
        output.append("\\\\");
        break;
      case '\b':
        output.append("\\b");
        break;
      case '\f':
        output.append("\\f");
        break;
      case '\n':
        output.append("\\n");
        break;
      case '\r':
        output.append("\\r");
        break;
      case '\t':
        output.append("\\t");
        break;
      default:
        if (current < 0x20) {
          output.append("\\u00");
          output.push_back(kHexDigits[(current >> 4) & 0x0F]);
          output.push_back(kHexDigits[current & 0x0F]);
          break;
        }

        output.push_back(static_cast<char>(current));
        break;
    }
  }

  output.push_back('"');
  return output;
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
    const shibui::BridgeParseResult parsed =
        shibui::ParseBridgeCommand("sync_snapshot", req);
    if (!parsed.ok) {
      return std::string("false");
    }

    latest_snapshot_ = NormalizeSnapshotPayload(parsed.command.payload);
    return std::string("true");
  });

  window_.bind("clear_snapshot", [this](const std::string& req) {
    const shibui::BridgeParseResult parsed =
        shibui::ParseBridgeCommand("clear_snapshot", req);
    if (!parsed.ok) {
      return std::string("false");
    }

    latest_snapshot_.clear();
    return std::string("true");
  });

  window_.bind("resize_window", [this](const std::string& req) {
    const shibui::BridgeParseResult parsed =
        shibui::ParseBridgeCommand("resize_window", req);
    if (!parsed.ok) {
      return std::string("false");
    }

    ResizeWindow(parsed.command.payload);
    return std::string("true");
  });

  window_.bind("copy_text", [this](const std::string& req) {
    const shibui::BridgeParseResult parsed =
        shibui::ParseBridgeCommand("copy_text", req);
    if (!parsed.ok) {
      return std::string("false");
    }

    const bool copied = clipboard_.Copy(parsed.command.payload);
    return copied ? std::string("true") : std::string("false");
  });

  window_.bind("paste_text", [this](const std::string& req) {
    const shibui::BridgeParseResult parsed =
        shibui::ParseBridgeCommand("paste_text", req);
    if (!parsed.ok) {
      return std::string("null");
    }

    return JsonStringLiteral(clipboard_.Read());
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
