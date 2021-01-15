var BlockServerSend = false;
var SERVER_DATA = null;

async function broadcastSIMA(usersPath = './_users.yaml', settingsPath = './_settings.yaml') {
	let users = await loadYamlDict(usersPath);
	let settings = await loadYamlDict(settingsPath);

	DB = {
		id: 'speechGames',
		users: users,
		settings: settings
	};

	//console.log('...saving from BROADCASTING')
	saveSIMA();

	if (CLEAR_LOCAL_STORAGE) localStorage.clear();
	await loadAssetsSIMA('../assets/');

}

async function loadSIMA(callback) {
	//console.log('...loading...');
	let url = SERVERURL;
	fetch(url, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
	}).then(async data => {
		let sData = await data.json();
		DB = sData[0];
		//console.log(DB)
		//hier kann ich assets laden!!!
		if (CLEAR_LOCAL_STORAGE) localStorage.clear();
		await loadAssetsSIMA('../assets/');

		if (isdef(callback)) callback();
	});
}
async function localOrRoute(key, url) {
	if (USE_LOCAL_STORAGE) {
		let x = localStorage.getItem(key);
		if (isdef(x)) return JSON.parse(x);
		else {
			let data = await route_path_yaml_dict(url);
			if (key != 'svgDict') localStorage.setItem(key, JSON.stringify(data));
			return data;
		}
	} else return await route_path_yaml_dict(url);
}
async function loadAssetsSIMA(assetsPath) {
	c52 = await localOrRoute('c52', assetsPath + 'c52_blackBorder.yaml');
	//testCards = await localOrRoute('testCards', assetsPath + 'testCards.yaml');
	cinno = await localOrRoute('cinno', assetsPath + 'fe/inno.yaml');

	//return;
	symbolDict = await localOrRoute('symbolDict', assetsPath + 'symbolDict.yaml');
	symbolKeys = Object.keys(symbolDict);
	symbolList = dict2list(symbolDict);
	ensureSymBySet(); makeHigherOrderGroups();

	svgDict = await localOrRoute('svgDict', assetsPath + 'svgDict.yaml'); //TODO: depending on ext, treat other assts as well!
	svgKeys = Object.keys(svgDict);
	svgList = dict2list(svgDict);
}

async function saveSIMA() {
	if (BlockServerSend) {
		//console.log('...wait for unblocked...');
		setTimeout(saveSIMA, 1000);
	} else {
		//console.log('posting DB: startLevel Pictures!', lookupSet(DB.users,[USERNAME,'games','gTouchPic','startLevel'],0)); //DB.users[USERNAME].games.gTouchPic.startLevel);
		//console.log(DB);

		let url = SERVERURL + 'speechGames';
		BlockServerSend = true;
		//console.log('blocked...');
		fetch(url, {
			method: 'PUT',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(DB)
		}).then(() => { BlockServerSend = false; }); //console.log('unblocked...'); });
	}

}




