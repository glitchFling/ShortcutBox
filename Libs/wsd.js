// WhiteSpaceDetector.js
//
// Detects if the $text is only whitespaces;
//
// Spaces and Whitespaces.

var input = (typeof $text !== 'undefined' && $text !== null) ? $text : "";

function isWhiteSpaceOnly(str) {
    return /^\s*$/.test(str);
}

return String(isWhiteSpaceOnly(input));
