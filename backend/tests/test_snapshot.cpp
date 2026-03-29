#include <gmock/gmock.h>
#include <gtest/gtest.h>

#include <shibui/snapshot.hpp>

namespace {

TEST(SnapshotTest, NormalizesLineEndings) {
  const std::string input = "line1\r\nline2\rline3\n";
  const std::string expected = "line1\nline2\nline3";
  EXPECT_THAT(NormalizeSnapshotPayload(input), ::testing::Eq(expected));
}

TEST(SnapshotTest, StripsNulBytes) {
  const std::string input = std::string("abc\0def", 7);
  EXPECT_THAT(NormalizeSnapshotPayload(input), ::testing::Eq("abcdef"));
}

TEST(SnapshotTest, UsesFallbackForEmptyContent) {
  const std::string input = "\r\n\t  \n";
  EXPECT_THAT(NormalizeSnapshotPayload(input),
              ::testing::Eq("Shibui-Code session\n\n(no content)"));
}

}  // namespace
