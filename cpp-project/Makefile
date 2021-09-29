
WASI_VERSION=12
WASI_VERSION_FULL=$(WASI_VERSION).0
WASI_SDK_PATH=$(shell pwd)/wasi-sdk-$(WASI_VERSION_FULL)
OS := $(shell uname)

install:
ifeq ($(OS),Darwin)
	$(MAKE) install-wasi-sdk-macos
else
	$(MAKE) install-wasi-sdk-linux
endif

install-wasi-sdk-linux:	
	rm wasi-sdk-$(WASI_VERSION_FULL)-linux.tar.gz || true
	wget https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-$(WASI_VERSION)/wasi-sdk-$(WASI_VERSION_FULL)-linux.tar.gz
	rm -rf wasi-sdk-$(WASI_VERSION_FULL)
	tar xvf wasi-sdk-$(WASI_VERSION_FULL)-linux.tar.gz
	rm wasi-sdk-$(WASI_VERSION_FULL)-linux.tar.gz

install-wasi-sdk-macos:
	rm wasi-sdk-$(WASI_VERSION_FULL)-macos.tar.gz || true
	wget https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-$(WASI_VERSION)/wasi-sdk-$(WASI_VERSION_FULL)-macos.tar.gz
	rm -rf wasi-sdk-$(WASI_VERSION_FULL)
	tar xvf wasi-sdk-$(WASI_VERSION_FULL)-macos.tar.gz
	rm wasi-sdk-$(WASI_VERSION_FULL)-macos.tar.gz

# to deprecate
# CC=$(WASI_SDK_PATH)/bin/clang++ 
# dep-compile:
# 	$(CC) -nostartfiles \
# 		-fno-exceptions \
# 		-Wl,--no-entry \
# 		-Wl,--export-dynamic \
# 		-Wl,--import-memory \
# 		--sysroot=$(WASI_SDK_PATH)/share/wasi-sysroot \
# 		-L $(WASI_SDK)/share/wasi-sysroot/lib/wasm32-wasi \
# 		-lc -g \
# 		-o build/game.wasm src/game.cpp 
# 	$(cp build/game.wasm standalone/game.wasm)

cmake:
	rm -rf cmake-build && mkdir -p cmake-build
	cd cmake-build && cmake .. -DWASI_SDK_PREFIX=$(WASI_SDK_PATH) -DCMAKE_TOOLCHAIN_FILE=./wasimake.cmake 
	
compile:
	cd cmake-build && make
	mkdir -p build && cp cmake-build/decentraland-wasm-example-cpp build/game.wasm
	cp build/game.wasm standalone/game.wasm
	cp build/game.wasm ../bin/game.wasm