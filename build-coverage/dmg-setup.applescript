tell application "Finder"
  tell disk "Shibui-Code 1.0.0"
    open
    set current view of container window to icon view
    set toolbar visible of container window to false
    set statusbar visible of container window to false
    set bounds of container window to {120, 120, 780, 540}

    set viewOptions to the icon view options of container window
    set arrangement of viewOptions to not arranged
    set icon size of viewOptions to 128
    set text size of viewOptions to 14
    set background picture of viewOptions to file ".background:background.png"

    set position of item "shibui-code.app" to {180, 230}
    set position of item "Applications" to {480, 230}

    close
    open
    delay 2
  end tell
end tell
