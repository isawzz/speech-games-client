COND = {
	dummy: (o) => { if (o.someprop == 'x') return { f: 'some_key_in_FUNCS' }; },
	//card: (o) => { if (o.generic_type == 'card') return { f: 'card' } }
};

FUNCS = {
	dummy: (oid, o) => { console.log('dummy', oid, o); },
	cardFace: (oid,o,{key='hallo'}={})=>{
		console.log('HALLLLLLLLOOOOOOOOOOOOO',oid,o,key)
		return d3.create('div').style('color','yellow').style('background-color','blue').text(key).node();
	},

	card: (oid, o) => {
		let card = emptyCard(); // makeCard({rank:o.short_name});
		cardContent(card,{
			title:'Knight',
			topLeft:['crow',2],
			topRight:['house',4],
			middle:'A',
			text:'this is a card to test how cards could really look like'
		});
		// cardContent({topleft:['crow',2],topright:['house',4],middle:'crow',text:'this is a card to test how cards could really look like'});
		showCard(card,{area:'zone',height:80});

		card = makeCard({rank:'A'});
		showCard(card,{area:'zone',height:80});

		card = makeCard({rank:'Q'});
		showCard(card,{area:'zone',height:80});
		// let card = makeCard52_test(oid, o, { rank: o.short_name, func:FUNCS.cardFace, area:'hand'});
		// let card = makeCard52_test(oid, o, { rank: o.short_name, area: 'zone' });
		// for (let i = 0; i < 1; i++) {
		// 	card = makeCard52_test(oid, o, { rank: o.short_name, suit: 'C', area: 'player' });
		// 	card = makeCard52_test(oid, o, { rank: '2', suit: 'S', area: 'hand' });
		// 	card = makeCard52_test(oid, o, { rank: 'T', suit: 'S', area: 'hand' });
		// 	card = makeCard52_test(oid, o, { area: 'hand' });
		// }
	}
};

//console.log('code1 loaded hahaha...')


