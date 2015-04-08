#Online PhyloViZ

This web application allows you to choose between two layout rendering engines (SVG and WebGl) and display 4 different MLST datasets using minimum spanning trees.

Node.js is required.

Launch the application
======================

`node app` and in your browser listen on port `3000`

Choose a rendering engine
=========================

On the main page there is a choice between `SVG` and `WebGL`. You can also select one by typing `:3000/svg` or `:3000/webgl`

Choose a dataset
================

Select between 3 datasets:

* `:3000/webgl?data=pyogenes` - a dataset with MLST data of `S.pyogenes` (647 nodes)
* `:3000/webgl?data=saureus` - a dataset with MLST data of `S.aureus` (2960 nodes)
* `:3000/webgl?data=spneumo` - a dataset with MLST data of `S.pneumoniae` (10261 nodes)

* webgl can be changed by svg