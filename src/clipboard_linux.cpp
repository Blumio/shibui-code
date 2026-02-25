#include "clipboard.hpp"

#include <gtk/gtk.h>

bool Clipboard::Copy(const std::string& text) noexcept {
  if (gtk_init_check(nullptr, nullptr) == FALSE) {
    return false;
  }

  GtkClipboard* clipboard = gtk_clipboard_get(GDK_SELECTION_CLIPBOARD);
  if (clipboard == nullptr) {
    return false;
  }

  gtk_clipboard_set_text(clipboard, text.c_str(), static_cast<gint>(text.size()));
  gtk_clipboard_store(clipboard);
  while (g_main_context_iteration(nullptr, FALSE) != FALSE) {
  }

  return true;
}
