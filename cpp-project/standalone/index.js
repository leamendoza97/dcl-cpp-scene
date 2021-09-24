import { WASI } from "@wasmer/wasi";
import wasiBindings from "@wasmer/wasi/lib/bindings/browser";
import { WasmFs } from "@wasmer/wasmfs";

export const WASI_RIGHT_FD_DATASYNC = BigInt(0x0000000000000001);
export const WASI_RIGHT_FD_READ = BigInt(0x0000000000000002);
export const WASI_RIGHT_FD_SEEK = BigInt(0x0000000000000004);
export const WASI_RIGHT_FD_FDSTAT_SET_FLAGS = BigInt(0x0000000000000008);
export const WASI_RIGHT_FD_SYNC = BigInt(0x0000000000000010);
export const WASI_RIGHT_FD_TELL = BigInt(0x0000000000000020);
export const WASI_RIGHT_FD_WRITE = BigInt(0x0000000000000040);
export const WASI_RIGHT_FD_ADVISE = BigInt(0x0000000000000080);
export const WASI_RIGHT_FD_ALLOCATE = BigInt(0x0000000000000100);
export const WASI_RIGHT_PATH_CREATE_DIRECTORY = BigInt(0x0000000000000200);
export const WASI_RIGHT_PATH_CREATE_FILE = BigInt(0x0000000000000400);
export const WASI_RIGHT_PATH_LINK_SOURCE = BigInt(0x0000000000000800);
export const WASI_RIGHT_PATH_LINK_TARGET = BigInt(0x0000000000001000);
export const WASI_RIGHT_PATH_OPEN = BigInt(0x0000000000002000);
export const WASI_RIGHT_FD_READDIR = BigInt(0x0000000000004000);
export const WASI_RIGHT_PATH_READLINK = BigInt(0x0000000000008000);
export const WASI_RIGHT_PATH_RENAME_SOURCE = BigInt(0x0000000000010000);
export const WASI_RIGHT_PATH_RENAME_TARGET = BigInt(0x0000000000020000);
export const WASI_RIGHT_PATH_FILESTAT_GET = BigInt(0x0000000000040000);
export const WASI_RIGHT_PATH_FILESTAT_SET_SIZE = BigInt(0x0000000000080000);
export const WASI_RIGHT_PATH_FILESTAT_SET_TIMES = BigInt(0x0000000000100000);
export const WASI_RIGHT_FD_FILESTAT_GET = BigInt(0x0000000000200000);
export const WASI_RIGHT_FD_FILESTAT_SET_SIZE = BigInt(0x0000000000400000);
export const WASI_RIGHT_FD_FILESTAT_SET_TIMES = BigInt(0x0000000000800000);
export const WASI_RIGHT_PATH_SYMLINK = BigInt(0x0000000001000000);
export const WASI_RIGHT_PATH_REMOVE_DIRECTORY = BigInt(0x0000000002000000);
export const WASI_RIGHT_PATH_UNLINK_FILE = BigInt(0x0000000004000000);
export const WASI_RIGHT_POLL_FD_READWRITE = BigInt(0x0000000008000000);
export const WASI_RIGHT_SOCK_SHUTDOWN = BigInt(0x0000000010000000);

export const RIGHTS_ALL =
  WASI_RIGHT_FD_DATASYNC |
  WASI_RIGHT_FD_READ |
  WASI_RIGHT_FD_SEEK |
  WASI_RIGHT_FD_FDSTAT_SET_FLAGS |
  WASI_RIGHT_FD_SYNC |
  WASI_RIGHT_FD_TELL |
  WASI_RIGHT_FD_WRITE |
  WASI_RIGHT_FD_ADVISE |
  WASI_RIGHT_FD_ALLOCATE |
  WASI_RIGHT_PATH_CREATE_DIRECTORY |
  WASI_RIGHT_PATH_CREATE_FILE |
  WASI_RIGHT_PATH_LINK_SOURCE |
  WASI_RIGHT_PATH_LINK_TARGET |
  WASI_RIGHT_PATH_OPEN |
  WASI_RIGHT_FD_READDIR |
  WASI_RIGHT_PATH_READLINK |
  WASI_RIGHT_PATH_RENAME_SOURCE |
  WASI_RIGHT_PATH_RENAME_TARGET |
  WASI_RIGHT_PATH_FILESTAT_GET |
  WASI_RIGHT_PATH_FILESTAT_SET_SIZE |
  WASI_RIGHT_PATH_FILESTAT_SET_TIMES |
  WASI_RIGHT_FD_FILESTAT_GET |
  WASI_RIGHT_FD_FILESTAT_SET_TIMES |
  WASI_RIGHT_FD_FILESTAT_SET_SIZE |
  WASI_RIGHT_PATH_SYMLINK |
  WASI_RIGHT_PATH_UNLINK_FILE |
  WASI_RIGHT_PATH_REMOVE_DIRECTORY |
  WASI_RIGHT_POLL_FD_READWRITE |
  WASI_RIGHT_SOCK_SHUTDOWN;

function openFileDescriptor(filePath, wasi, mode = 'w+'){
  const directoryPath = wasi.bindings.path.dirname(filePath);
  
  wasi.bindings.fs.mkdirSync(directoryPath, { recursive: true })
  wasi.bindings.fs.writeFileSync(filePath, "")

  const realAndFakeFd = wasi.bindings.fs.openSync(filePath, "w+")

  wasi.FD_MAP.set(realAndFakeFd, {
    real: realAndFakeFd,
    filetype: 3,
    // offset: BigInt(0),
    rights: {
      base: RIGHTS_ALL,
      inheriting: BigInt(0)
    },
    path: filePath
  })

  return realAndFakeFd
}

window.addEventListener('load', async (_event) => {
  const wasmfs = new WasmFs();
  const wasi = new WASI({
    bindings: {
      ...wasiBindings.default,
      fs: wasmfs.fs,
    }
  });

  const module = await WebAssembly.compileStreaming(fetch('game.wasm'));
  const { wasi_snapshot_preview1 } = wasi.getImports(module);

  const memory = new WebAssembly.Memory({ initial: 2 });
  wasi.setMemory(memory);
  const env = { memory };

  const instance = await WebAssembly.instantiate(module, { env, wasi_snapshot_preview1 });
  let time = new Date().getTime();

  const rendererFd = openFileDescriptor('/dcl/renderer', wasi, 'w+')
  const sceneFd = openFileDescriptor('/dcl/scene', wasi, 'w+')
  const otherFd = openFileDescriptor('/dcl/renderer', wasi, 'w+')

  function updateScene(value = -1.0){
    // update scene
    const now = new Date().getTime()
    const result = instance.exports.update(now - time);
    time = now;

    const std_out = wasmfs.fs.readFileSync('/dev/stdout', 'utf8');
    console.log(`std_out: '${std_out}' - update()=${result}`);

    const rendererBuffer = new Uint8Array(1024);
    const rendererOut = wasmfs.fs.readSync(rendererFd, rendererBuffer, 0, 1024, 0);
    console.log(`rendererOut: '${rendererBuffer.toString()}'`);

    // clear std out
    wasmfs.fs.writeFileSync('/dev/stdout', '')

    if (value === -1.0){
        setTimeout(updateScene, 1000)
    }
  }

  updateScene()
});