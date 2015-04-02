#Online PhyloViZ

This web application allows you to choose between two layout rendering engines (SVG and WebGl) and display 4 different MLST datasets.

Node.js is required.

Launch the application
======================

`node app` and in your browser listen on port `3000`

Choose a rendering engine
=========================

On the main page there is a choice between `SVG` and `WebGL`. You can also select one by typing `:3000/svg` or `:3000/webgl`

Choose a dataset
================

Select between 4 datasets:

* `:3000/webgl?data=saureus` - a dataset with MLST data of `S.aureus`
* `:3000/webgl?data=pyogenes` - a dataset with MLST data of `S.pyogenes`
* `:3000/webgl?data=spneumo` - a dataset with MLST data of `S.pneumoniae`
* `:3000/webgl?data=sample` - a dataset with sample data

* webgl can be changed by svg