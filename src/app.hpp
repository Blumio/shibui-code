#ifndef SHIBUI_CODE_APP_HPP
#define SHIBUI_CODE_APP_HPP

#include <string>

#if __has_include(<webview/webview.h>)
#include <webview/webview.h>
#elif __has_include(<webview.h>)
#include <webview.h>
#else
#error "webview header not found"
#endif

#include "clipboard.hpp"

class App {
 public:
  App();
  int Run();

 private:
  void BindNativeApi();
  void ResizeWindow(const std::string& direction);

  webview::webview window_;
  Clipboard clipboard_;
  std::string latest_snapshot_;
  int window_width_ = 1280;
  int window_height_ = 820;
};

#endif
