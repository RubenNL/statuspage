const fs=require('fs')
const modules=require('./modules');
try {
	fs.readFileSync('./config/config.json','utf8')
} catch (e) {
	fs.writeFileSync('./config/config.json',fs.readFileSync('./default.json','utf8'),'utf8');
}
//---- add default module config
(()=>{
	const data = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'))
	let shouldSave=false;
	Object.keys(modules).forEach(moduleKey=>{
		if(modules[moduleKey].defaultConfig&&!data.moduleConfig[moduleKey]) {
			shouldSave=true;
			data.moduleConfig[moduleKey]=modules[moduleKey].defaultConfig;
		}
	})
	if (shouldSave) fs.writeFileSync('./config/config.json', JSON.stringify(data, null, 2));
})();
//---- end add default module config

function getConfig() {
	function parseActions(actions,trace) {
		return actions.map((action,id) => {
			if(!action.data) action.data = modules[action.module](action.args,data.moduleConfig[action.module]);
			if(action.after) action.after=parseActions(action.after,[...trace,id]);
			else action.after=[];
			action.trace=JSON.stringify([...trace,id]);
			action.status="PENDING";
			action.childError=false;
			return action;
		})
	}
	const data=JSON.parse(fs.readFileSync('./config/config.json','utf8'));
	data.actions=parseActions(data.actions,[]);
	return data;
}
const server=require('http').createServer(function (req, res) {
	req.data='';
	req.on('data',chunk=>req.data+=chunk);
	req.on('end',()=> {
		if(req.url==="/api/modules") res.end(JSON.stringify(Object.fromEntries(Object.entries(modules).map(module=>[module[0],{help:module[1].help,info:module[1].info}]))));
		else if(req.data==="") fs.readFile(__dirname + "/dist/" + req.url.split('?')[0], function (err, data) {
			if (err) {
				res.writeHead(301, {'Location': '/index.html'});
				res.end();
				return;
			}
			res.writeHead(200);
			res.end(data);
		})
		else {
			let data;
			try {data=JSON.parse(req.data)}
			catch(e) {
				res.writeHead(400);
				res.end("INVALID JSON!");
				return;
			}
			if(!data.moduleConfig) data.moduleConfig=JSON.parse(fs.readFileSync('./config/config.json','utf8')).moduleConfig;
			fs.writeFileSync('./config/config.json',JSON.stringify(data,null,2));
			res.end("saved!")
		}
	})
});
server.listen(8080);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
wss.on('connection', function connection(ws) {
	const config=getConfig();
	ws.oldSend=ws.send;
	ws.send=data=>ws.oldSend(JSON.stringify(data));
	ws.send({type:'actions',actions:config.actions});
	function cancelActions(actions,trace) {
		actions.map((task,id)=>{
			ws.send({type:"status",name:task.data.name,trace:[...trace,id],status:"CANCELLED"})
			if(task.after) cancelActions(task.after,[...trace,id])
		})
	}
	function sendStatus(trace,status,response) {
		ws.send({type:"status",trace,status,response})
	}
	function doActionList(actions,outsideTrace,response) {
		actions=actions.map((task,id)=>{
			const trace=[...outsideTrace,id];
			sendStatus(trace,"STARTED","active...")
			return task.data.call(response).then(response=>{
				sendStatus(trace,"SUCCESS",response)
				return task.after?doActionList(task.after,trace,response):null;
			},err=>{
				sendStatus(trace,"ERROR",err)
				return task.after?cancelActions(task.after,trace):null;
			})
		})
		return Promise.allSettled(actions);
	}
	doActionList(config.actions,[]).then(()=>ws.send('DONE'));
});
