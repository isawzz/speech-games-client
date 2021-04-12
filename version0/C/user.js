var Users = {};
function changeUserTo(id) {
	id = id.toLowerCase();
	if (id != Username && isdef(Users[Username])) { Users[Username].save(true); }

	loadUser(id);
}
function listUsers() { console.log(Object.keys(DB.users)); }
function loadUser(id) {
	//console.log('________ id', id, 'Username', Username, 'DEF', DEFAULTUSERNAME)
	if (nundef(id)) id = localStorage.getItem('user');
	if (nundef(id)) id = DEFAULTUSERNAME;
	if (nundef(Users[id])) Users[id] = new User(id);

	Username = id;
	U = Users[id].load();
	U.session = {};
	console.log(Username, U);

	updateUsernameUi();
}
function saveUsers() { for (const id in Users) Users[id].save(); }
function saveUser() { Users[Username].save(true); }
function updateUsernameUi() {
	let uiName = 'spUser';
	let ui = mBy(uiName);
	if (nundef(ui)) {
		console.log('creating ui for username');
		ui = mEditableOnEdited(uiName, dLineTopLeft, 'user: ', '', changeUserTo);
	}
	ui.innerHTML = Username;
	mStyleX(ui, { fg: U.settings.color });
}

class User {
	constructor(id) {
		this.id = id;
		let data = lookup(DB, ['users', id]);
		if (!data) {
			if (id == 'test') { data = DB.users[id] = jsCopy(DB.users.test0); }
			else { data = DB.users[id] = jsCopy(DB.users.guest0); }
			data.id = id;
			data.settings.color = randomColor();
		}
		this.data = data;
	}
	load() { return this.data; }
	save(sendToDB = false) { lookupSet(DB, ['users', this.id], this.data); if (sendToDB) dbSave('boardGames'); }
	getAvailableGames() { }
	getRunningGames() { }
	getData() { }
	getState(idGame) { }
	getStartLevel() { }
	setGame() { }
	setStartLevel() { }
	setScore() { }

}