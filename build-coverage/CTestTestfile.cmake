# CMake generated Testfile for 
# Source directory: /Users/matthiasblum/projects/shibui-code
# Build directory: /Users/matthiasblum/projects/shibui-code/build-coverage
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
add_test([=[shibui-unit-tests]=] "/Users/matthiasblum/projects/shibui-code/build-coverage/shibui-unit-tests")
set_tests_properties([=[shibui-unit-tests]=] PROPERTIES  _BACKTRACE_TRIPLES "/Users/matthiasblum/projects/shibui-code/CMakeLists.txt;63;add_test;/Users/matthiasblum/projects/shibui-code/CMakeLists.txt;0;")
subdirs("_deps/webview-build")
