set -e

mkdir -p dist/tmp
cp lib/d3.js dist/tmp/
cp dist/pathgl.js dist/tmp/pathgl.js
zip dist/pathgl.zip dist/tmp/
echo 'zipped!'
