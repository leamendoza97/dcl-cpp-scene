#define export __attribute__((visibility("default")))

// c++ std libraries
#include <vector>
#include <string>
#include <map>

#include <errno.h>
#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>

#include <memory>
#include <map>

#include "FDSocket.h"
#include <sstream>
#include <iomanip>

int initFlag = 0;
// this is wrong but something is going wrong with std::map
std::map<std::string, FDSocket *> fdSocketsMap;
std::vector<std::unique_ptr<FDSocket>> fdSockets;

void addFdSocket(std::string envVar, std::string key)
{
  const char *envStr = getenv(envVar.c_str());
  if (envStr != NULL)
  {
    int fd = atoi(envStr);
    if (fd > 0)
    {
      fdSockets.push_back(std::make_unique<FDSocket>(fd));
      fdSocketsMap[key] = (fdSockets.end() - 1)->get();
    }
  }
}
int init()
{
  int wt = 0;
  addFdSocket("FD_RENDERER", "RENDERER");

  printf("Initialize C++ code.\n");

  initFlag = 1;
  return 0;
}

void pollFDSockets()
{
  for (const auto &s : fdSockets)
  {
    s->poll();
  }
}

std::string hexStr(char *data, int len)
{
  std::stringstream ss;
  ss << std::hex;

  for (int i(0); i < len; ++i)
    ss << std::setw(2) << std::setfill('0') << (int)data[i];

  return ss.str();
}

int _update(float dt)
{
  if (initFlag == 0)
    init();

  pollFDSockets();

  fdSocketsMap["RENDERER"]->setOnDataArrival([](const void *buffer, uint32_t bufferLength){ 
      printf("Message from Renderer %s \n", hexStr((char *)buffer, bufferLength).c_str()); 
  });
  // fdSocketsMap["RENDERER"]->write((char*)"hello", 5);

  return 0;
}

extern "C"
{
  export int skipStartWASI()
  {
    return 0;
  }

  export int update(float dt)
  {
    return _update(dt);
  }

  export int main(int argn, char *argv[])
  {
    return 0;
  }
}