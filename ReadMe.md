#Online PhyloViZ

PHYLOViZ Online is a Node.js (https://nodejs.org/) application developed in a modular perspective, separating data storage and management from data processing and visualization. It uses the goeBURST algorithm(http://bmcbioinformatics.biomedcentral.com/articles/10.1186/1471-2105-10-152) to generate a Minimmum Spanning Tree like representation, using a set of tie-break rules based on the number of locus differences for each strain. The resulting tree visualization is done using VivaGraphJS’ (https://github.com/ anvaka/VivaGraphJS) force directed layout. 
Visualization rendering is assigned to the WebGL JavaScript API, which allows visualization of thousands of nodes in the web browser by taking advantage of GPU hardware acceleration widespread in laptops and desktops. 
Tables are also generated using the DataTables (https://www.datatables.net/) JavaScript library, allowing for querying, selection and data export. 
A visual representation of multi-sequence alignment for FASTA input  les was also implemented using the BioJS MSA Viewer package (https://www.npmjs.com/package/msa), which allows to explore sequences, order and highlight regions according to data characteristics. Additional visual representations (Pie Charts and Interactive Distance Matrix) are constructed using Data Driven Documents (D3.js) (https://d3js.org/).


Features
========

- Link profile, newick or multi-fasta aligned files with auxiliary data
- Visualize a dynamic MST with up to thousands of nodes 
- Use the nLV option to link all nodes at a given distance
- Use the Split tree option to delete links above a given distance
- Select nodes and visualize a colored interactive distance matrix. Cells can be ordered according to auxiliary data
- Select nodes and visualize multi-aligned sequences (in case of FASTA files)

Launch the application
======================

Follow the steps available at steps_config_phyloviz.txt 

System Requirements
===================

- Node.js
- PostgresQL 9.4 (or above)

Contacts
========

Bruno Goncalves - bfgoncalves@medicina.pt

Joao Andre Carrico - jcarrico@medicina.ulisboa.pt