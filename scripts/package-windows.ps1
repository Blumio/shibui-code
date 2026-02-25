$ErrorActionPreference = "Stop"

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$buildDir = Join-Path $root "build/windows"

Set-Location $root
npm run build:frontend
cmake -S . -B $buildDir -DSHIBUI_BUILD_TESTS=ON -DCMAKE_BUILD_TYPE=Release
cmake --build $buildDir --config Release
ctest --test-dir $buildDir --output-on-failure -C Release
cpack --config "$buildDir/CPackConfig.cmake" -C Release
