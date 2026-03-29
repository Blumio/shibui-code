#include <shibui/window_snap.hpp>

bool IsSnapDirection(std::string_view direction) {
  return direction == "left" || direction == "right" || direction == "up" ||
         direction == "down";
}

SnapRect ComputeSnapRect(const SnapRect& visible_frame,
                         std::string_view direction) {
  if (!IsSnapDirection(direction)) {
    return visible_frame;
  }

  SnapRect target = visible_frame;
  if (direction == "left" || direction == "right") {
    target.width = visible_frame.width / 2.0;
    if (direction == "right") {
      target.x = visible_frame.x + visible_frame.width - target.width;
    }
  } else {
    target.height = visible_frame.height / 2.0;
    if (direction == "up") {
      target.y = visible_frame.y + visible_frame.height - target.height;
    }
  }

  return target;
}
