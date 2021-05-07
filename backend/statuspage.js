const {getConfig,saveConfig}=require('./configinit');
const modules=require('./modules');
const express=require('express');
const app=express()
app.use(express.json());
app.get("/api/modules",(req,res)=> {
	res.end(JSON.stringify(Object.fromEntries(Object.entries(modules).map(module => [module[0], {
		help: module[1].help,
		info: module[1].info
	}]))));
});
app.post("/api/save",(req,res)=>{
	const data=req.body;
	if(!data.moduleConfig) data.moduleConfig=getConfig().moduleConfig;
	saveConfig(data);
	res.end("saved!")
});
app.use(express.static('dist'))
app.get('/*',(req,res)=>res.redirect('/index.html'));
const server=require('http').createServer(app);
require('./wsserver')(server);

server.listen(8080)