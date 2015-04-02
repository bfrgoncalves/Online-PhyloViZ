GPGPU is a technique for offloading heavy computation to the graphics card.

Characteristics of graphics programming. Your task may benefit from gpgpu if it has similar characteristics
1. high arithmetic intensity
2. large data sets
3. long latencies ok
4. deep, feed forward pipelines. data flows one way
5. hacks are ok - can tolerate lack of accuracy
6. decomposes cleanly to map, reduce, filter, scatter, gather, sort, and search operations
7. has minimal dependency between data elements


CPUs address a completely different application space, scalar programming
with no data parallellism. Most of the sillicon in a cpu is devoted to
storage and complex control structures. Very little of it is designed
for doing actual computation. Furthermore, processor scaling is slowing
because as it gets more difficult to maintain the current gates / clock ratio,
inter process communication increases.

#How
GPGPU programs are written as fragment shaders in GLSL, a statically typed
javascript-like language with specialized support for vector manipulation.

In webGL, a pixel is a vector with 4 floats. Typically these
elements represent RGBA color channels, but we can use them for anything.
For example, by thinking of each pixel as a vector containing
``(positionX, positionY, velocityX, velocityY)``, we can simulate a particle by
integrating velocity into position on every frame.

Drawing a square with dimensions 1000x1000 spawns 1 million
threads. The output of these threads can be written to a texture,
which is then sampled as input on the next cycle, allowing state to be
passed between frames.

The main storage for gpgpu programs is texture memory. This is a 'stream register
file' that tracks producer-consumer relationships. It is not like a cpu cache, and does
not store real data, but pointers to where new data will come from.


Examples include fft, image processing, simulating physical models like weather and
cosmology, neural networks, cryptography, and so on. 

The cpu-gpu relationship is similar to the request-response cycle in webbrowsers.
The cpu can send send and request data, while the gpu can only respond to requests,
and compute kernels. Unlike webservers, kernels are launched by the client. In the
future, advanced versions of webCL may allow gpus to launch kernels, which would be
like forking off a child process. 

Kernels are meant to look like serial programs, even if they may be running on a
thousand threads in parallel.


