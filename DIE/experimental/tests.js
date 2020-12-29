//#region tests
function test01_colors() {


	let x = randomColorX('hotpink', 50, 80);
	console.log(colorLum('yellow'))

}
function test02_maShowPictures() {
	console.log(dTable);
	let keys = choose(symKeysBySet['animals'], 1);
	keys = ['butterfly'];
	maShowPicturesX3(keys, undefined, dTable, null,
		{ lang: 'D', repeat: 2, showRepeat: true, colors: ['red', 'blue'] },
		{ sCont: { w: 200, h: 200, padding: 10, align: 'center' }, sPic: { contrast: .3 }, sText: {} });

}

function test03_maShowPictures() {
	console.log(dTable);
	let keys = choose(symKeysBySet['animals'], 1);
	keys = ['butterfly'];
	maShowPicturesX3(keys, undefined, dTable, null,
		{ lang: 'D', repeat: 2, showRepeat: true, colors: ['red', 'blue'] },
		{ sCont: { w: 100, h: 50, padding: 10, align: 'center' }, sPic: { contrast: .3 }, sText: { family: 'arial', fz: 20 } });

}



