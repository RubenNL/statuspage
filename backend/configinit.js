const fs=require('fs');
const modules=require('./modules');
let data;
let shouldSave=false;
module.exports.getConfig=(file='./config/config.json')=>JSON.parse(fs.readFileSync(file,'utf8'));
module.exports.saveConfig=data=>fs.writeFileSync('./config/config.json',JSON.stringify(data,null,2),'utf8');
try {
	data=module.exports.getConfig();
} catch (e) {
	data=module.exports.getConfig('./default.json');
	shouldSave=true;
}
Object.keys(modules).forEach(moduleKey=>{
	if(modules[moduleKey].defaultConfig&&!data.moduleConfig[moduleKey]) {
		shouldSave=true;
		data.moduleConfig[moduleKey]=modules[moduleKey].defaultConfig;
	}
})
if (shouldSave) module.exports.saveConfig(data);