net=require('net')
module.exports=function(host, port) {
	return ()=>new Promise(function(resolve, reject) {
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
}
