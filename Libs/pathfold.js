// pathfold.js
// $text is available automatically
let path = $text;

// Remove the filename by finding the last slash
let folderPath = path.substring(0, path.lastIndexOf('/') + 1);

return folderPath;
