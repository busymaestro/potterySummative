'use strict';

const request = require('supertest');
const app = require('./app');

const mockContact = jest.fn((req, res) => {
  const message = {
      email: req.body.email,
      message: req.body.message
  };
  const messages = [];
  messages.push(message);
  return messages;
});

const mockBuy = jest.fn((req, res) => {
  const pots = [{
    number: 4,
    price: 200,
    sold: false,
    blurb: 'Ridged bottle form: Medium size, hand-built bottle with ridge detail, poured and brushed white glaze with copper-glazed rim. Raku fired.',
    collections: [
      'raku'
    ]
  }];
  const number = req.body.number;
  const pot = pots.filter(e => e.number === number);
  pot[0].sold = true;
  return pots;
});

const mockNewPot = jest.fn((req, pots, coll) => {
  const body = req.body;
  const test = pots.filter(e => e.number === body.number);
  if (test.length > 0) {
      test[0].price = body.price;
      test[0].blurb = body.blurb;
      test[0].sold = body.sold;
      test[0].collections = body.collection;
      const coltest = coll[0][body.collection];
      if (coltest === undefined) {
          coll[0][body.collection] = [parseInt(body.number)];
      } else {
          coll[0][body.collection].push(parseInt(body.number));
      }
      return [pots, coll];
  } else {
  const newPot = {
      number: body.number,
      price: body.price,
      blurb: body.blurb,
      sold: body.sold,
      collections: body.collection
  };
  pots.push(newPot);
  const coltest = coll[0][body.collection];
  if (coltest === undefined) {
      coll[0][body.collection] = [parseInt(body.number)];
  } else {
      coll[0][body.collection].push(parseInt(body.number));
  }
  return [pots, coll];
  }
});

function insertPots (listofPots, collection, pots, coll) {
  // listofPots = listofPots.split(',');
  listofPots.forEach(element => {
      element = parseInt(element);
      const pot = pots.filter(e => e.number === element);
      if (pot.length === 1) {
          pot[0].collections.push(collection);
      }
  });
  // fs.writeFileSync('pots.json', JSON.stringify(pots));
  listofPots.forEach(element => {
      element = parseInt(element);
      if (coll[0][collection].includes(element) === false) {
          coll[0][collection].push(element);
      }
  });
  // fs.writeFileSync('collections.json', JSON.stringify(coll));
}

const mockEditCol = jest.fn((req, pots, coll) => {
  const body = req.body;
  if (coll[0][body.name] === undefined) {
      coll[0][body.name] = [];
      insertPots(body.members, body.name, pots, coll);
  } else if (body.overwrite) {
      for (const i of coll[0][body.name]) {
          const pot = pots.filter(e => e.number === i);
          if (pot.length === 1) {
              const index = pot[0].collections.indexOf(body.name);
              pot[0].collections.splice(index, 1);
          }
      }
      coll[0][body.name] = [];
      insertPots(body.members, body.name, pots, coll);
  } else {
      insertPots(body.members, body.name, pots, coll);
  }
  // fs.writeFileSync('collections.json', JSON.stringify(coll));
  return [pots, coll];
});

describe('test GET route to serve images at /images/:number', () => {
  test('GET /images/1 succeeds', () => {
    return request(app)
      .get('/images/1')
      .expect(200);
  });
  test('GET /images/1 returns an image', () => {
    return request(app)
      .get('/images/1');
      ;
  });
  test('GET /images/1 returns the correct image', () => {
    return request(app)
      .get('/images/1')
      .expect('Content-Length', '1387576');
  });
  test('GET /images/1 rejects empty data', () => {
    return request(app)
      .get('/images/')
      .expect(404);
  });
  test('GET /images/1 rejects non-integer data', () => {
    return request(app)
      .get('/images/hello')
      .expect(400);
  });
  test('GET /images/1 rejects data outside range', () => {
    return request(app)
      .get('/images/2360')
      .expect(400);
  });
  test('GET /singlePot?number=2 succeeds', () => {
    return request(app)
      .get('/singlePot?number=2')
      .expect(200);
  });
  test('GET /singlePot?number=2 returns an object', () => {
    return request(app)
      .get('/singlePot?number=2')
      .expect('Content-Type', /json/);
  });
  test('GET /singlePot?number=2 returns the correct object', () => {
    return request(app)
      .get('/singlePot?number=2')
      .expect((res) => {
        const body = res.body[0];
        expect(body.number).toBe(2);
        expect(body.price).toBe(100);
        expect(body.blurb).toBe('Straight-edged bowl: Small, straight-edged bowl in red earthen ware clay. Anagama fired.');
        expect(body.sold).toBe(true);
        expect(body.collections).toEqual(['anagama']);
      });
  });
  test('GET /singlePot?number= rejects empty data', () => {
    return request(app)
      .get('/singlePot?number=')
      .expect(400);
  });
  test('GET /singlePot?number= rejects non-integer data', () => {
    return request(app)
      .get('/singlePot?number=hello')
      .expect(400);
  });
  test('GET /singlePot?number= rejects data outside range', () => {
    return request(app)
      .get('/singlePot?number=2360')
      .expect(400);
  });
  test('GET /singleCollection?term=spindrift succeeds', () => {
    return request(app)
      .get('/singleCollection?term=spindrift')
      .expect(200);
  });
  test('GET /singleCollection?term=spindrift returns an object', () => {
    return request(app)
      .get('/singleCollection?term=spindrift')
      .expect('Content-Type', /json/);
  });
  test('GET /singleCollection?term=spindrift returns the correct object', () => {
    return request(app)
      .get('/singleCollection?term=spindrift')
      .expect((res) => {
        const body = res.body;
        expect(body.length).toBe(5);
      });
  });
  test('GET /singleCollection?term= rejects empty data', () => {
    return request(app)
      .get('/singleCollection?term=')
      .expect(400);
  });
  test('GET /singleCollection?term=spindrift rejects data outside of collections list', () => {
    return request(app)
      .get('/singleCollection?term=thisCollectionDoesNotExist')
      .expect(400);
  });
  test('GET /potd succeeds', () => {
    return request(app)
      .get('/potd')
      .expect(200);
  });
  test('GET /potd returns an object', () => {
    return request(app)
      .get('/potd')
      .expect('Content-Type', /json/);
  });
  test('POST /contact mock works', () => {
    const body = {
      body: {
        email: 'testeremail@somewhere.co.uk',
        message: 'This is a test message'
      }
    };
    mockContact(body);
    expect(mockContact).toHaveBeenCalledTimes(1);
    expect(mockContact.mock.results.length).toBe(1);
    expect(mockContact.mock.results[0].value[0].email).toBe('testeremail@somewhere.co.uk');
    expect(mockContact.mock.results[0].value[0].message).toBe('This is a test message');
  });
  test('POST /buy mock buys a pot', () => {
    const req = {
      body: {
        number: 4
      }
    };
    mockBuy(req);
    expect(mockBuy).toHaveBeenCalledTimes(1);
    expect(mockBuy.mock.results.length).toBe(1);
    expect(mockBuy.mock.results[0].value[0].number).toBe(4);
    expect(mockBuy.mock.results[0].value[0].sold).toBe(true);
  });
  test('GET /messages succeeds', () => {
    return request(app)
      .get('/messages')
      .expect(200);
  });
  test('GET /messages returns an object', () => {
    return request(app)
      .get('/messages')
      .expect('Content-Type', /json/);
  });
  test('GET /messages returns the correct object', () => {
    return request(app)
      .get('/messages')
      .expect((res) => {
        const body = res.body;
        expect(body[0].email).toBe('testeremail@nowhere.ac.uk');
        expect(body[0].message).toBe('testing');
      });
  });
  test('POST /newPot mock adds a new pot', () => {
    const pots = [
      {
        number: 1,
        price: '150',
        sold: false,
        blurb: 'See No Evil Monkey: Small moulded monkey figure in red earthenware clay. Anagama fired.',
        collections: [
          'anagama'
        ]
      },
      {
        number: 2,
        price: 100,
        sold: true,
        blurb: 'Straight-edged bowl: Small, straight-edged bowl in red earthen ware clay. Anagama fired.',
        collections: [
          'anagama'
        ]
      },
      {
        number: 3,
        price: 100,
        sold: false,
        blurb: 'Wabi Sabi tea bowl: Tea bowl in red earthenware clay. Anagama fired.',
        collections: [
          'anagama'
        ]
      }
    ];
    const coll = [
        {
          anagama: [
            1,
            2,
            3
          ]
        }
      ];
    let req = {
      body: {
        number: 4,
        price: 100,
        sold: false,
        blurb: 'test pot',
        collection: ['anagama']
      }
    };
    mockNewPot(req, pots, coll);
    expect(mockNewPot).toHaveBeenCalledTimes(1);
    expect(mockNewPot.mock.results[0].value[0][3].number).toBe(4);
    expect(mockNewPot.mock.results[0].value[1][0].anagama[3]).toBe(4);
    req = {
      body: {
        number: 4,
        price: 200,
        sold: false,
        blurb: 'test pot',
        collection: ['a_new_collection']
      }
    };
    mockNewPot(req, pots, coll);
    expect(mockNewPot.mock.results[1].value[0][3].number).toBe(4);
    expect(mockNewPot.mock.results[1].value[0][3].price).toBe(200);
    expect(mockNewPot.mock.results[1].value[1][0].a_new_collection[0]).toBe(4);
    });
    test('POST /editCol edits a collection', () => {
      const pots = [
        {
          number: 1,
          price: '150',
          sold: false,
          blurb: 'See No Evil Monkey: Small moulded monkey figure in red earthenware clay. Anagama fired.',
          collections: [
            'anagama'
          ]
        },
        {
          number: 2,
          price: 100,
          sold: true,
          blurb: 'Straight-edged bowl: Small, straight-edged bowl in red earthen ware clay. Anagama fired.',
          collections: [
            'anagama'
          ]
        },
        {
          number: 3,
          price: 100,
          sold: false,
          blurb: 'Wabi Sabi tea bowl: Tea bowl in red earthenware clay. Anagama fired.',
          collections: [
            'anagama'
          ]
        }
      ];
      const coll = [
          {
            anagama: [
              1,
              2,
              3
            ]
          }
        ];
      const req = {
        body: {
          name: 'raku',
          members: [1, 2],
          overwrite: false
        }
      };
      mockEditCol(req, pots, coll);
      expect(mockEditCol.mock.results[0].value[1][0].raku[0]).toBe(1);
      req.body.overwrite = true;
      req.body.members = [1];
      mockEditCol(req, pots, coll);
      expect(mockEditCol.mock.results[1].value[1][0].raku.length).toBe(1);
    });
    test('GET /browsePots succeeds', () => {
      return request(app)
        .get('/browsePots?param=blurb&value=small')
        .expect(200);
    });
    test('GET /browsePots returns an object', () => {
      return request(app)
        .get('/browsePots?param=blurb&value=small')
        .expect('Content-Type', /json/);
    });
    test('GET /browsePots returns the right object', () => {
      return request(app)
        .get('/browsePots?param=blurb&value=small')
        .expect('Content-Length', '2');
    });
    test('GET /browsePots returns all on empty parameter', () => {
      return request(app)
        .get('/browsePots?param=&value=small')
        .expect((res) => {
          const body = res.body;
          expect(body.length).toBe(19);
        });
    });
    test('GET /browseCollections succeeds', () => {
      return request(app)
        .get('/browseCollections?param=anagama')
        .expect(200);
    });
    test('GET /browseCollections returns an object', () => {
      return request(app)
        .get('/browseCollections?param=anagama')
        .expect('Content-Type', /json/);
    });
    test('GET /browseCollections returns the right object', () => {
      return request(app)
        .get('/browseCollections?param=ak')
        .expect('Content-Length', '2');
    });
});
