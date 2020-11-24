function chainExecute(taskChain, onComplete) {
	//usage:
	//taskChain = [];
	//taskChain.push({ cmd: cmd, f: _postRoute, data: { agent_type: plInfo.agentType, timeout: null } });
	//f of form: function _postRoute(route, callback, data)
	// the task f executes some kind of hiddenFunction that takes cmd and data as params and has a callback that takes the result
	// that hiddenFunction may be a fetch call or a speech.record or a speech.say call
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
