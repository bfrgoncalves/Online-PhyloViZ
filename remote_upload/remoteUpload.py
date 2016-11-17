import subprocess
import argparse
import os
import shutil
from os import listdir
from os.path import isfile, join, isdir
import sys
from datetime import datetime
import json
from StringIO import StringIO
import random, string


def main():

	parser = argparse.ArgumentParser(description="This program performs remote upload of data sets to the PHYLOViZ Online application")
	parser.add_argument('-u', nargs='?', type=str, help="username", required=False)
	parser.add_argument('-p', nargs='?', type=str, help="password", required=False)
	parser.add_argument('-t', nargs='?', type=str, help="user cookie", required=False)
	parser.add_argument('-e', nargs='?', type=bool, help="Make public", required=False, default=False)
	parser.add_argument('-l', nargs='?', type=bool, help="Public Link", required=False, default=False)
	parser.add_argument('-sdt', nargs='?', type=str, help='Sequence data type (newick, profile, fasta)', required=True)
	parser.add_argument('-sd', nargs='?', type=str, help='Sequence data', required=True)
	parser.add_argument('-m', nargs='?', type=str, help="Metadata", required=False)
	parser.add_argument('-d', nargs='?', type=str, help="Dataset name", required=True)
	parser.add_argument('-dn', nargs='?', type=str, help="Description", required=False)
	parser.add_argument('-root', nargs='?', type=str, help="root of the application", required=False, default="https://online.phyloviz.net")
	parser.add_argument('-cd', nargs='?', type=str, help="Cookie domain", required=False, default="https://online.phyloviz.net")
	parser.add_argument('-mc', nargs='?', type=str, help="Missings Character (defaults to None)", required=False, default=False)
	parser.add_argument('-mt', nargs='?', type=str, help="Missing threshold (defaults to None)", required=False, default=False)
	parser.add_argument('-pid', nargs='?', type=str, help="Parent dataset identifier (Defaults to None)", required=False, default=False)
	parser.add_argument('-am', nargs='?', type=str, help="Analysis Method in case of Profile Data (defaults to core) options: core; pres-abs (presence/absence)", required=False, default='core')

	args = parser.parse_args()

	currentRoot = args.root
	outRoot = args.cd

	def randomword(length):
	   return ''.join(random.choice(string.lowercase) for i in range(length))
	

	onqueue = 'false'

	if (not args.u or not args.u) and not args.t:
		print 'message:' + 'No credentials'
		sys.exit()

	checkDatasets(args, currentRoot)
	dataset = remoteUpload(args, currentRoot)
	if not "datasetID" in dataset:
		sys.exit()

	if dataset["numberOfProfiles"] > 300 or dataset["profileLength"] > 100:
		onqueue = 'true'
	
	goe_message = rungoeBURST(args, dataset['datasetID'], currentRoot, onqueue)

	if not args.e and args.l:
		sharableLink = generatePublicLink(args, dataset['datasetID'], currentRoot)
		print 'Sharable link: ' + sharableLink['url']
		sys.exit()


	print 'datasetID:' + str(dataset['datasetID'])
	
	if 'queue' in goe_message:
		print 'message:' + goe_message['queue'] + '\n'
		print 'code:queue'
		print 'jobid:' + str(goe_message['jobid'])
	elif args.e:
		print 'code:complete'
		print 'message:' + "\nAccess the tree at: " + outRoot + '/main/dataset/' + dataset['datasetID']
	elif not args.e:
		print 'code:complete'
		print 'message:' +  "\nLogin to PHYLOViZ Online and access the tree at: " + outRoot + '/main/dataset/' + dataset['datasetID']


def login(args, currentRoot): #Required before each of the tasks

	bashCommand = 'curl --cookie-jar jarfile --data username='+ args.u + '&' + 'password=' + args.p + ' ' +currentRoot+'/users/api/login'
	process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
	output = process.communicate()[0]
	if output == 'Unauthorized':
		print output
		sys.exit()


def checkDatasets(args, currentRoot): #Check if the database name to upload exists
	print 'Checking if dataset name exists...'
	if not args.t:
		login(args, currentRoot)
		bashCommand = 'curl --cookie jarfile -X GET '+currentRoot+'/api/db/postgres/find/datasets/name?name='+ args.d
	else:
		print args.t
		#with open(cookie_file, 'w') as f:
			#f.write(args.root+'\tTRUE\t/\tFALSE\t0\t' + args.t.split('=')[0] + '\t' + args.t.split('=')[1])
		bashCommand = 'curl --cookie '+args.t+' -X GET '+currentRoot+'/api/db/postgres/find/datasets/name?name='+ args.d
	
	process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
	output = process.communicate()[0]
	io = StringIO(output)
	existingdatasets = json.load(io)

	if len(existingdatasets['userdatasets']) > 0:
		print 'message:' + 'dataset name already exists'
		print 'code:exists'
		sys.exit()

def remoteUpload(args, currentRoot): #upload the input files to the database
	print 'Uploading files...'

	if not args.t:
		login(args, currentRoot)

	addMetadata = ''

	sequenceType = args.sdt
	sequenceData = args.sd

	dataToAdd = ''

	if args.sdt == 'newick':
		dataToAdd = '-F fileNewick=@'+ args.sd
	elif args.sdt == 'fasta':
		dataToAdd = '-F fileFasta=@'+ args.sd
	else:
		dataToAdd = '-F fileProfile=@'+ args.sd

	if args.m:
		metadata = args.m
		numberOfFiles = 2
		addMetadata = '-F fileMetadata=@'+ metadata
	else:
		numberOfFiles = 1
	datasetName = args.d
	if args.dn:
		description = args.dn
	else:
		description = ''

	if args.e:
		makePublic = 'true'
	else:
		makePublic = 'false'
	
	if not args.t:
		bashCommandUpload = 'curl --cookie jarfile \
					  -F datasetName='+ datasetName +' \
					  -F dataset_description='+ description +' \
					  -F makePublic='+ makePublic +' \
					  ' + dataToAdd + ' \
					  ' + addMetadata + ' \
					  -F numberOfFiles='+ str(numberOfFiles) +' \
					  '+currentRoot+'/api/db/postgres/upload'
	else:
		bashCommandUpload = 'curl --cookie '+args.t+' \
					  -F datasetName='+ datasetName +' \
					  -F dataset_description='+ description +' \
					  -F makePublic='+ makePublic +' \
					  ' + dataToAdd + ' \
					  ' + addMetadata + ' \
					  -F numberOfFiles='+ str(numberOfFiles) +' \
					  '+currentRoot+'/api/db/postgres/upload'

	process = subprocess.Popen(bashCommandUpload.split(), stdout=subprocess.PIPE)
	output = json.loads(process.communicate()[0])

	if "errorMessage" in output:
		print 'message:' + output["errorMessage"]
		print 'code:uploaderror'
		sys.exit()

	return output

def rungoeBURST(args, datasetID, currentRoot, onqueue): #run the goeBURST algorithm to store the links in the database
	
	if args.mt:
		missing_T = args.mt
	else:
		missing_T = 0

	if args.pid:
		parent_id = args.pid
	else:
		parent_id = 'false'

	if not args.t:
		login(args, currentRoot)
		print 'Running goeBURST...'
		if args.mc == False:
			bashCommand = 'curl --cookie jarfile -X GET '+currentRoot+'/api/algorithms/goeBURST?dataset_id='+ datasetID + '&save=true&analysis_method=' + args.am + '&onqueue=' + onqueue + '&parent_id=' + parent_id
		else:
			bashCommand = 'curl --cookie jarfile -X GET '+currentRoot+'/api/algorithms/goeBURST?dataset_id='+ datasetID + '&save=true&missings=true&missingchar=' + str(args.mc) + '&analysis_method=' + args.am + '&missing_threshold='+str(missing_T)+'&onqueue=' + onqueue + '&parent_id=' + parent_id
	else:
		print 'Running goeBURST...'
		print 'cookie'
		if args.mc == False:
			bashCommand = 'curl --cookie '+args.t+' -X GET '+currentRoot+'/api/algorithms/goeBURST?dataset_id='+ datasetID + '&save=true&analysis_method=' + args.am + '&onqueue=' + onqueue + '&parent_id=' + parent_id
		else:
			bashCommand = 'curl --cookie '+args.t+' -X GET '+currentRoot+'/api/algorithms/goeBURST?dataset_id='+ datasetID + '&save=true&missings=true&missingchar=' + str(args.mc) + '&analysis_method=' + args.am + '&missing_threshold='+str(missing_T)+'&onqueue=' + onqueue + '&parent_id=' + parent_id
		
		process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
		output = json.loads(process.communicate()[0])

	return output

	#print output


def generatePublicLink(args, datasetID, currentRoot):

	print 'Generating Sharable Link...'

	if not args.t:
		login(args, currentRoot)
		#make data set visible	
		bashCommand = 'curl --cookie jarfile -X PUT -d dataset_id='+ datasetID + ' -d change=true '+currentRoot+'/api/db/postgres/update/all/is_public'
	else:
		bashCommand = 'curl --cookie '+args.t+' -X PUT -d dataset_id='+ datasetID + ' -d change=true '+currentRoot+'/api/db/postgres/update/all/is_public'
	
	process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
	output = process.communicate()[0]

	if not args.t:
		login(args, currentRoot)
		#get sharable link
		bashCommand = 'curl --cookie jarfile -X GET '+currentRoot+'/api/utils/publiclink?dataset_id='+ datasetID
	else:
		bashCommand = 'curl --cookie '+args.t+' -X GET '+currentRoot+'/api/utils/publiclink?dataset_id='+ datasetID
	
	process = subprocess.Popen(bashCommand.split(), stdout=subprocess.PIPE)
	output = json.loads(process.communicate()[0])
	
	return output


if __name__ == "__main__":
    main()
