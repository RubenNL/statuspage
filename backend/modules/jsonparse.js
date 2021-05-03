var jp = require('jsonpath');
module.exports=function({path}) {
	const call=data=>new Promise((resolve,reject)=>{
		try {
			resolve(jp.query(JSON.parse(data),path));
		} catch(e) {
			reject(e.toString());
		}
	})
	return {
		call,
		name: `execute json path ${path}`,
	}
}
module.exports.help={
	path:"jsonpath to query",
}
module.exports.info="execute jsonpath"
