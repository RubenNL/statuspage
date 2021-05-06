const HomeAssistant = require('homeassistant');
const hass = new HomeAssistant(JSON.parse(require('fs').readFileSync('config/homeassistant.json')));
module.exports=function({entity}) {
	const call=()=>hass.states.get(...entity.split('.'));
	return {
		call,
		name: `get home assistant state for ${entity}`,
	}
}
module.exports.help={
	entity:"entity to check",
}
module.exports.info="get home assistant state"