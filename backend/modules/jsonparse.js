module.exports=function() {
	const call=data=>new Promise((resolve,reject)=>{
		try {
			resolve(JSON.parse(data));
		} catch(e) {
			reject(e.toString());
		}
	})
	return {
		call,
		name: `parse json`,
	}
}
module.exports.help={}
module.exports.info="parses json"
