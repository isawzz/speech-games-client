






function wp00() {

	let wp = getRandomWP(1, 5);
	console.log('wp', wp);

	let text = wp.text;

	instantiateNames(wp);
	console.log(wp.text)

	instantiateNumbers(wp);
	console.log(wp.text);
	console.log('ergebnis:', wp.result);
}
function wp01_alle() {
	for (const wp of WordP) {
		instantiateNames(wp);
		console.log('______________',wp.index);//,'\n',wp.text)

		instantiateNumbers(wp);
		console.log('text:',wp.text);
		console.log('ergebnis:', wp.result);
	}
	console.log(WordP)
}
function wp02_checkMinus() {
	let results=[];
	for (let i=34;i<56;i++) {

		let wp=jsCopy(WordP[i]);

		instantiateNames(wp);

		let [diop,eq]=instantiateNumbers(wp);
		console.log('______________',wp.index);//,'\n',wp.text)
		console.log('text:',wp.text);
		console.log('diop:',diop);
		console.log('eq:',eq);
		//console.log('ergebnis:', wp.result);
		results.push(wp.result);
		//console.assert(wp.result.number>0,'!!!!!!!!!!!!!!!NEG!!!')
		break;
	}
	console.log('result',results.map(x=>''+x.number+' text:'+x.text))
	//console.log(WordP)
}











