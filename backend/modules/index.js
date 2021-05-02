const normalizedPath = require("path").join(__dirname);
const returns={}
require("fs").readdirSync(normalizedPath).forEach(function(file) {
	if(file==="index.js") return;
	returns[file.split('.')[0]]=require("./" + file);
});
module.exports=returns;