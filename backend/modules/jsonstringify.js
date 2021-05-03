module.exports=function() {
	const call=data=>new Promise((resolve,reject)=>{
		try {
			resolve(JSON.stringify(data));
		} catch(e) {
			reject(e.toString());
		}
	})
	return {
		call,
		name: `stringify json`,
	}
}
module.exports.help={}
module.exports.info="stringifies json"
