#Online PhyloViZ

This web application allows the analysis of sequence based typing methods that generate allelic profiles and their associated epidemiological data. It creates minimum spanning trees using the goeBURST algorithm (http://www.biomedcentral.com/1471-2105/10/152) which are then rendered using a force directed layout and WebGl.

Node.js and mongoDB is required.

Launch the application
======================

`node app` and in your browser listen on port `3000`

Configure postgreSQL
=================

- create a database with the name phyloviz
- create the schema "datasets"
- run the node application
- init tables at "http://localhost:3000/api/db/postgres/init"