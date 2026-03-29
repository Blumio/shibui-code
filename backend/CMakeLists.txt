add_library(shibui_core STATIC
  src/bridge_contract.cpp
  src/snapshot.cpp
  src/window_snap.cpp
)

target_include_directories(shibui_core
  PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_link_libraries(shibui_core
  PUBLIC
    shibui_compile_options
)
