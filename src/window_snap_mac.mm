#import <Cocoa/Cocoa.h>

#include "window_snap.hpp"
#include "window_snap_mac.hpp"

bool SnapNativeMacWindow(void* native_window, const std::string& direction,
                         int& out_width, int& out_height) {
  if (native_window == nullptr || !IsSnapDirection(direction)) {
    return false;
  }

  NSWindow* window = (__bridge NSWindow*)native_window;
  NSScreen* screen = [window screen];
  if (screen == nil) {
    screen = [NSScreen mainScreen];
  }
  if (screen == nil) {
    return false;
  }

  const NSRect visible = [screen visibleFrame];
  const SnapRect visible_frame = {visible.origin.x, visible.origin.y,
                                  visible.size.width, visible.size.height};
  const SnapRect target = ComputeSnapRect(visible_frame, direction);

  NSRect target_frame = NSMakeRect(target.x, target.y, target.width, target.height);
  [NSAnimationContext runAnimationGroup:^(NSAnimationContext* context) {
    context.duration = 0.20;
    [[window animator] setFrame:target_frame display:YES];
  }
      completionHandler:nil];

  out_width = static_cast<int>(target.width);
  out_height = static_cast<int>(target.height);
  return true;
}
