'use strict';

// MODULES //

var isArray = require( 'validate.io-array' ),
	isString = require( 'validate.io-string' ),
	isFunction = require( 'validate.io-function' );


// HAMMING DISTANCE //

/**
* FUNCTION: hamming( a, b, accessor )
*	Computes the Hamming distance between two sequences.
*
* @param {String|Array} a - array or string sequence
* @param {String|Array} b - array or string sequence
* @param {Function} [accessor] - accessor function for accessing array values
* @returns {Number} Hamming distance
*/
function hamming( a, b, clbk ) {
	var aType = isString( a ),
		bType = isString( b ),
		len,
		d, i;

	if ( !isArray( a ) && !aType ) {
		throw new TypeError( 'hamming()::invalid input argument. Sequence must be either an array or a string. Value: `' + a + '`.' );
	}
	if ( !isArray( b ) && !bType ) {
		throw new TypeError( 'hamming()::invalid input argument. Sequence must be either an array or a string. Value: `' + b + '`.' );
	}
	if ( aType !== bType ) {
		throw new TypeError( 'hamming()::invalid input arguments. Sequences must be the same type; i.e., both strings or both arrays.' );
	}
	if ( arguments.length > 2 ) {
		if ( !isFunction( clbk ) ) {
			throw new TypeError( 'hamming()::invalid input argument. Accessor must be a function. Value: `' + clbk + '`.' );
		}
	}
	len = a.length;
	if ( len !== b.length ) {
		throw new Error( 'hamming()::invalid input arguments. Sequences must be the same length.' );
	}
	d = 0;
	if ( clbk ) {
		for ( i = 0; i < len; i++ ) {
			if ( clbk( a[i], i, 0 ) !== clbk( b[i], i, 1 ) ) {
				d += 1;
			}
		}
	} else {
		for ( i = 0; i < len; i++ ) {
			if ( a[ i ] !== b[ i ] ) {
				d += 1;
			}
		}
	}
	return d;
} // end FUNCTION hamming()


// EXPORTS //

module.exports = hamming;
