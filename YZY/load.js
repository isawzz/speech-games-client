//window.onclick = () => { clearElement(dTable); t82_Live(); }
window.onload = _loader;

async function addGroupInfo() {
	let symbolDict = SymbolDict = await localOrRoute('symbolDict', '../assets/symbolDict.yaml');
	let sInfo = SInfo = await localOrRoute('sInfo', '../assets/s_info.yaml');

	for (const k in Syms) {
		let old = symbolDict[k];
		let info = sInfo[k];

		if (isdef(old) && isdef(old.group)) {
			Syms[k].group = old.group;
			Syms[k].subgroup = old.subgroups;
		} else {
			Syms[k].subgroup = info.subgroup; //console.log('no subgroups', old, info); }
			Syms[k].group = info.group; //console.log('no group', old, info); }
		}
	}
	//console.log('example', Syms[chooseRandom(SymKeys)]);
	for (const k in Syms) {
		if (nundef(Syms[k].group) || nundef(Syms[k].subgroup)) {
			console.log('IMMER NOCH KEIN GROUP INFO!!!!', k, Syms[k], sInfo[k], symbolDict[k]);
		}
	}
	//console.log(Syms)
	// let symsNo = await localOrRoute('symsNo', '../assets/symsNo.yaml');
	// for(const k in symsNo){ delete Syms[k.toLowerCase()]; }
	// SymKeys = Object.keys(Syms);
	// symbolDict = await localOrRoute('symbolDict', '../assets/symbolDict.yaml');
}
async function _loader() {
	Daat={};
	if (CLEAR_LOCAL_STORAGE) localStorage.clear();

	C52 = await localOrRoute('C52', '../assets/c52.yaml');
	symbolDict = Syms = await localOrRoute('syms', '../assets/allSyms.yaml');
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = await localOrRoute('gsg', '../assets/symGSG.yaml');
	WordP = await route_path_yaml_dict('../assets/math/allWP.yaml');

	//await addGroupInfo();

	//dbInit:
	if (BROADCAST_SETTINGS) {
		//console.log('...broadcasting ...')
		await dbInit('boardGames');
		_start0();
	} else { dbLoad('boardGames', _start0); }

}
async function _start0() {
	console.assert(isdef(DB));

	DA={};Items={};
	Speech = new SpeechAPI('E');
	KeySets = getKeySets();
	TOMan=new TimeoutManager();

	_start();

}
