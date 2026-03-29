#include <gmock/gmock.h>
#include <gtest/gtest.h>

#include <shibui/window_snap.hpp>

namespace {

TEST(WindowSnapTest, ValidatesDirections) {
  EXPECT_TRUE(IsSnapDirection("left"));
  EXPECT_TRUE(IsSnapDirection("right"));
  EXPECT_TRUE(IsSnapDirection("up"));
  EXPECT_TRUE(IsSnapDirection("down"));
  EXPECT_FALSE(IsSnapDirection("diagonal"));
}

TEST(WindowSnapTest, ComputesHorizontalRects) {
  const SnapRect visible{10.0, 20.0, 1200.0, 800.0};

  const SnapRect left = ComputeSnapRect(visible, "left");
  const SnapRect right = ComputeSnapRect(visible, "right");

  EXPECT_THAT(left.x, ::testing::DoubleEq(10.0));
  EXPECT_THAT(left.y, ::testing::DoubleEq(20.0));
  EXPECT_THAT(left.width, ::testing::DoubleEq(600.0));
  EXPECT_THAT(left.height, ::testing::DoubleEq(800.0));

  EXPECT_THAT(right.x, ::testing::DoubleEq(610.0));
  EXPECT_THAT(right.y, ::testing::DoubleEq(20.0));
  EXPECT_THAT(right.width, ::testing::DoubleEq(600.0));
  EXPECT_THAT(right.height, ::testing::DoubleEq(800.0));
}

TEST(WindowSnapTest, ComputesVerticalRects) {
  const SnapRect visible{0.0, 0.0, 1600.0, 1000.0};

  const SnapRect top = ComputeSnapRect(visible, "up");
  const SnapRect bottom = ComputeSnapRect(visible, "down");

  EXPECT_THAT(top.x, ::testing::DoubleEq(0.0));
  EXPECT_THAT(top.y, ::testing::DoubleEq(500.0));
  EXPECT_THAT(top.width, ::testing::DoubleEq(1600.0));
  EXPECT_THAT(top.height, ::testing::DoubleEq(500.0));

  EXPECT_THAT(bottom.x, ::testing::DoubleEq(0.0));
  EXPECT_THAT(bottom.y, ::testing::DoubleEq(0.0));
  EXPECT_THAT(bottom.width, ::testing::DoubleEq(1600.0));
  EXPECT_THAT(bottom.height, ::testing::DoubleEq(500.0));
}

}  // namespace
