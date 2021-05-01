const fs=require('fs')
const actions=require('./config.js');
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
	ws.send({type:'actions',actions});
	function cancelActions(actions,trace) {
		actions.map(task=>{
			ws.send({type:"status",name:task.data.name,trace,status:"CANCELLED"})
			if(task.after) cancelActions(task.after,[...trace,task.data.toString])
		})
	}
	function doActionList(actions,trace) {
		actions=actions.map(task=>{
			ws.send({type:"status",name:task.data.name,trace,status:"STARTED"})
			return task.data.call().then(response=>{
				ws.send({type:"status",name:task.data.name,trace,status:"SUCCESS",response})
				return task.after?doActionList(task.after,[...trace,task.data.toString]):null;
			},err=>{
				ws.send({type:"status",name:task.data.name,trace,status:"ERROR",response:err})
				return task.after?cancelActions(task.after,[...trace,task.data.toString]):null;
			})
		})
		return Promise.allSettled(actions);
	}
	doActionList(actions,['START']).then(()=>ws.send('DONE'));
});
