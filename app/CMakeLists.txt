include(FetchContent)

if(NOT DEFINED FETCHCONTENT_SOURCE_DIR_WEBVIEW)
  string(TOLOWER "${CMAKE_SYSTEM_NAME}" SHIBUI_SYSTEM_NAME_LOWER)
  set(SHIBUI_WEBVIEW_SOURCE_CANDIDATES
    "${CMAKE_SOURCE_DIR}/.native-build/${SHIBUI_SYSTEM_NAME_LOWER}-${CMAKE_SYSTEM_PROCESSOR}/_deps/webview-src"
    "${CMAKE_SOURCE_DIR}/build/dev/_deps/webview-src"
    "${CMAKE_SOURCE_DIR}/build/ci/_deps/webview-src"
    "${CMAKE_SOURCE_DIR}/build/release/_deps/webview-src"
  )

  foreach(candidate IN LISTS SHIBUI_WEBVIEW_SOURCE_CANDIDATES)
    if(EXISTS "${candidate}/CMakeLists.txt")
      set(FETCHCONTENT_SOURCE_DIR_WEBVIEW "${candidate}" CACHE PATH "Pinned local webview source")
      set(FETCHCONTENT_UPDATES_DISCONNECTED ON CACHE BOOL "Disable webview updates")
      break()
    endif()
  endforeach()
endif()

FetchContent_Declare(
  webview
  GIT_REPOSITORY https://github.com/webview/webview.git
  GIT_TAG 0.12.0
)
FetchContent_MakeAvailable(webview)

set(FRONTEND_DEPS_STAMP "${CMAKE_BINARY_DIR}/frontend-deps.stamp")
add_custom_command(
  OUTPUT "${FRONTEND_DEPS_STAMP}"
  COMMAND "${NPM_EXECUTABLE}" --prefix "${CMAKE_SOURCE_DIR}/frontend" ci
  COMMAND "${CMAKE_COMMAND}" -E touch "${FRONTEND_DEPS_STAMP}"
  DEPENDS
    "${CMAKE_SOURCE_DIR}/frontend/package.json"
    "${CMAKE_SOURCE_DIR}/frontend/package-lock.json"
)
add_custom_target(frontend_deps DEPENDS "${FRONTEND_DEPS_STAMP}")

file(GLOB_RECURSE SHIBUI_FRONTEND_SOURCES CONFIGURE_DEPENDS
  "${CMAKE_SOURCE_DIR}/frontend/src/*.ts"
  "${CMAKE_SOURCE_DIR}/frontend/src/*.css"
  "${CMAKE_SOURCE_DIR}/frontend/index.html"
)

set(SHIBUI_FRONTEND_BUNDLE_HEADER "${CMAKE_SOURCE_DIR}/app/generated/frontend_bundle.hpp")
set(SHIBUI_FRONTEND_BUNDLE_STAMP "${CMAKE_BINARY_DIR}/frontend-bundle.stamp")
add_custom_command(
  OUTPUT
    "${SHIBUI_FRONTEND_BUNDLE_HEADER}"
    "${SHIBUI_FRONTEND_BUNDLE_STAMP}"
  COMMAND "${CMAKE_COMMAND}" -E make_directory "${CMAKE_SOURCE_DIR}/app/generated"
  COMMAND "${NPM_EXECUTABLE}" --prefix "${CMAKE_SOURCE_DIR}/frontend" run build
  COMMAND "${NODE_EXECUTABLE}" "${CMAKE_SOURCE_DIR}/scripts/embed-frontend.mjs" --output "${SHIBUI_FRONTEND_BUNDLE_HEADER}"
  COMMAND "${CMAKE_COMMAND}" -E touch "${SHIBUI_FRONTEND_BUNDLE_STAMP}"
  DEPENDS
    frontend_deps
    "${CMAKE_SOURCE_DIR}/scripts/embed-frontend.mjs"
    "${CMAKE_SOURCE_DIR}/frontend/package.json"
    "${CMAKE_SOURCE_DIR}/frontend/package-lock.json"
    "${CMAKE_SOURCE_DIR}/frontend/vite.config.ts"
    ${SHIBUI_FRONTEND_SOURCES}
)
add_custom_target(frontend_bundle DEPENDS "${SHIBUI_FRONTEND_BUNDLE_HEADER}")

set(SHIBUI_APP_SOURCES
  src/main.cpp
  src/app.cpp
  src/clipboard_mac.mm
  src/window_snap_mac.mm
)

set(APP_ICON_MACOS "${CMAKE_SOURCE_DIR}/assets/icons/shibui-code.icns")
set_source_files_properties(${APP_ICON_MACOS} PROPERTIES MACOSX_PACKAGE_LOCATION "Resources")

add_executable(shibui-code MACOSX_BUNDLE ${SHIBUI_APP_SOURCES} ${APP_ICON_MACOS})
add_dependencies(shibui-code frontend_bundle)
set_target_properties(shibui-code PROPERTIES MACOSX_BUNDLE_ICON_FILE "shibui-code.icns")

target_include_directories(shibui-code
  PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${CMAKE_SOURCE_DIR}/app/generated
)

target_link_libraries(shibui-code
  PRIVATE
    shibui_core
    shibui_compile_options
)

if(TARGET webview::core)
  target_link_libraries(shibui-code PRIVATE webview::core)
elseif(TARGET webview::webview)
  target_link_libraries(shibui-code PRIVATE webview::webview)
elseif(TARGET webview)
  target_link_libraries(shibui-code PRIVATE webview)
else()
  message(FATAL_ERROR "Webview target not found after FetchContent.")
endif()

target_link_libraries(shibui-code PRIVATE "-framework Cocoa")

install(TARGETS shibui-code
  RUNTIME DESTINATION bin
  BUNDLE DESTINATION .
)
