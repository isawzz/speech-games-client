var UserHistory;
async function loadHistory() {
	let url = OFFLINE ? 'http://localhost:3000/users/'+USERNAME : 'https://speech-games.herokuapp.com/users/'+USERNAME;
	fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
	}).then(async data => {
		UserHistory = await data.json();
		//console.log('==>USER HISTORY touch pic level', UserHistory.id, UserHistory.gTouchPic.startLevel);
		_start();
		//SessionStart();
	});
}



async function loadAssetsTest(assetsPath) {


	let url = assetsPath + 'c52_blackBorder.yaml';
	c52 = await route_path_yaml_dict(url);

	url = assetsPath + 'symbolDict.yaml';
	symbolDict = await route_path_yaml_dict(url);
	symbolKeys = Object.keys(symbolDict);
	symbolList = dict2list(symbolDict);

	ensureSymBySet(); makeHigherOrderGroups(); 

	BestKeySets = await route_path_yaml_dict(assetsPath + 'speech/keySets.yaml');
	BestKeysD = await route_path_yaml_dict(assetsPath + 'speech/bestKeysD.yaml');
	BestKeysE = await route_path_yaml_dict(assetsPath + 'speech/bestKeysE.yaml');
	for (const e of BestKeysD) {
		let info = symbolDict[e.k];
		info.bestD = e.r;
		info.bestDConf = e.c;
	}
	for (const e of BestKeysE) {
		let info = symbolDict[e.k];
		info.bestE = e.r;
		info.bestEConf = e.c;
	}
	// console.log(BestKeySets.best100);
	for (const setname in BestKeySets) {
		for (const k of BestKeySets[setname]) {
			let info = symbolDict[k];
			if (nundef(info.bestE)) info.bestE = lastOfLanguage(k,'E');
			if (nundef(info.bestD)) info.bestD = lastOfLanguage(k,'D');
			//console.log(info)
			info[setname] = {E:info.bestE, D:info.bestD};
		}
	}

	url = assetsPath + 'svgDict.yaml';
	svgDict = await route_path_yaml_dict(url); //TODO: depending on ext, treat other assts as well!
	svgKeys = Object.keys(svgDict);
	svgList = dict2list(svgDict);

}
