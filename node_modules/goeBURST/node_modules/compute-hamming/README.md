Hamming Distance
===
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependencies][dependencies-image]][dependencies-url]

> Computes the [Hamming distance](http://en.wikipedia.org/wiki/Hamming_distance) between two sequences.

In [information theory](http://en.wikipedia.org/wiki/Information_theory), the Hamming distance is number of differences between two sequences of the same length. These sequences may be represented as character strings, binary strings, or arrays.


## Installation

``` bash
$ npm install compute-hamming
```

For use in the browser, use [browserify](https://github.com/substack/node-browserify).


## Usage


``` javascript
var hamming = require( 'compute-hamming' );
```


#### hamming( a, b[, accessor] )

Computes the [Hamming distance](http://en.wikipedia.org/wiki/Hamming_distance) between two sequences. The sequences must be either both equal length `strings` or equal length `arrays`.

``` javascript
var a = 'this is a string.',
	b = 'thiz iz a string.';

var dist = hamming( a, b );
// returns 2

var c = [ 5, 23, 2, 5, 9 ],
	d = [ 3, 21, 2, 5, 14 ];

dist = hamming( c, d );
// returns 3
```

To compute the [Hamming distance](http://en.wikipedia.org/wiki/Hamming_distance) between nested `array` values, provide an accessor `function` for accessing `array` values.

``` javascript
var a = [
	{'x':2},
	{'x':4},
	{'x':5},
	{'x':3},
	{'x':8},
	{'x':2}
];

var b = [
	[1,3],
	[2,1],
	[3,5],
	[4,3],
	[5,7],
	[6,2]
];

function getValue( d, i, j ) {
	if ( j === 0 ) {
		return d.x;
	}
	return d[ 1 ];
}

var dist = hamming( a, b, getValue );
// returns 3
```

The accessor `function` is provided three arguments:

-	__d__: current datum.
-	__i__: current datum index.
-	__j__: sequence index; e.g., sequence `a` has index `0` and sequence `b` has index `1`. 


## Examples

To run the example code from the top-level application directory,

``` bash
$ node ./examples/index.js
```


## Tests

### Unit

Unit tests use the [Mocha](http://mochajs.org) test framework with [Chai](http://chaijs.com) assertions. To run the tests, execute the following command in the top-level application directory:

``` bash
$ make test
```

All new feature development should have corresponding unit tests to validate correct functionality.


### Test Coverage

This repository uses [Istanbul](https://github.com/gotwarlost/istanbul) as its code coverage tool. To generate a test coverage report, execute the following command in the top-level application directory:

``` bash
$ make test-cov
```

Istanbul creates a `./reports/coverage` directory. To access an HTML version of the report,

``` bash
$ make view-cov
```


---
## License

[MIT license](http://opensource.org/licenses/MIT).


## Copyright

Copyright &copy; 2014-2015. Athan Reines.


[npm-image]: http://img.shields.io/npm/v/compute-hamming.svg
[npm-url]: https://npmjs.org/package/compute-hamming

[travis-image]: http://img.shields.io/travis/compute-io/hamming/master.svg
[travis-url]: https://travis-ci.org/compute-io/hamming

[coveralls-image]: https://img.shields.io/coveralls/compute-io/hamming/master.svg
[coveralls-url]: https://coveralls.io/r/compute-io/hamming?branch=master

[dependencies-image]: http://img.shields.io/david/compute-io/hamming.svg
[dependencies-url]: https://david-dm.org/compute-io/hamming

[dev-dependencies-image]: http://img.shields.io/david/dev/compute-io/hamming.svg
[dev-dependencies-url]: https://david-dm.org/dev/compute-io/hamming

[github-issues-image]: http://img.shields.io/github/issues/compute-io/hamming.svg
[github-issues-url]: https://github.com/compute-io/hamming/issues
