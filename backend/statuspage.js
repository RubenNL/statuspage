const fs=require('fs')
let actions=require('./config.json');
const modules=require('./tasks');
function parseActions(actions,trace) {
	return actions.map((action,id) => {
		if(!action.data) action.data = modules[action.module](action.args);
		if(action.after) action.after=parseActions(action.after,[...trace,id]);
		action.trace=JSON.stringify([...trace,id]);
		action.status="PENDING";
		return action;
	})
}
actions=parseActions(actions,[]);
const server=require('http').createServer(function (req, res) {
	fs.readFile(__dirname + "/dist/"+ req.url, function (err,data) {
		if (err) {
			res.writeHead(301,{'Location': '/index.html'});
			res.end();
			return;
		}
		res.writeHead(200);
		res.end(data);
	});
});
server.listen(8080);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
wss.on('connection', function connection(ws) {
	ws.oldSend=ws.send;
	ws.send=data=>ws.oldSend(JSON.stringify(data));
	ws.send({type:'modules',modules:Object.keys(modules)});
	ws.send({type:'actions',actions});
	function cancelActions(actions,trace) {
		actions.map((task,id)=>{
			ws.send({type:"status",name:task.data.name,trace:[...trace,id],status:"CANCELLED"})
			if(task.after) cancelActions(task.after,[...trace,id])
		})
	}
	function doActionList(actions,outsideTrace) {
		actions=actions.map((task,id)=>{
			const trace=[...outsideTrace,id];
			ws.send({type:"status",trace,status:"STARTED"})
			return task.data.call().then(response=>{
				ws.send({type:"status",trace,status:"SUCCESS",response})
				return task.after?doActionList(task.after,trace):null;
			},err=>{
				ws.send({type:"status",trace,status:"ERROR",response:err})
				return task.after?cancelActions(task.after,trace):null;
			})
		})
		return Promise.allSettled(actions);
	}
	doActionList(actions,[]).then(()=>ws.send('DONE'));
});
