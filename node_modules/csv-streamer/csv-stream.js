
// This is from : http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
	// Check to see if the delimiter is defined. If not,
	// then default to comma.
	strDelimiter = (strDelimiter || ",");

	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp(
		(
			// Delimiters.
			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

			// Quoted fields.
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

			// Standard fields.
			"([^\"\\" + strDelimiter + "\\r\\n]*))"
		),
		"gi"
		);


	// Create an array to hold our data. Give the array
	// a default empty first row.
	var arrData = [[]];
	// Create an array to hold our individual pattern
	// matching groups.
	var arrMatches = null;
	// Keep looping over the regular expression matches
	// until we can no longer find a match.
	while (arrMatches = objPattern.exec( strData )){

		// Get the delimiter that was found.
		var strMatchedDelimiter = arrMatches[ 1 ];
		// Check to see if the given delimiter has a length
		// (is not the start of string) and if it matches
		// field delimiter. If id does not, then we know
		// that this delimiter is a row delimiter.
		if (
			strMatchedDelimiter.length &&
			(strMatchedDelimiter != strDelimiter)
			){

			// Since we have reached a new row of data,
			// add an empty row to our data array.
			arrData.push( [] );
		}
		else if((arrMatches.index===0)&&(strMatchedDelimiter===strDelimiter))
			arrData[arrData.length-1].push('');		//this is to fix extra item when line starts with delimiter (thus an implicit empty item is indicated)


		// Now that we have our delimiter out of the way,
		// let's check to see which kind of value we
		// captured (quoted or unquoted).
		if (arrMatches[ 2 ]){

			// We found a quoted value. When we capture
			// this value, unescape any double quotes.
			var strMatchedValue = arrMatches[ 2 ].replace(
				new RegExp( "\"\"", "g" ),
				"\""
				);

		} else {

			// We found a non-quoted value.
			var strMatchedValue = arrMatches[ 3 ];

		}


		// Now that we have our value string, let's add
		// it to the data array.
		arrData[ arrData.length - 1 ].push( strMatchedValue );
	}

	// Return the parsed data.
	return( arrData );
}

//this is needed because the CSVToArray function fails on newlines in quoted strings
//splits string into array of lines, with last cell in array being the remainder
function splitNewlines(str){
	var inString=false;
	var parts=[];
	var lastIndex=0;
	var i=0;
	for(;i<str.length;i++){
		var c=str[i];
		if(c==='"'){
			if(inString&&(i<(str.length-2))){
				if(str[i+1]!='"')inString=!inString;
				else i++;
			}
			else inString=!inString;
		}
		else if((c==='\n')&&!inString){
			parts.push(str.substr(lastIndex,i-lastIndex));
			lastIndex=i+1;
		}
	}
	if(i!=lastIndex)parts.push(str.substr(lastIndex,i-lastIndex));

	if(str[str.length-1]==='\n')parts[parts.length-1]+='\n';	//this is to correct for the fact that a newline is lost if it is the last character in input	

	return parts;
}

//this is to create a custom constructor that hopefully will trigger the V8 "hidden classes" feature for maximum performance
function makeItem(headers){
    var setString='  if(args.length!=='+headers.length+')throw new Error("bad number of args("+args.length+")");\n';                                                                                      
	for(var h=0;h<headers.length;h++){
		var name=headers[h];
		setString+='  this["'+name+'"]=args['+h+'];\n';
	}
	return new Function('args',setString);
}


var CSVStream=module.exports=function(options){
	this.readable=true;
	this.writable=true;

	this.options={};
	options=options||{};
	this.options.delimiter=options.delimiter||',';
	this.options.headers=false;
	if(options.headers)this.options.headers=true;
	
	this.buffer='';
	this.headers=null;
	this.Item={};
}

require('util').inherits(CSVStream,require('stream'));

CSVStream.prototype.emitLine=function(line){
	var data=CSVToArray(line,this.options.delimiter)[0];

	if(this.options.headers){
		if(this.headers===null){
			this.headers=data;
			this.emit('headers',data);
			this.Item=makeItem(this.headers);
			return;
		}else{
			this.emit('data',new this.Item(data));
		}
	}
	else this.emit('data',data);
}


CSVStream.prototype.write=function(chunk){	
	var data=chunk.toString('utf8');
	this.buffer+=data;
	
	var lines=splitNewlines(this.buffer);
	if(lines.length>1){
		for(var l=0;l<(lines.length-1);l++){ 
			this.emitLine(lines[l]);
		}
		this.buffer=lines[lines.length-1];	//set buffer to remainder
	}
};

CSVStream.prototype.end=function(){
	if(this.buffer.length>0){
		this.emitLine(this.buffer);
	}

	var args=Array.prototype.slice.call(arguments,0);
	this.emit.apply(this,['end'].concat(args));
};

