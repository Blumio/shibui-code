cmake_minimum_required(VERSION 3.24)
project(ShibuiCode VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

option(SHIBUI_BUILD_TESTS "Build unit tests" ON)

if(NOT EXISTS "${CMAKE_SOURCE_DIR}/src/frontend_bundle.hpp")
  message(FATAL_ERROR "src/frontend_bundle.hpp is missing. Run: npm run build:frontend")
endif()

include(FetchContent)

FetchContent_Declare(
  webview
  GIT_REPOSITORY https://github.com/webview/webview.git
  GIT_TAG 0.12.0
)
FetchContent_MakeAvailable(webview)

set(SHIBUI_SOURCES
  src/main.cpp
  src/app.cpp
  src/snapshot.cpp
  src/window_snap.cpp
)

if(WIN32)
  list(APPEND SHIBUI_SOURCES src/clipboard_win.cpp)
elseif(APPLE)
  list(APPEND SHIBUI_SOURCES src/clipboard_mac.mm)
  list(APPEND SHIBUI_SOURCES src/window_snap_mac.mm)
else()
  find_package(PkgConfig REQUIRED)
  pkg_check_modules(GTK3 REQUIRED gtk+-3.0)
  list(APPEND SHIBUI_SOURCES src/clipboard_linux.cpp)
endif()

if(APPLE)
  set(APP_ICON_MACOS "${CMAKE_SOURCE_DIR}/assets/icons/shibui-code.icns")
  set_source_files_properties(${APP_ICON_MACOS} PROPERTIES MACOSX_PACKAGE_LOCATION "Resources")
  add_executable(shibui-code MACOSX_BUNDLE ${SHIBUI_SOURCES} ${APP_ICON_MACOS})
  set_target_properties(shibui-code PROPERTIES MACOSX_BUNDLE_ICON_FILE "shibui-code.icns")
else()
  add_executable(shibui-code ${SHIBUI_SOURCES})
endif()

target_include_directories(shibui-code PRIVATE src)
if(TARGET webview::core)
  target_link_libraries(shibui-code PRIVATE webview::core)
elseif(TARGET webview::webview)
  target_link_libraries(shibui-code PRIVATE webview::webview)
elseif(TARGET webview)
  target_link_libraries(shibui-code PRIVATE webview)
else()
  message(FATAL_ERROR "Webview target not found after FetchContent.")
endif()

if(APPLE)
  target_link_libraries(shibui-code PRIVATE "-framework Cocoa")
elseif(WIN32)
  target_link_libraries(shibui-code PRIVATE user32)
else()
  target_include_directories(shibui-code PRIVATE ${GTK3_INCLUDE_DIRS})
  target_link_libraries(shibui-code PRIVATE ${GTK3_LIBRARIES})
  target_compile_options(shibui-code PRIVATE ${GTK3_CFLAGS_OTHER})
endif()

if(SHIBUI_BUILD_TESTS)
  enable_testing()
  add_executable(shibui-unit-tests
    tests/cpp/test_snapshot.cpp
    tests/cpp/test_window_snap.cpp
    src/snapshot.cpp
    src/window_snap.cpp
  )
  target_include_directories(shibui-unit-tests PRIVATE src)
  add_test(NAME shibui-unit-tests COMMAND shibui-unit-tests)
endif()

install(TARGETS shibui-code
  RUNTIME DESTINATION bin
  BUNDLE DESTINATION .
)

set(CPACK_PACKAGE_NAME "Shibui-Code")
set(CPACK_PACKAGE_VENDOR "Shibui")
set(CPACK_PACKAGE_VERSION ${PROJECT_VERSION})
set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "Distraction-free code scribbling editor")
set(CPACK_PACKAGE_FILE_NAME "shibui-code-${PROJECT_VERSION}-${CMAKE_SYSTEM_NAME}")

if(WIN32)
  set(CPACK_GENERATOR "ZIP;NSIS")
elseif(APPLE)
  set(CPACK_GENERATOR "DragNDrop;TGZ")
  set(SHIBUI_DMG_VOLUME_NAME "Shibui-Code")
  configure_file(
    "${CMAKE_SOURCE_DIR}/packaging/macos/dmg-setup.applescript.in"
    "${CMAKE_BINARY_DIR}/dmg-setup.applescript"
    @ONLY
  )
  set(CPACK_DMG_VOLUME_NAME "${SHIBUI_DMG_VOLUME_NAME}")
  set(CPACK_DMG_BACKGROUND_IMAGE "${CMAKE_SOURCE_DIR}/assets/dmg/dmg-background.png")
  set(CPACK_DMG_DS_STORE_SETUP_SCRIPT "${CMAKE_BINARY_DIR}/dmg-setup.applescript")
  set(CPACK_DMG_DISABLE_APPLICATIONS_SYMLINK OFF)
  set(CPACK_DMG_FILESYSTEM "HFS+")
  set(CPACK_DMG_FORMAT "UDZO")
else()
  set(CPACK_GENERATOR "TGZ;DEB")
endif()

include(CPack)
