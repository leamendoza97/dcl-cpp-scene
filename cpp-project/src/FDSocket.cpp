#include "FDSocket.h"
#include <fcntl.h>
#include <unistd.h>
#include <assert.h>

FDSocket::FDSocket(int fd)
{
    // set non blocking to try to read each frame
    fcntl(fd, F_SETFL, fcntl(0, F_GETFL) | O_NONBLOCK);
    this->pollingState.state = WatingDataLength;
    this->fd = fd;
}

FDSocket::~FDSocket()
{
}

int FDSocket::write(const void *buffer, uint32_t bufferLength)
{
    ::write(this->fd, buffer, bufferLength);
}

void FDSocket::setOnDataArrival(DataArrivalCallback f)
{
    this->onDataArrival = f;
}

void FDSocket::poll()
{
    int ret;
    uint32_t bufferLength;
    do
    {
        if (this->pollingState.state == WatingDataLength)
        {
            ret = read(this->fd, &bufferLength, 4);
            if (ret > 0)
            {
                this->pollingState.state = ReadingData;
                this->pollingState.dataOffset = 0;
                if (bufferLength > this->pollingState.dataLength)
                {
                    this->pollingState.data = (char *)realloc(this->pollingState.data, this->pollingState.dataLength);
                }
            }
        }
        else if (this->pollingState.state == ReadingData)
        {
            uint32_t remaining = this->pollingState.dataLength - this->pollingState.dataOffset;
            ret = read(this->fd, &this->pollingState.data[pollingState.dataOffset], remaining);
            if (ret > 0)
            {
                remaining -= ret;
                if (remaining == 0)
                {
                    if (onDataArrival)
                    {
                        onDataArrival(pollingState.data, pollingState.dataLength);
                    }
                    this->pollingState.state = WatingDataLength;
                }
                else
                {
                    this->pollingState.dataOffset += ret;
                }
            }
        }
        else
        {
            assert(0);
        }
    } while (ret > 0);
}