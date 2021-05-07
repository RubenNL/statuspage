const modules=require('./modules');
const WebSocket = require('ws');
const {getConfig}=require('./configinit')
module.exports=server=>(new WebSocket.Server({ server })).on('connection', function connection(ws) {
	function getParsedConfig() {
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
		const data=getConfig();
		data.actions=parseActions(data.actions,[]);
		return data;
	}
	const config=getParsedConfig();
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