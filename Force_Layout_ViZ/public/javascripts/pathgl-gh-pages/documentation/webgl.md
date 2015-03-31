WebGL has a pipeline architecture, like the assembly line used to build a car.

1. javascript sends list of points to GPU
2. vertex shader places points
3. points are assembeled into triangles
4. triangles are chopped up into fragments
5. fragment shader colors fragments
6. framebuffer is drawn to screen 

Stages 2 and 5 are programmable using GLSL.
We want to offload as much work as we can to them, so that your cpu is free to do
other things, like handle user input.

## 1. Geometry Specifications
  PathGL converts your selections into WebGL accessible memory locations called
  buffers. These buffers are then sent to the GPU every frame to be drawn.

  If no atttributes have changed, the draw is effectively cached and happens
  extremely quickly. That means, every time you call .attr on a selection, you
  are wiping out the gpu cache. Instead, try to move as much logic as possible
  to shaders. This will let you mostly bypass the overhead of javascript, the web
  browser and the numerous layers of security checks.

## 2. Vertex Shading
  A program written in GLSL is used to process the points.
  The vertex shader takes vertex Attributes ".attr(cx, 10)" and uniforms as input,
  and must output a vector describing location [x, y, depth, clip]

## 3 Triangle Assembly
  The points are converted to triangles, and projected from objectspace to screenspace.

## 4. Rasterization
  The rasterizer converts each triangle, into a list of fragments for each pixel that
  it covers. A fragment is like a pixel that hasn't been born. A single pixel might
  have many fragments, which are then blended, or culled.

  At this stage, varying attributes sent from the vertex shader to the fragment shader
  are interpolated by the fragments distance to that vertex. 

## 5. Fragment Shading
  A program written in GLSL is used to process the fragments.
  The fragmentShader takes as input both uniform and varying varyables, and must
  output a vector describing color [R, G, B, Opacity]

## 6. Framebuffers
  By default, the frameBuffer is draw directly to the screen. However, pathGL lets you
  create offscreen rendering targets, or render into a texture. This is useful for
  allowing post processing effects like blurs, color filters, and FXAA.

Further reading
