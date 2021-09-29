cmake_minimum_required(VERSION 3.4.0)
set(CMAKE_VERBOSE_MAKEFILE ON)

set(WASI 1)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)


project(quickjs C)

add_definitions(-DEMSCRIPTEN)
add_definitions(-DQUICKJS_WITH_DEBUGGER)
add_definitions(-DCONFIG_BIGNUM)
add_definitions(-DFE_DOWNWARD=0x400)
add_definitions(-DFE_UPWARD=0x400)
add_definitions(-DCONFIG_VERSION="2021-03-27")
add_definitions(-D_WASI_EMULATED_SIGNAL)

add_library(quickjs
    src/3rdparty/quickjs/cutils.c
    src/3rdparty/quickjs/libbf.c
    src/3rdparty/quickjs/libregexp.c
    src/3rdparty/quickjs/libunicode.c
    src/3rdparty/quickjs/quickjs-debugger.c
    src/3rdparty/quickjs/quickjs-debugger-transport-wasi.c
    src/3rdparty/quickjs/quickjs.c
)

project(decentraland-cpp-runtime CXX)

add_executable(decentraland-wasm-example-cpp 
    src/game.cpp
    src/quickjs_example.cpp
    src/scene/Scene.cpp
)

include_directories(src/3rdparty/entt/includes)
include_directories(src/3rdparty/quickjs)

target_link_libraries(decentraland-wasm-example-cpp PUBLIC quickjs)