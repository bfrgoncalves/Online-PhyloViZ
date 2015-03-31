# PathGL
Pathgl is a library for data visualization and simulation using d3.

## Getting Started
To link directly the latest release, copy this snippet:
```html
<script src="http://adnanwahab.com/pathgl/dist/pathgl.min.js"
charset="utf-8"></script>
```
Or download the [latest release](http://adnanwahab.org/pathgl/dist/pathgl.zip) and
include in your html.

If you want to use pathGL within a module system, `npm install pathgl --save`.

##Your ultimate creation

```html
<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
<script src="http://pathgl.com/dist/pathgl.js"></script>
<canvas height="600px" width="600px"></canvas>
<script>
  d3.select('canvas').append('circle')
    .attr('r', 100)
    .attr('cx', 50)
    .attr('cy', 50)
    .attr('fill', 'pink')
</script>
```

## Next Steps
Check out the examples to learn more.
Tutorials on creating your own data tiles and simulation textures coming soon!
