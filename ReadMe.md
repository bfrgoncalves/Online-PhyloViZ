#Online PhyloViZ

This web application allows the analysis of sequence based typing methods that generate allelic profiles and their associated epidemiological data. It creates minimum spanning trees using the goeBURST algorithm (http://www.biomedcentral.com/1471-2105/10/152) which are then rendered using a force directed layout and WebGl.

Node.js and mongoDB is required.

Launch the application
======================

`node app` and in your browser listen on port `3000`

Configure mongoDB
=================

- change the dbpath of mongoDB to the "data/db" folder located at the application: `mongod --dbpath data/db`
- leave it running
- run the application