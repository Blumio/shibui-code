#include "window_snap.hpp"

#include <cassert>

static void TestSnapDirectionValidation() {
  assert(IsSnapDirection("left"));
  assert(IsSnapDirection("right"));
  assert(IsSnapDirection("up"));
  assert(IsSnapDirection("down"));
  assert(!IsSnapDirection("diagonal"));
}

static void TestHorizontalSnapRects() {
  const SnapRect visible{10.0, 20.0, 1200.0, 800.0};
  const SnapRect left = ComputeSnapRect(visible, "left");
  const SnapRect right = ComputeSnapRect(visible, "right");

  assert(left.x == 10.0);
  assert(left.y == 20.0);
  assert(left.width == 600.0);
  assert(left.height == 800.0);

  assert(right.x == 610.0);
  assert(right.y == 20.0);
  assert(right.width == 600.0);
  assert(right.height == 800.0);
}

static void TestVerticalSnapRects() {
  const SnapRect visible{0.0, 0.0, 1600.0, 1000.0};
  const SnapRect top = ComputeSnapRect(visible, "up");
  const SnapRect bottom = ComputeSnapRect(visible, "down");

  assert(top.x == 0.0);
  assert(top.y == 500.0);
  assert(top.width == 1600.0);
  assert(top.height == 500.0);

  assert(bottom.x == 0.0);
  assert(bottom.y == 0.0);
  assert(bottom.width == 1600.0);
  assert(bottom.height == 500.0);
}

void RunWindowSnapTests() {
  TestSnapDirectionValidation();
  TestHorizontalSnapRects();
  TestVerticalSnapRects();
}
