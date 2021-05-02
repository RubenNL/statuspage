const net=require('net')
module.exports=function({host, port}) {
	const call=()=>new Promise(function(resolve, reject) {
		var timer = setTimeout(function() {
			reject("timeout");
			socket.end();
		}, 10000);
		var socket = net.createConnection(port, host, function() {
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
	port:"port to check",
}
module.exports.info="Do a TCP port check"