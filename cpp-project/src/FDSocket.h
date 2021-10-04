#ifndef _FDSOCKET_H
#define _FDSOCKET_H

#include <string>
#include <functional>

typedef std::function<void(const void *, int)> DataArrivalCallback;

class FDSocket
{
public:
    FDSocket(int fd);
    ~FDSocket();

    int write(const void *buffer, uint32_t bufferLength);

    void setOnDataArrival(DataArrivalCallback f);
    void poll();

private:
    int fd = -1;
    DataArrivalCallback onDataArrival = 0;

    enum PollingState
    {
        WatingDataLength = 1,
        ReadingData = 2
    };

    struct
    {
        char *data = nullptr;
        uint32_t dataLength = 0;
        uint32_t dataOffset = 0;
        PollingState state;
    } pollingState;
};

#endif