module.exports=function(ms) {
	return {
		call: () => new Promise(resolve=>setTimeout(resolve,ms)),
		name: `delay of ${ms}ms`,
	}
}
