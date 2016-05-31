
##PHYLOViZ Online Remote Upload

PHYLOViZ Online allow users to remotely upload their datasets without accessing to the graphical interface of the application by its *RESTful API*. Users can perform the requests themselves or they can use two Python scripts that merge all the necessary requests to create and visualize a PHYLOViZ Online dataset. Those scripts are available at https://github.com/bfrgoncalves/Online-PhyloViZ/tree/master/remote_upload, which can facilitate the integration with other applications.

##Registration

To upload data to the application, users need to be registered. This step can be made directly in the graphical interface at https://online.phyloviz.net/users/register or using the *RESTful API*. Registration requires a POST request with the following parameters:

 - username - [STR] required.
 - password - [STR] required.
 - email - [STR] required.
 - encrypt - [TRUE] required.

###Example

    #Using curl
    
    curl –-data username=[test_user]&password=[test_pass]&email=[test_email]&encrypt=[True] https://online.phyloviz.net/users/register
    
    #Replace all text between [] inclusive

Registration can be easily made using ***phyloviz_register.py***, a script that performs the registration without interact directly with the RESTful API.
Required parameters:

 - **-u** : Username. Required = True
 - **-p** : Password.  Required = True
 - **-e** : Email. Required = True
 - **-c** : Encrypt. Required = True

###Example

    #Using python_register.py
    
    python python_register.py -u [username] -p [password] -e [email] -c
    
    #Replace all text between [] inclusive


##Remote Upload

After registration, users can now remotely upload data to PHYLOViZ Online. This procedure is not a single task but a series of requests. The upload depends on: ***Login***, ***Name Checking***, ***Data Upload***, and ***goeBURST***. To be able to produce the PHYLOViZ Online data set, all these steps are necessary. To facilitate the integration with other applications, we have developed a python script that allows to perform all these steps without interact with the *RESTful API*, the ***remoteUpload.py***. The script uses the following parameters:

 - **-u** : Username[STR] Required=True.
 - **-p** : Password[STR] Required=True.
 - **-e** : Make Public[presence/absence] Default=False.
 - **-sdt** : Sequence data type[profile] Required=True.
 - **-sd** : Profile data[path/to/profile/data/file] Required=True.
 - **-m** : Metadata [path/to/metadata/file] Required=False.
 - **-d** : Dataset name[STR] Required=True.
 - **-dn** : Description[STR] Required=False.

###Example

    #Using remoteUpload.py
    
    python remoteUpload.py -u [username] -p [password] -sdt [profile/newick/fasta] -sd [path/to/profile/data/file] -d [dataset_name] -dn [description] -m [path/to/metadata/file]
    
    #Replace all text between [] inclusive

The different steps are explained in the following sections, in case of users that want to interact directly with the RESTful API.

###Upload steps

### - Login

To upload data to the application, users need to be logged in. This step can be made directly in the graphical interface at https://online.phyloviz.net/users/login or using the *RESTful API*. Login requires a GET request with the following parameters:

 - username - [STR] required.
 - password - [STR] required.

####Example

    #Using curl
    
    curl --cookie-jar jarfile --data username=[username]&password=[password] https://online.phyloviz.net/users/login
    
    #Replace all text between [] inclusive

The creation of the cookie file is necessary in order to proceed with the next requests, as it is the way to access to the user account.

**NOTE:** The login is necessary before each request since the cookie file has a span life of 1.

### - Check Data set Name

It is not possible to have two data sets with the same name on each user account. Users can check for that using the RESTful API to search for the desired data set name using the ***/api/db/postgres/find/:table/:field*** path.

 - ***/api/db/postgres/find/datasets/name*** : returns all public data set names (if not logged in) or the public + user datasets (if logged in).
 - ***api/db/postgres/find/datasets/name?name=sample%20dataset*** : returns all public data set names (if not logged in) or the public + user datasets (if logged in) where the data set name is *sample dataset*.
 
####Example

    #Using curl
    #Perform the login step first
    
    curl --cookie jarfile -X GET https://online.phyloviz.net/api/db/postgres/find/datasets/name?name=sample%20dataset
    #Uses the cookie file obtained after the login and searches for data sets with the "sample dataset" name in that user account.


### - Data Upload

After checking if the name exists, users can upload data. This can be made using a POST request to the https://online.phyloviz.net/api/db/postgres/upload path.

Required arguments:

 - **datasetName** : Name of the data set [STR].
 - **dataset_description** : Data set description [STR].
 - **makePublic** : Set the data as public [true/false].
 - **fileProfile** : Path to the profile file [path/to/file].
 - **numberOfFiles** : Number of files to upload [1(case only profile)/2(profile+metadata)].

Optional arguments:

 - **fileMetadata** : Path to the metadata file [path/to/file].

**fileProfile** and **fileMetadata** are paths to tab delimited files containing information about allelic profiles and their metadata, respectively. The first column header of the profile file **MUST** be equal to one of the columns of the metadata so that link between the two files is possible.

####Example

    #Using curl
    #Perform the login step first
    
    curl --cookie jarfile \
		-F datasetName=[datasetName] \
		-F dataset_description=[dataset_description] \
		-F makePublic=[true/false] \
		-F fileProfile=@[path/to/profile/file] \
		-F fileMetadata=@[path/to/metadata/file] \
		-F numberOfFiles=[1(case only profile)/2(profile+metadata)] \
		https://online.phyloviz.net/api/db/postgres/upload'
		
	#Replace all text between [] inclusive

This step will save the data in PHYLOViZ Online database. However, to be able to visualize the Minimum Spanning Tree, we need to run the goeBURST algorithm.
 
###- Run goeBURST
 
 Users can run goeBURST directly with the RESTful API to obtain he links between profiles. This can be made with a GET request to the https://online.phyloviz.net/api/algorithms/goeBURST path.

Required arguments:

 - **dataset_id** : Id of the data set in the application. Can be found by performing a query to the ***/api/db/postgres/find/dataset_id?name=[query_dataset_name]***
 - save : true or false. Tells to save the results from goeBURST into PHYLOViZ Online database.

####Example

    #Using curl
    #Perform the login step first

	curl --cookie jarfile -X GET https://online.phyloviz.net/api/algorithms/goeBURST?dataset_id=cfa81215a2ce3fd3c8cb03c71d7ab342bf03fa8a9910ed7e&save=true
	
	#Runs the goeBURST algorithm on the "sample dataset", which is available at the public data sets of the application.
    

> Written with [StackEdit](https://stackedit.io/).