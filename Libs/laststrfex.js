// laststrfex.js
// $text is the input, e.g., "User.dcl.txt"

let fileName = $text;
let lastDotIndex = fileName.lastIndexOf('.');

// Check if a dot exists and is not the last character
if (lastDotIndex !== -1 && lastDotIndex < fileName.length - 1) {
    return fileName.substring(lastDotIndex + 1);
} else {
    return ""; // Return empty string if no extension exists
}
