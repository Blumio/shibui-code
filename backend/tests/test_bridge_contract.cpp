#include <gmock/gmock.h>
#include <gtest/gtest.h>

#include <shibui/bridge_contract.hpp>

namespace {

TEST(BridgeContractTest, RejectsUnknownOperations) {
  const shibui::BridgeParseResult parsed =
      shibui::ParseBridgeCommand("launch_missiles", "[]");

  EXPECT_FALSE(parsed.ok);
  EXPECT_THAT(parsed.error,
              ::testing::Eq(shibui::BridgeErrorCode::kUnsupportedOperation));
}

TEST(BridgeContractTest, ParsesEscapedPayload) {
  const shibui::BridgeParseResult parsed = shibui::ParseBridgeCommand(
      "sync_snapshot", "[\"line1\\nline2\\tline3\"]");

  EXPECT_TRUE(parsed.ok);
  EXPECT_THAT(parsed.command.operation,
              ::testing::Eq(shibui::BridgeOperation::kSyncSnapshot));
  EXPECT_THAT(parsed.command.payload, ::testing::Eq("line1\nline2\tline3"));
}

TEST(BridgeContractTest, RejectsInvalidResizeDirection) {
  const shibui::BridgeParseResult parsed =
      shibui::ParseBridgeCommand("resize_window", "[\"diagonal\"]");

  EXPECT_FALSE(parsed.ok);
  EXPECT_THAT(parsed.error,
              ::testing::Eq(shibui::BridgeErrorCode::kInvalidDirection));
}

TEST(BridgeContractTest, AcceptsClearWithoutPayload) {
  const shibui::BridgeParseResult parsed =
      shibui::ParseBridgeCommand("clear_snapshot", "[]");

  EXPECT_TRUE(parsed.ok);
  EXPECT_THAT(parsed.command.operation,
              ::testing::Eq(shibui::BridgeOperation::kClearSnapshot));
  EXPECT_THAT(parsed.command.payload, ::testing::Eq(""));
}

TEST(BridgeContractTest, AcceptsPasteWithoutPayload) {
  const shibui::BridgeParseResult parsed =
      shibui::ParseBridgeCommand("paste_text", "[]");

  EXPECT_TRUE(parsed.ok);
  EXPECT_THAT(parsed.command.operation,
              ::testing::Eq(shibui::BridgeOperation::kPasteText));
  EXPECT_THAT(parsed.command.payload, ::testing::Eq(""));
}

TEST(BridgeContractTest, RejectsMalformedStringPayload) {
  const shibui::BridgeParseResult parsed =
      shibui::ParseBridgeCommand("copy_text", "[\"unterminated]");

  EXPECT_FALSE(parsed.ok);
  EXPECT_THAT(parsed.error,
              ::testing::Eq(shibui::BridgeErrorCode::kInvalidPayload));
}

}  // namespace
