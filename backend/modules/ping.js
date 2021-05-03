const spawn = require('child_process').spawn;
module.exports=function({host}) {
	const call=()=>new Promise((resolve,reject)=>{
		let data='';
		const ping=spawn('ping',[host,'-c1'])
		ping.stdout.on('data',chunk=>data+=chunk)
		ping.stderr.on('data',chunk=>data+=chunk)
		ping.on('close',code=>{
			if(code===0) resolve(data);
			else reject(data);
		})
	})
	return {
		call,
		name: `ping ${host}`,
	}
}
module.exports.help={
	host:"server to test",
}
module.exports.info="Do a ping check"
