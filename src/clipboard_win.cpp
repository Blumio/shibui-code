#include "clipboard.hpp"

#include <windows.h>

#include <cstring>
#include <string>

namespace {

std::wstring Utf8ToWide(const std::string& input) {
  if (input.empty()) {
    return L"";
  }

  const int required = MultiByteToWideChar(CP_UTF8, 0, input.c_str(), -1, nullptr, 0);
  if (required == 0) {
    return L"";
  }

  std::wstring output(static_cast<std::size_t>(required), L'\0');
  const int converted = MultiByteToWideChar(CP_UTF8, 0, input.c_str(), -1, output.data(), required);
  if (converted == 0) {
    return L"";
  }

  if (!output.empty() && output.back() == L'\0') {
    output.pop_back();
  }

  return output;
}

}  // namespace

bool Clipboard::Copy(const std::string& text) noexcept {
  const std::wstring wide = Utf8ToWide(text);
  if (!OpenClipboard(nullptr)) {
    return false;
  }

  EmptyClipboard();

  const std::size_t bytes = (wide.size() + 1) * sizeof(wchar_t);
  HGLOBAL global = GlobalAlloc(GMEM_MOVEABLE, bytes);
  if (global == nullptr) {
    CloseClipboard();
    return false;
  }

  void* destination = GlobalLock(global);
  if (destination == nullptr) {
    GlobalFree(global);
    CloseClipboard();
    return false;
  }

  memcpy(destination, wide.c_str(), bytes);
  GlobalUnlock(global);

  if (SetClipboardData(CF_UNICODETEXT, global) == nullptr) {
    GlobalFree(global);
    CloseClipboard();
    return false;
  }

  CloseClipboard();
  return true;
}
