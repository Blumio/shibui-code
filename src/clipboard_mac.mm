#include "clipboard.hpp"

#import <Cocoa/Cocoa.h>

bool Clipboard::Copy(const std::string& text) noexcept {
  @autoreleasepool {
    NSPasteboard* pasteboard = [NSPasteboard generalPasteboard];
    [pasteboard clearContents];

    NSString* content = [[NSString alloc] initWithBytes:text.data()
                                                 length:text.size()
                                               encoding:NSUTF8StringEncoding];
    if (content == nil) {
      return false;
    }

    const BOOL success = [pasteboard setString:content forType:NSPasteboardTypeString];
    return success == YES;
  }
}
