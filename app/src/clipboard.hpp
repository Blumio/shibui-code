#ifndef SHIBUI_CODE_CLIPBOARD_HPP
#define SHIBUI_CODE_CLIPBOARD_HPP

#include <string>

class Clipboard {
 public:
  [[nodiscard]] bool Copy(const std::string& text) noexcept;
  [[nodiscard]] std::string Read() const noexcept;
};

#endif
