const express = require('express');
const { append, json } = require('express/lib/response');
const fs = require('fs');
const app = express();
const bp = require('body-parser')

app.use(express.static("client"))
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

var pots = JSON.parse(fs.readFileSync('pots.json', 'utf8'));
var coll = JSON.parse(fs.readFileSync('collections.json', 'utf-8'))

//serve images
app.get('/images/:number', (req, res) => {
    res.sendFile(__dirname + '/assets/images/' + req.params.number + '.jpg');
});

//search for a single pot
app.get('/singlePot', (req, res) => {
    number = parseInt(req.query.number);
    var result = pots.filter(e => e.number == number);
    res.send(result);
});

//search for a collection
app.get('/singleCollection', (req,res) => {
    if (coll[0].hasOwnProperty(req.query.term) == false) {
        res.send([]);
        return;
    }
    var result = coll[0][req.query.term]
    res.send(result);
});

//serve pot of the day
app.get('/potd', (req, res) => {
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    var potd = (2* day + 14 * month + 5 * year + 18) % pots.length;//arbitrary hash function
    res.send(pots[potd]);
});

//add message to messages.json
app.post('/contact', (req, res) => {
    console.log(req.body);
    var message = {
        "email": req.body.email,
        "message": req.body.message,
    }
    var messages = JSON.parse(fs.readFileSync('messages.json', 'utf8'));
    messages.push(message);
    fs.writeFileSync('messages.json', JSON.stringify(messages));
    res.send("Message received");
});

//buys a pot
app.post('/buy', (req, res) => {
    console.log(req.body)
    var number = req.body.number;
    var pot = pots.filter(e => e.number == number);
    pot[0].sold = true;
    fs.writeFileSync('pots.json', JSON.stringify(pots));
    res.send("Pot bought");
});

//ADMIN serves messages
app.get('/messages', (req, res) => {
    var messages = JSON.parse(fs.readFileSync('messages.json', 'utf8'));
    res.send(messages);
});

//ADMIN adds or updates a pot
app.post('/newPot', (req,res) => {
    var body = req.body
    var test = pots.filter(e => e.number == body.number)
    if (test.length > 0) {
        test[0].price = body.price
        test[0].blurb = body.blurb
        test[0].sold = body.sold
        test[0].collections = body.collection
        fs.writeFileSync('pots.json', JSON.stringify(pots));
        var coltest = coll[0][body.collection]
        console.log(coltest)
        if (coltest == undefined) {
            coll[0][body.collection] = [parseInt(body.number)]
        } else {
            coll[0][body.collection].push(parseInt(body.number))
        }
        console.log(coll)
        fs.writeFileSync('collections.json', JSON.stringify(coll));
        res.send("updated")
    } else {
    var newPot = {
        "number": body.number,
        "price": body.price,
        "blurb": body.blurb,
        "sold": body.sold == false,
        "collections": body.collection
    }
    pots.push(newPot)
    fs.writeFileSync('pots.json', JSON.stringify(pots));
    var coltest = coll[0][body.collection]
    console.log(coltest)
    if (coltest == undefined) {
        coll[0][body.collection] = [parseInt(body.number)]
    } else {
        coll[0][body.collection].push(parseInt(body.number))
    }
    console.log(coll)
    fs.writeFileSync('collections.json', JSON.stringify(coll));

    res.send("received")
    }
})

//ADMIN adds a list of pots to a collection
function insertPots(listofPots, collection) {
    listofPots = listofPots.split(",")
    listofPots.forEach(element => {
        element = parseInt(element)
        var pot = pots.filter(e => e.number == element)
        if (pot.length == 1) {
            pot[0].collections.push(collection)
        }
    });
    fs.writeFileSync('pots.json', JSON.stringify(pots));
    listofPots.forEach(element => {
        element = parseInt(element)
        if (coll[0][collection].includes(element) == false) {
            coll[0][collection].push(element)
        }
    });
    fs.writeFileSync('collections.json', JSON.stringify(coll));
}
    



//ADMIN creates or modifies a collection according to data sent by POST to /editCol
app.post('/editCol', (req, res) => {
    var body = req.body;
    if (coll[0][body.name] == undefined) {
        coll[0][body.name] = [];
        insertPots(body.members, body.name)
    }
    else if (body.overwrite) {
        for (i of coll[0][body.name]) {
            var pot = pots.filter(e => e.number == i)
            if (pot.length == 1) {
                var index = pot[0].collections.indexOf(body.name)
                pot[0].collections.splice(index, 1);
            }
        }
        coll[0][body.name] = [];
        insertPots(body.members, body.name)
    } else {
        insertPots(body.members, body.name)
    }
    fs.writeFileSync('collections.json', JSON.stringify(coll));
    res.send("received");
})



app.listen(6970);