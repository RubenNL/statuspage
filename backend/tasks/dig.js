const { Resolver } = require('dns').promises;

module.exports=function(server,host) {
	const resolver = new Resolver({timeout:100});
	resolver.setServers([server]);
	return ()=>resolver.resolve4(host)
}
