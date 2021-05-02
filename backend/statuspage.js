const fs=require('fs')
const modules=require('./modules');
try {
	fs.readFileSync('./config/config.json','utf8')
} catch (e) {
	fs.writeFileSync('./config/config.json',fs.readFileSync('./default.json','utf8'),'utf8');
}
function parseActions(actions,trace) {
	return actions.map((action,id) => {
		if(!action.data) action.data = modules[action.module](action.args);
		if(action.after) action.after=parseActions(action.after,[...trace,id]);
		action.trace=JSON.stringify([...trace,id]);
		action.status="PENDING";
		return action;
	})
}
getConfig=()=>parseActions(JSON.parse(fs.readFileSync('./config/config.json','utf8')),[]);
const server=require('http').createServer(function (req, res) {
	req.data='';
	req.on('data',chunk=>req.data+=chunk);
	req.on('end',()=> {
		if(req.data==="") fs.readFile(__dirname + "/dist/" + req.url, function (err, data) {
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
	ws.send({type:'modules',modules:Object.fromEntries(Object.entries(modules).map(module=>[module[0],{help:module[1].help,info:module[1].info}]))});
	ws.send({type:'actions',actions:config});
	function cancelActions(actions,trace) {
		actions.map((task,id)=>{
			ws.send({type:"status",name:task.data.name,trace:[...trace,id],status:"CANCELLED"})
			if(task.after) cancelActions(task.after,[...trace,id])
		})
	}
	function sendStatus(trace,status,response) {
		ws.send({type:"status",trace,status,response})
	}
	function doActionList(actions,outsideTrace) {
		actions=actions.map((task,id)=>{
			const trace=[...outsideTrace,id];
			sendStatus(trace,"STARTED","active...")
			return task.data.call().then(response=>{
				sendStatus(trace,"SUCCESS",response)
				return task.after?doActionList(task.after,trace):null;
			},err=>{
				sendStatus(trace,"ERROR",err)
				return task.after?cancelActions(task.after,trace):null;
			})
		})
		return Promise.allSettled(actions);
	}
	doActionList(config,[]).then(()=>ws.send('DONE'));
});
