find_package(GTest CONFIG QUIET)
if(NOT GTest_FOUND)
  include(FetchContent)
  FetchContent_Declare(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG v1.14.0
  )
  FetchContent_MakeAvailable(googletest)
endif()

add_executable(shibui_backend_unit_tests
  test_snapshot.cpp
  test_window_snap.cpp
)

target_link_libraries(shibui_backend_unit_tests
  PRIVATE
    shibui_core
    shibui_compile_options
    GTest::gtest_main
    GTest::gmock
)

add_test(NAME backend.unit COMMAND shibui_backend_unit_tests)
set_tests_properties(backend.unit PROPERTIES LABELS "backend;unit")

add_executable(shibui_backend_contract_tests
  test_bridge_contract.cpp
)

target_link_libraries(shibui_backend_contract_tests
  PRIVATE
    shibui_core
    shibui_compile_options
    GTest::gtest_main
    GTest::gmock
)

add_test(NAME backend.contract COMMAND shibui_backend_contract_tests)
set_tests_properties(backend.contract PROPERTIES LABELS "backend;contract")
