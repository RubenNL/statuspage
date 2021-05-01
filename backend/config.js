module.exports= {
	modules: require('./tasks'),
	actions: [
		{module: 'dig',args:['7.7.7.7', 'google.com'], after: [
				{module: 'dig',args:['123.123.123.123', 'google.com']},
		]},
		{module: 'port',args:['google.com', '80'], after: [
			{data: {name: "wait 10 seconds", call: () => new Promise((resolve, reject) => setTimeout(resolve, 10000))}, after: [
				{module: 'dig',args:['8.8.8.8', 'google.com']},
			]},
		]},
	]
}