module.exports=function({ms}) {
	return {
		call: () => new Promise(resolve=>setTimeout(resolve,ms)),
		name: `delay of ${ms}ms`,
	}
}
module.exports.help={
	ms:"1000th seconds to wait.",
}
module.exports.info="wait specified time."