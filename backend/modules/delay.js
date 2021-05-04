module.exports=function({ms}) {
	return {
		call: data => new Promise(resolve=>setTimeout(()=>resolve(data),ms)),
		name: `delay of ${ms}ms`,
	}
}
module.exports.help={
	ms:"1000th seconds to wait.",
}
module.exports.info="wait specified time."
