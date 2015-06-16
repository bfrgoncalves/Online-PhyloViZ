import os
from sys import platform as _platform

print _platform

if _platform == "linux" or _platform == "linux2":
	os.system('sudo apt-get update')
	os.system('sudo apt-get install -y mongodb-org')
	
	print 'Mongo Installed!'
    # linux
elif _platform == "darwin":
    # OS X
    os.system('curl -O https://fastdl.mongodb.org/osx/mongodb-osx-x86_64-3.0.4-rc0.tgz')
    os.system('tar -zxvf mongodb-osx-x86_64-3.0.4-rc0.tgz')
    os.system('mkdir -p mongodb')
    os.system('cp -R -n mongodb-osx-x86_64-3.0.4-rc0/ mongodb')
    os.system('export PATH=<mongodb-install-directory>/bin:$PATH')
    os.system('mkdir -p /data/db')
    
    print 'Mongo Installed!'
elif 'win' in _platform:
	print 'not supported for Windows'

