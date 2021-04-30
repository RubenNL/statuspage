({dig,port}=require('./tasks/index.js'))
module.exports=[
	{promise:dig('7.7.7.7','google.com'),name:"dns check 7.7.7.7 for google.com(should fail)",after:[
		{promise:dig('123.123.123.123','google.com'),name:"shouldnt execute"},
	]},
	{promise:port('google.com','80'),name:'port 80 on google.com(SHOULD SUCCEED)',after:[
		{promise:()=>new Promise((resolve,reject)=>setTimeout(resolve,10000)),name:"10 sec timeout test", after:[
			{promise:dig('8.8.8.8','google.com'),name:"should execute after 10 seconds and succeed"},
		]},
	]},
]
