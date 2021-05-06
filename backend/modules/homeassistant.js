const HomeAssistant = require('homeassistant');
module.exports=function({entity},moduleConfig) {
	const hass = new HomeAssistant(moduleConfig);
	const call=()=>hass.states.get(...entity.split('.'));
	return {
		call,
		name: `get home assistant state for ${entity}`,
	}
}
module.exports.defaultConfig={
	host: "http://localhost",
	port: "8384",
	token: "PLACEHOLDER",
}
module.exports.help={
	entity:"entity to check",
}
module.exports.info="get home assistant state"