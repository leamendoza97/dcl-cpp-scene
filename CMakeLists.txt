cmake_minimum_required(VERSION 3.4.0)
set(CMAKE_VERBOSE_MAKEFILE ON)

set(WASI 1)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

project(decentraland-cpp-runtime CXX)

add_executable(decentraland-wasm-example-cpp 
    src/game.cpp
    src/scene/Scene.cpp
)

include_directories(src/3rdparty/entt/includes)
