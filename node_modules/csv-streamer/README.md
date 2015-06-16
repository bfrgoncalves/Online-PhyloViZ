CSV-streamer
---------------

This is code for reading CSV files. It is very simple and only tries to fill one single need : if someone hands you a CSV file and you
want to read it into your code for further processing.

It has no dependencies, except for [Mocha](http://visionmedia.github.io/mocha/) if you want to run the tests.

The API is designed as a readable and writeable stream, making it possible to use it as part of a "pipe"-chain. Other benefits are great performance
and simple but flexible interface.

Installing
----------

    npm install csv-streamer


Usage
-----
Usually you just want to load that CSV-file :

```javascript
var fs=require('fs');
var CSVStream=require('csv-streamer');
var csv=new CSVStream({headers:true});

csv.on('data',function(line){
	//do something with the data
});
fs.createReadStream('file.csv').pipe(csv);

```

CSV files can be with or without a leading line with names of columns (headers). The default is no headers and in that case each data-callback
will provide you with an array of the values of each line. If headers are available it will instead contain an object with the values as named
properties.

If you need to know the names of the headers, you can listen for the "headers" event, it will provide you with an array of the names.

Should you have the need for parsing tab separated files or something even more wicked, you can pass a custom delimiter as part of the options
object :

```javascript
var csv=new CSVStream({headers:true,delimiter:'\t'});
```

If you are so unlucky that you have CSV in a string only, you should look into wrapping the string in a stream API and then pipe that into the
CSV stream. Something like [this](http://technosophos.com/content/using-string-stream-reader-nodejs) (not tested).

You can also have a look at the test folder to see some examples of using the API.

In my testing it seems to be around 33% faster compared to [node-csv](https://github.com/voodootikigod/node-csv) code by [Chris Williams](https://github.com/voodootikigod).

Other
-----
Made by Alex Scheel Meyer. Released to the public domain.

Uses CSVToArray function by [Ben Nadel](http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm)

Inspired by the [node-csv](https://github.com/voodootikigod/node-csv) code by [Chris Williams](https://github.com/voodootikigod)

Also see [csv-stream](https://github.com/lbdremy/node-csv-stream)
 