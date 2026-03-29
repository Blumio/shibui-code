#ifndef SHIBUI_CODE_BRIDGE_CONTRACT_HPP
#define SHIBUI_CODE_BRIDGE_CONTRACT_HPP

#include <string>
#include <string_view>

namespace shibui {

enum class BridgeOperation {
  kSyncSnapshot,
  kClearSnapshot,
  kResizeWindow,
  kCopyText,
  kPasteText,
};

enum class BridgeErrorCode {
  kNone,
  kUnsupportedOperation,
  kInvalidPayload,
  kInvalidDirection,
};

struct BridgeCommand {
  BridgeOperation operation = BridgeOperation::kClearSnapshot;
  std::string payload;
};

struct BridgeParseResult {
  bool ok = false;
  BridgeCommand command;
  BridgeErrorCode error = BridgeErrorCode::kNone;
};

BridgeParseResult ParseBridgeCommand(std::string_view operation_name,
                                     std::string_view raw_request);

bool IsBridgeDirection(std::string_view direction);

}  // namespace shibui

#endif
