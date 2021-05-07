const fs=require('fs');
const modules=require('./modules');
try {
	fs.readFileSync('./config/config.json','utf8')
} catch (e) {
	fs.writeFileSync('./config/config.json',fs.readFileSync('./default.json','utf8'),'utf8');
}
const data = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'))
let shouldSave=false;
Object.keys(modules).forEach(moduleKey=>{
	if(modules[moduleKey].defaultConfig&&!data.moduleConfig[moduleKey]) {
		shouldSave=true;
		data.moduleConfig[moduleKey]=modules[moduleKey].defaultConfig;
	}
})
if (shouldSave) fs.writeFileSync('./config/config.json', JSON.stringify(data, null, 2));