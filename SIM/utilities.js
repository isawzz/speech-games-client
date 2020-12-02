
async function broadcastSettings(isCurrent=true,isDefault=true){
	//load settings from settings.yaml or settingsTEST.yaml
	let fname = SETTINGS_KEY;
	let settings = await loadYamlDict('./settings/'+fname+'.yaml');

	//das war jetzt regular or TEST

	//soll ich zu defaults or current or both broadcasten?
	if (isCurrent) Settings = settings;
	if (isDefault) DefaultSettings = jsCopy(settings);

	saveServerData();

}
function ensureMinVocab(n,totalNeeded){
	switch(n){
		case 25: if (totalNeeded>= 20) return 50; break;
		case 50: if (totalNeeded>= 35) return 75; break;
		case 75: if (totalNeeded>= 50) return 100; break;
	}
	if (isNumber(n)) return n;


	//hier geh jetzt auf die categories

}

function luminance(r, g, b) {
	var a = [r, g, b].map(function (v) {
			v /= 255;
			return v <= 0.03928
					? v / 12.92
					: Math.pow( (v + 0.055) / 1.055, 2.4 );
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function contrast(rgb1, rgb2) {
	// usage:
	// contrast([255, 255, 255], [255, 255, 0]); // 1.074 for yellow
	// contrast([255, 255, 255], [0, 0, 255]); // 8.592 for blue
	// minimal recommended contrast ratio is 4.5, or 3 for larger font-sizes
	var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
	var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
	var brightest = Math.max(lum1, lum2);
	var darkest = Math.min(lum1, lum2);
	return (brightest + 0.05)
			 / (darkest + 0.05);
}

function chainExecute(taskChain, onComplete) {
	//usage:
	//taskChain = [];
	//taskChain.push({ cmd: cmd, f: _postRoute, data: { agent_type: plInfo.agentType, timeout: null } });
	//f of form: function _postRoute(route, callback, data)
	// the task f executes some kind of hiddenFunction that takes cmd and data as params and has a callback that takes the result
	// that hiddenFunction may be a fetch call or a speech.record_ or a speech.say call
	// speech.recognize even takes multiple callbacks: onSuccess,onFail

	//this is what a promise really is!

	// i could do it as promise...then... but its recursive 
	let akku = [];
	_chainExecuteRec(akku, taskChain, onComplete);
}
function _chainExecuteRec(akku, taskChain, onComplete) {
	if (taskChain.length > 0) {

		taskChain[0].f(

			taskChain[0].cmd,

			d => {
				akku.push(d);
				_chainExecuteRec(akku, taskChain.slice(1), onComplete)
			},

			taskChain[0].data);

	} else {

		onComplete(akku);

	}
}

function saveStats() {
	let g = lastCond(CurrentSessionData.games, x => x.name == 'gSayPicAuto');
	let xxx = arrLast(g.levels).items;
	let yyy = xxx.map(x => {
		let res = { key: x.goal.key };
		res[currentLanguage] = { answer: x.goal.answer, req: x.goal.reqAnswer, conf: x.goal.confidence, isCorrect: x.isCorrect };
		return res;
	});
	downloadAsYaml({ data: yyy }, currentLanguage + '_' + currentCategories[0] + '_data');

}

function msToTime(ms){
	let secs= Math.floor(ms / 1000);
	let mins = Math.floor(secs / 60);
	secs = secs - mins*60;
	let hours = Math.floor(mins / 60);
	mins = mins - hours*60;
	return {h:hours,m:mins,s:secs};
}
function msElapsedSince(msStart){	return Date.now() - msStart;}
function timeToMs(h,m,s){return ((((h*60)+m)*60)+s)*1000;}


