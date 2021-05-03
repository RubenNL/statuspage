module.exports=function({url}) {
	const module=url.split(':')[0]==="http"?require('http'):require('https');
	const call=()=>new Promise((resolve,reject)=>{
		module.get(url,res=>{
			let data='';
			res.on('data',chunk=>data+=chunk);
			res.on('end',()=>{
				if(res.statusCode===200) resolve(data);
				else reject({statusCode:res.statusCode,data})
			})
		})
	})
	return {
		call,
		name: `http(s) get ${url}`,
	}
}
module.exports.help={
	url:"url to get",
}
module.exports.info="http get request(also supports https)"
 
