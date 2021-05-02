const { Resolver } = require('dns').promises;
module.exports=function({server,host}) {
	const resolver = new Resolver({timeout:100});
	resolver.setServers([server]);
	return {
		call: () => resolver.resolve4(host),
		name: `DNS request to ${server} for ${host}`,
	}
}
