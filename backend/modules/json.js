module.exports=function(config) {
	const call=data=>new Promise((resolve,reject)=>{
		try {
			if(config.task==="stringify") resolve(JSON.stringify(data));
			if(config.task==="parse") resolve(JSON.parse(data));
		} catch(e) {
			reject(e.toString());
		}
	})
	return {
		call,
		name: `${config.task} json`,
	}
}
module.exports.help={
	"task":{
		"type":"select",
		"items":["stringify","parse"],
		"hint":"json action",
	},
}
module.exports.info="parses or stringifies json"
