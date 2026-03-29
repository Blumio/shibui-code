cmake_minimum_required(VERSION 3.24)
project(ShibuiCode VERSION 1.0.0 LANGUAGES CXX OBJCXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

include(CTest)

option(SHIBUI_BUILD_TESTS "Build and register tests" ON)
option(SHIBUI_ENABLE_COVERAGE "Enable coverage instrumentation for C++ targets" OFF)
set(SHIBUI_SANITIZER "none" CACHE STRING "Sanitizer to enable: none,address,undefined,thread")
set_property(CACHE SHIBUI_SANITIZER PROPERTY STRINGS none address undefined thread)

if(NOT APPLE)
  message(FATAL_ERROR "Shibui-Code currently supports only macOS.")
endif()

find_program(NPM_EXECUTABLE npm REQUIRED)
find_program(NODE_EXECUTABLE node REQUIRED)
find_program(PYTHON3_EXECUTABLE python3 REQUIRED)

add_library(shibui_compile_options INTERFACE)
target_compile_features(shibui_compile_options INTERFACE cxx_std_20)

if(CMAKE_CXX_COMPILER_ID MATCHES "Clang|GNU")
  target_compile_options(shibui_compile_options INTERFACE -Wall -Wextra -Wpedantic)
endif()

if(SHIBUI_ENABLE_COVERAGE)
  target_compile_options(shibui_compile_options INTERFACE --coverage -O0 -g)
  target_link_options(shibui_compile_options INTERFACE --coverage)
endif()

if(SHIBUI_SANITIZER STREQUAL "address")
  target_compile_options(shibui_compile_options INTERFACE -fsanitize=address -fno-omit-frame-pointer)
  target_link_options(shibui_compile_options INTERFACE -fsanitize=address)
elseif(SHIBUI_SANITIZER STREQUAL "undefined")
  target_compile_options(shibui_compile_options INTERFACE -fsanitize=undefined -fno-omit-frame-pointer)
  target_link_options(shibui_compile_options INTERFACE -fsanitize=undefined)
elseif(SHIBUI_SANITIZER STREQUAL "thread")
  target_compile_options(shibui_compile_options INTERFACE -fsanitize=thread -fno-omit-frame-pointer)
  target_link_options(shibui_compile_options INTERFACE -fsanitize=thread)
elseif(NOT SHIBUI_SANITIZER STREQUAL "none")
  message(FATAL_ERROR "Unsupported SHIBUI_SANITIZER value: ${SHIBUI_SANITIZER}")
endif()

add_subdirectory(backend)
add_subdirectory(app)

if(SHIBUI_BUILD_TESTS AND BUILD_TESTING)
  enable_testing()
  add_subdirectory(tests)
endif()

set(CPACK_PACKAGE_NAME "Shibui-Code")
set(CPACK_PACKAGE_VENDOR "Shibui")
set(CPACK_PACKAGE_VERSION ${PROJECT_VERSION})
set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "Distraction-free code scribbling editor")
set(CPACK_PACKAGE_FILE_NAME "shibui-code-${PROJECT_VERSION}-${CMAKE_SYSTEM_NAME}")

set(CPACK_GENERATOR "DragNDrop;TGZ")
set(SHIBUI_DMG_VOLUME_NAME "Shibui-Code ${PROJECT_VERSION}")
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

include(CPack)
