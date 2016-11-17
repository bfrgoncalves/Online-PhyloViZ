/**
*
*	VALIDATE: string
*
*
*	DESCRIPTION:
*		- Validates if a value is a string.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2014.
*
*/

'use strict';

/**
* FUNCTION: isString( value )
*	Validates if a value is a string.
*
* @param {*} value - value to be validated
* @returns {Boolean} boolean indicating whether value is a string
*/
function isString( value ) {
	return typeof value === 'string' || Object.prototype.toString.call( value ) === '[object String]';
} // end FUNCTION isString()


// EXPORTS //

module.exports = isString;
