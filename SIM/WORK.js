function countdownTime() {
	//calc elapsed time
	//lets get current time in ms
	let msNow = Date.now();
	let elapsed = msnow - ProgMsStart;
//ProgMsElapsed = 
	var today = new Date(),
		h = checkTime(today.getHours()),
		m = checkTime(today.getMinutes()),
		s = checkTime(today.getSeconds());
	document.getElementById('time').innerHTML = h + ":" + m + ":" + s;
	t = setTimeout(function () {
		startTime()
	}, 500);
}
