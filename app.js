const express = require('express');
const path = require('path');
const fs = require('fs');
const bp = require('body-parser');
const app = express();

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '/assets/images'));
    },
    filename: (req, file, cb) => {
        cb(null, req.body.number + '.jpg');
    }
});
const fileup = multer({ storage });

app.use(express.static('client'));
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

const pots = JSON.parse(fs.readFileSync('pots.json', 'utf8'));
const coll = JSON.parse(fs.readFileSync('collections.json', 'utf-8'));

//  get route serve images
app.get('/images/:number', (req, res) => {
    if (isNaN(parseInt(req.params.number))) {
        res.status(400).send('Not a number');
        return;
    } else {
        const result = pots.filter(e => e.number === parseInt(req.params.number));
        if (result.length === 0) {
            res.status(400).send('Pot not found');
            return;
        }
    }
    res.sendFile(path.join(__dirname, '/assets/images/', (req.params.number + '.jpg')));
});

//  get route search for a single pot
app.get('/singlePot', (req, res) => {
    if (isNaN(req.query.number) || req.query.number === '') {
        res.status(400).send('Not a number');
        return;
    }
    const number = parseInt(req.query.number);
    const result = pots.filter(e => e.number === number);
    if (result.length === 0) {
        res.status(400).send('Pot not found');
        return;
    };
    res.send(result);
});

//  get route search for a collection
app.get('/singleCollection', (req, res) => {
    if (req.query.term === '') {
        res.status(400).send('No name');
        return;
    };
    if (Object.prototype.hasOwnProperty.call(coll[0], req.query.term) === false) {
        res.status(400).send('Collection not found');
        return;
    }
    const result = coll[0][req.query.term];
    res.send(result);
});

//  get route serve pot of the day
app.get('/potd', (req, res) => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const potd = (2 * day + 14 * month + 5 * year + 18) % pots.length;//   arbitrary hash function
    res.send(pots[potd]);
});

//  post route add message to messages.json
app.post('/contact', (req, res) => {
    const message = {
        email: req.body.email,
        message: req.body.message
    };
    const messages = JSON.parse(fs.readFileSync('messages.json', 'utf8'));
    messages.push(message);
    fs.writeFileSync('messages.json', JSON.stringify(messages));
    res.send('Message received');
});

//  post route buys a pot
app.post('/buy', (req, res) => {
    const number = parseInt(req.body.number);
    const pot = pots.filter(e => e.number === number);
    pot[0].sold = true;
    fs.writeFileSync('pots.json', JSON.stringify(pots));
    res.send('Pot bought');
});

//  ADMIN get route serves messages
app.get('/messages', (req, res) => {
    const messages = JSON.parse(fs.readFileSync('messages.json', 'utf8'));
    res.send(messages);
});

//  ADMIN post route adds or updates a pot
app.post('/newPot', fileup.single('image'), (req, res) => {
    const body = req.body;
    body.number = parseInt(body.number);
    body.price = parseInt(body.price);
    const test = pots.filter(e => e.number === body.number);
    if (test.length > 0) {
        test[0].price = body.price;
        test[0].blurb = body.blurb;
        test[0].sold = body.sold;
        test[0].collections = body.collection;
        fs.writeFileSync('pots.json', JSON.stringify(pots));
        const coltest = coll[0][body.collection];
        if (coltest === undefined) {
            coll[0][body.collection] = [parseInt(body.number)];
        } else {
            coll[0][body.collection].push(parseInt(body.number));
        }
        fs.writeFileSync('collections.json', JSON.stringify(coll));
        res.send('pot updated');
    } else {
    const newPot = {
        number: body.number,
        price: body.price,
        blurb: body.blurb,
        sold: body.sold === false,
        collections: body.collection
    };
    pots.push(newPot);
    fs.writeFileSync('pots.json', JSON.stringify(pots));
    const coltest = coll[0][body.collection];
    if (coltest === undefined) {
        coll[0][body.collection] = [parseInt(body.number)];
    } else {
        coll[0][body.collection].push(parseInt(body.number));
    }
    fs.writeFileSync('collections.json', JSON.stringify(coll));
    res.send('pot updated');
    }
});

//  ADMIN adds a list of pots to a collection
function insertPots (listofPots, collection) {
    listofPots = listofPots.split(',');
    listofPots.forEach(element => {
        element = parseInt(element);
        const pot = pots.filter(e => e.number === element);
        if (pot.length === 1) {
            pot[0].collections.push(collection);
        }
    });
    fs.writeFileSync('pots.json', JSON.stringify(pots));
    listofPots.forEach(element => {
        element = parseInt(element);
        if (coll[0][collection].includes(element) === false) {
            coll[0][collection].push(element);
        }
    });
    fs.writeFileSync('collections.json', JSON.stringify(coll));
}

//  ADMIN creates or modifies a collection according to data sent by POST to /editCol
app.post('/editCol', (req, res) => {
    const body = req.body;
    if (coll[0][body.name] === undefined) {
        coll[0][body.name] = [];
        insertPots(body.members, body.name);
    } else if (body.overwrite) {
        for (const i of coll[0][body.name]) {
            const pot = pots.filter(e => e.number === i);
            if (pot.length === 1) {
                const index = pot[0].collections.indexOf(body.name);
                pot[0].collections.splice(index, 1);
            }
        }
        coll[0][body.name] = [];
        insertPots(body.members, body.name);
    } else {
        insertPots(body.members, body.name);
    }
    fs.writeFileSync('collections.json', JSON.stringify(coll));
    res.send('collection updated');
});

//  ADMIN get route for list/search
app.get('/browsePots', (req, res) => {
    const term = req.query.term;
    const param = req.query.param;
    if (param === '' || term === '') {
        res.send(pots);
    };
    const result = pots.filter(e => e[param].toString().includes(term));
    res.send(result);
});

//  ADMIN get route to filter collections by name
app.get('/browseCollections', (req, res) => {
    const term = req.query.term;
    const result = [];
    if (term === '') {
        res.send(coll[0]);
    } else {
        for (const i in coll[0]) {
            if (i.includes(term)) {
                result.push(i);
            };
        };
        res.send(result);
    };
});

module.exports = app;
