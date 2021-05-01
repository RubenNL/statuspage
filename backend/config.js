let dig,port;
({dig,port}=require('./tasks/index.js'))
module.exports=[
	{data:dig('7.7.7.7','google.com'),after:[
		{data:dig('123.123.123.123','google.com')},
	]},
	{data:port('google.com','80'),after:[
		{data:{name:"wait 10 seconds",call:()=>new Promise((resolve,reject)=>setTimeout(resolve,10000))}, after:[
			{data:dig('8.8.8.8','google.com')},
		]},
	]},
]
