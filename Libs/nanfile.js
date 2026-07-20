// nanfile.js
// $text is the input, e.g., "file.json"

// Method: Find the position of the last dot
let fileName = $text;
let lastDotIndex = fileName.lastIndexOf('.');

// If a dot exists, slice the string; otherwise return the original string
let result = (lastDotIndex !== -1) ? fileName.substring(0, lastDotIndex) : fileName;

return result;
