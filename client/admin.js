// initialise MDB inputs
document.querySelectorAll('.form-outline').forEach((formOutline) => {
  new mdb.Input(formOutline).init();
});

// initialise MDB ripple effect
document.querySelectorAll('.ripple').forEach((ripple) => {
  new mdb.Ripple(ripple).init();
  });

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

//event listener for browsePots that sends a get request to the server on /browsePots
document.getElementById('browsePots').addEventListener('submit', function (event) {
  event.preventDefault();
  var inputParams = document.getElementById('browseParam').value;
  var inputVal = document.getElementById('browseTerm').value;
  fetch("http://localhost:6970/browsePots?param=" + inputParams + "&term=" + inputVal)
  .then(out => out.json())
  .then(out => {
    var browseResults = document.getElementById('browseResults');
    while (browseResults.firstChild) {
      browseResults.removeChild(browseResults.firstChild);
    }
    if (out.length == 0) {
      document.getElementById('browseFormError').hidden = false;
      setTimeout(() => {
        document.getElementById("noResultsWarning").hidden = true;
      }, 5000);
      return;
    } else {
      document.getElementById('browseFormError').hidden = true;
      document.getElementById('browsePots').reset();
      for (i of out) {
        termColumn = document.createElement('div');
        termColumn.className = 'col-6 col-sm-4 m-2 col-md-3 col-lg-2 p-2 bg-image rounded-2 collectionIcon text-light d-flex align-items-center justify-content-center align-content-center';
        termColumn.innerHTML = i['number'];
        termColumn.style.backgroundImage = "url('http://localhost:6970/images/" + i['number'] + "')";
        browseResults.appendChild(termColumn);
      }
      document.getElementById('browseResultsContainer').hidden = false;
    }
  })  
  .catch(err => console.log(err))
})