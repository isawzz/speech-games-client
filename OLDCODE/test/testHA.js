//#region testing HA
function testHA() {

	test04_taskChain(); return;
	test03_saveServerData(); return;
	test02_msToTime(); return;
	test01_maPic();

}
function test01_maPic() {
	console.log(symbolDict['horse']);
	console.log('UserHistory', UserHistory);
	let d2 = maPic('horse', table, { bg: 'green', w: 200, h: 200 });

}
function test02_msToTime() {
	let ms = timeToMs(1, 20, 23);
	console.log(msToTime(ms));

	console.log(Date.now());
	let ts = new Date();
	console.log(ts)
	let diff = new Date().getTimezoneOffset()
	console.log(msToTime(diff * 60 * 1000));

	let t = new Date();
	t.setHours(2, 0, 0);
	ts = t.getTime()

	let el = msElapsedSince(ts);
	console.log(msToTime(el))
}
function test03_saveServerData() {
	//change some server data
	UserHistory.email = 'hallo@hallo.com';
	Settings.program.minutesPerUnit = 100;
	saveServerData();


}
function test04_taskChain() {
	let dParent = mBy('table');
	// let result=showPics(dParent);console.log('result',result.map(x=>x.label));return;

	let chain = [
		{ f: instruct, parr: ['', '<b></b>', dTitle, false] },
		{ f: showPics, parr: [dParent, { clickHandler: revealAndSelectOnClick, num: 2 }], msecs: 500 },
		{ f: turnPicsDown, parr: ['_last', 2000, true], msecs: 2000 },
		{ f: () => { }, parr: [], msecs: 2000 },
		{ f: setPicsAndGoal, parr: ['_first'] },
		{ f: instruct, parr: ['_last', 'click', dTitle, true] },
		{ f: activateUi, parr: [] },
		{ f: evalSelectGoal, parr: [], waitCond: () => Selected != null },
	];
	let onComplete = res => console.log('DONE', res, '\n===>Goal', Goal, '\n===>Pictures', Pictures);
	chainEx(chain, onComplete);

	//first place a card on table
	//let t1={f:startAni1,cmd:}
}
