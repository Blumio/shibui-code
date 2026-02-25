#ifndef SHIBUI_CODE_WINDOW_SNAP_MAC_HPP
#define SHIBUI_CODE_WINDOW_SNAP_MAC_HPP

#include <string>

bool SnapNativeMacWindow(void* native_window, const std::string& direction,
                         int& out_width, int& out_height);

#endif
