option(SHIBUI_ENABLE_E2E "Enable Playwright end-to-end tests" ON)

add_subdirectory(${CMAKE_SOURCE_DIR}/backend/tests ${CMAKE_BINARY_DIR}/backend-tests)

add_test(
  NAME frontend.install
  COMMAND ${NPM_EXECUTABLE} --prefix ${CMAKE_SOURCE_DIR}/frontend ci
)
set_tests_properties(frontend.install PROPERTIES
  LABELS "frontend;setup"
  FIXTURES_SETUP frontend_deps
)

add_test(
  NAME frontend.unit
  COMMAND ${NPM_EXECUTABLE} --prefix ${CMAKE_SOURCE_DIR}/frontend run test
)
set_tests_properties(frontend.unit PROPERTIES
  LABELS "frontend;unit"
  FIXTURES_REQUIRED frontend_deps
)

add_test(
  NAME frontend.contract
  COMMAND ${NPM_EXECUTABLE} --prefix ${CMAKE_SOURCE_DIR}/frontend run test:contract
)
set_tests_properties(frontend.contract PROPERTIES
  LABELS "frontend;contract"
  FIXTURES_REQUIRED frontend_deps
)

if(SHIBUI_ENABLE_E2E)
  add_test(
    NAME frontend.e2e.install
    COMMAND ${NPM_EXECUTABLE} --prefix ${CMAKE_SOURCE_DIR}/frontend run e2e:install
  )
  set_tests_properties(frontend.e2e.install PROPERTIES
    LABELS "frontend;e2e;setup"
    FIXTURES_REQUIRED frontend_deps
    FIXTURES_SETUP frontend_e2e_runtime
  )

  add_test(
    NAME frontend.e2e
    COMMAND ${NPM_EXECUTABLE} --prefix ${CMAKE_SOURCE_DIR}/frontend run test:e2e
  )
  set_tests_properties(frontend.e2e PROPERTIES
    LABELS "frontend;e2e"
    FIXTURES_REQUIRED "frontend_deps;frontend_e2e_runtime"
  )
endif()

add_test(
  NAME integration.repository_contract
  COMMAND ${PYTHON3_EXECUTABLE} -m pytest -q ${CMAKE_SOURCE_DIR}/tests/integration
)
set_tests_properties(integration.repository_contract PROPERTIES
  LABELS "integration;contract"
)
