#include <shibui/bridge_contract.hpp>

#include <cctype>

namespace shibui {
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

std::string ParseJsonString(std::string_view input, std::size_t start_index,
                            bool* out_complete) {
  std::string output;
  std::size_t index = start_index;

  while (index < input.size()) {
    const char current = input[index];
    if (current == '"') {
      if (out_complete != nullptr) {
        *out_complete = true;
      }
      return output;
    }

    if (current == '\\' && index + 1 < input.size()) {
      const char escaped = input[index + 1];
      switch (escaped) {
        case '"':
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
          if (index + 5 < input.size()) {
            output.push_back('\\');
            output.push_back('u');
            output.push_back(input[index + 2]);
            output.push_back(input[index + 3]);
            output.push_back(input[index + 4]);
            output.push_back(input[index + 5]);
            index += 4;
          } else {
            output.push_back('u');
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

  if (out_complete != nullptr) {
    *out_complete = false;
  }
  return output;
}

BridgeOperation ParseOperation(std::string_view operation_name,
                               bool* out_supported) {
  if (operation_name == "sync_snapshot") {
    if (out_supported != nullptr) {
      *out_supported = true;
    }
    return BridgeOperation::kSyncSnapshot;
  }

  if (operation_name == "clear_snapshot") {
    if (out_supported != nullptr) {
      *out_supported = true;
    }
    return BridgeOperation::kClearSnapshot;
  }

  if (operation_name == "resize_window") {
    if (out_supported != nullptr) {
      *out_supported = true;
    }
    return BridgeOperation::kResizeWindow;
  }

  if (operation_name == "copy_text") {
    if (out_supported != nullptr) {
      *out_supported = true;
    }
    return BridgeOperation::kCopyText;
  }

  if (operation_name == "paste_text") {
    if (out_supported != nullptr) {
      *out_supported = true;
    }
    return BridgeOperation::kPasteText;
  }

  if (out_supported != nullptr) {
    *out_supported = false;
  }
  return BridgeOperation::kClearSnapshot;
}

bool RequiresPayload(BridgeOperation operation) {
  return operation == BridgeOperation::kSyncSnapshot ||
         operation == BridgeOperation::kResizeWindow ||
         operation == BridgeOperation::kCopyText;
}

bool DecodeRequestPayload(std::string_view raw_request, std::string* out_payload) {
  const std::string trimmed = Trim(raw_request);
  if (trimmed.empty()) {
    *out_payload = "";
    return true;
  }

  if (trimmed.front() == '[') {
    std::size_t index = 1;
    while (index < trimmed.size() &&
           std::isspace(static_cast<unsigned char>(trimmed[index])) != 0) {
      ++index;
    }

    if (index >= trimmed.size() || trimmed[index] == ']') {
      *out_payload = "";
      return true;
    }

    if (trimmed[index] == '"') {
      bool complete = false;
      *out_payload = ParseJsonString(trimmed, index + 1, &complete);
      return complete;
    }

    const std::size_t end = trimmed.find_first_of(",]", index);
    if (end == std::string::npos) {
      return false;
    }

    *out_payload = Trim(std::string_view(trimmed).substr(index, end - index));
    return true;
  }

  if (trimmed.front() == '"') {
    bool complete = false;
    *out_payload = ParseJsonString(trimmed, 1, &complete);
    return complete;
  }

  *out_payload = trimmed;
  return true;
}

}  // namespace

bool IsBridgeDirection(std::string_view direction) {
  return direction == "up" || direction == "down" || direction == "left" ||
         direction == "right";
}

BridgeParseResult ParseBridgeCommand(std::string_view operation_name,
                                     std::string_view raw_request) {
  BridgeParseResult result;
  bool supported = false;
  result.command.operation = ParseOperation(operation_name, &supported);

  if (!supported) {
    result.error = BridgeErrorCode::kUnsupportedOperation;
    return result;
  }

  std::string payload;
  if (!DecodeRequestPayload(raw_request, &payload)) {
    result.error = BridgeErrorCode::kInvalidPayload;
    return result;
  }

  if (RequiresPayload(result.command.operation) && payload.empty()) {
    result.error = BridgeErrorCode::kInvalidPayload;
    return result;
  }

  if (result.command.operation == BridgeOperation::kResizeWindow &&
      !IsBridgeDirection(payload)) {
    result.error = BridgeErrorCode::kInvalidDirection;
    return result;
  }

  result.ok = true;
  result.command.payload = std::move(payload);
  result.error = BridgeErrorCode::kNone;
  return result;
}

}  // namespace shibui
