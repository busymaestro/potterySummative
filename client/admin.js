//messages function on dom loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    fetch("http://localhost:6970/messages")
    .then(out => out.json())
    .then(out => {
      for (i of out) {
        var cardRow = document.createElement('div');
        cardRow.className = 'row px-3';
        var separator1 = document.createElement('div');
        separator1.className = 'col-12 col-md-6';
        cardRow.appendChild(separator1);
        var email = document.createElement('p');
        email.className = 'text-light';
        email.innerHTML = i.email;
        separator1.appendChild(email);
        var separator2 = document.createElement('div');
        separator2.className = 'col-12 col-md-6';
        cardRow.appendChild(separator2);
        var message = document.createElement('p');
        message.className = 'text-white-50';
        message.innerHTML = i.message;
        separator2.appendChild(message);

        document.getElementById('messagesList').appendChild(cardRow);
      }
    })
  })
} else {
    fetch("http://localhost:6970/messages")
    .then(out => out.json())
    .then(out => {
      for (i of out) {
        var cardRow = document.createElement('div');
        cardRow.className = 'row px-3';
        var separator1 = document.createElement('div');
        separator1.className = 'col-12 col-md-6';
        cardRow.appendChild(separator1);
        var email = document.createElement('p');
        email.className = 'text-light';
        email.innerHTML = i.email;
        separator1.appendChild(email);
        var separator2 = document.createElement('div');
        separator2.className = 'col-12 col-md-6';
        cardRow.appendChild(separator2);
        var message = document.createElement('p');
        message.className = 'text-white-50';
        message.innerHTML = i.message;
        separator2.appendChild(message);

        document.getElementById('messagesList').appendChild(cardRow);
      }
    })
  }

//creates a new pot
document.getElementById('newPotForm').addEventListener('submit', function (event) {
  event.preventDefault();
  var newNumber = document.getElementById('potNumber').value;
  var newPrice = document.getElementById('potPrice').value;
  var newBlurb = document.getElementById('potDescription').value;
  var newSold = document.getElementById('forsale').checked;
  var newCol = document.getElementById('potCol').value;
  var newPicture = document.getElementById('potpicturefile').files[0];

  reqBody = {
    "number": newNumber,
    "price": newPrice,
    "blurb": newBlurb,
    "sold": newSold,
    "collection": newCol,
  }
  console.log(JSON.stringify(reqBody))
  fetch("http://localhost:6970/newPot", {
    headers: {
      'Content-Type': 'application/json'
  },
    method: 'POST',
    body: JSON.stringify(reqBody)
  })
  .then(out => {
    if (out.ok) {
      document.getElementById('newPotForm').reset();
    }
  })
});

//event listener for editColForm that sends a post request to the server on /editCol
document.getElementById('editColForm').addEventListener('submit', function (event) {
  event.preventDefault();
  var newColName = document.getElementById('colName').value;
  var newColMembers = document.getElementById('colMembers').value;
  var overwrite = document.getElementById('overwrite').checked;

  reqBody = {
    "name": newColName,
    "members": newColMembers,
    "overwrite": overwrite
  }
  console.log(JSON.stringify(reqBody))
  fetch("http://localhost:6970/editCol", {
    headers: {
      'Content-Type': 'application/json'
  },
    method: 'POST',
    body: JSON.stringify(reqBody)
  })
  .then(out => {
    if (out.ok) {
      document.getElementById('editColForm').reset();
    } else {
      document.getElementById('colFormError').hidden = false;
    }
  })
});
