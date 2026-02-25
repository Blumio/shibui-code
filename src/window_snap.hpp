#ifndef SHIBUI_CODE_WINDOW_SNAP_HPP
#define SHIBUI_CODE_WINDOW_SNAP_HPP

#include <string_view>

struct SnapRect {
  double x = 0.0;
  double y = 0.0;
  double width = 0.0;
  double height = 0.0;
};

bool IsSnapDirection(std::string_view direction);
SnapRect ComputeSnapRect(const SnapRect& visible_frame, std::string_view direction);

#endif
