module.exports=function({goal}) {
	const call=data=>data===goal?Promise.resolve():Promise.reject();
	return {
		call,
		name: `compare data with ${goal}`,
	}
}
module.exports.help={
	goal:"should be the same as this text",
}
module.exports.info="compares texts"
