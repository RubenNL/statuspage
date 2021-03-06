const net=require('net')
module.exports=function({host, port}) {
	const call=()=>new Promise(function(resolve, reject) {
		const timer = setTimeout(function() {
			reject("timeout");
			socket.end();
		}, 10000);
		const socket = net.createConnection(port, host, function() {
			clearTimeout(timer);
			resolve();
			socket.end();
		});
		socket.on('error', function(err) {
			clearTimeout(timer);
			reject(err);
		});
	});
	return {
		call,
		name: `TCP on ${host}:${port}`,
	}
}
module.exports.help={
	host:"server to test",
	port:{hint:"port to check",type:"port"},
}
module.exports.info="Do a TCP port check"