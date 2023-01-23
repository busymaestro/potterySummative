// initialise MDB inputs
document.querySelectorAll('.form-outline').forEach(function (formOutline) {
  // eslint-disable-next-line
  new mdb.Input(formOutline).init();
});

// initialise MDB ripple effect
document.querySelectorAll('.ripple').forEach(function (ripple) {
  // eslint-disable-next-line
  new mdb.Ripple(ripple).init();
  });

//  messages function on dom loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:6970/messages')
    .then(out => out.json())
    .then(out => {
      for (const i of out) {
        const cardRow = document.createElement('div');
        cardRow.className = 'row px-3';
        const separator1 = document.createElement('div');
        separator1.className = 'col-12 col-md-6';
        cardRow.appendChild(separator1);
        const email = document.createElement('p');
        email.className = 'text-light';
        email.innerHTML = i.email;
        separator1.appendChild(email);
        const separator2 = document.createElement('div');
        separator2.className = 'col-12 col-md-6';
        cardRow.appendChild(separator2);
        const message = document.createElement('p');
        message.className = 'text-white-50';
        message.innerHTML = i.message;
        separator2.appendChild(message);

        document.getElementById('messagesList').appendChild(cardRow);
      }
    });
  });
} else {
    fetch('http://localhost:6970/messages')
    .then(out => out.json())
    .then(out => {
      for (const i of out) {
        const cardRow = document.createElement('div');
        cardRow.className = 'row px-3';
        const separator1 = document.createElement('div');
        separator1.className = 'col-12 col-md-6';
        cardRow.appendChild(separator1);
        const email = document.createElement('p');
        email.className = 'text-light';
        email.innerHTML = i.email;
        separator1.appendChild(email);
        const separator2 = document.createElement('div');
        separator2.className = 'col-12 col-md-6';
        cardRow.appendChild(separator2);
        const message = document.createElement('p');
        message.className = 'text-white-50';
        message.innerHTML = i.message;
        separator2.appendChild(message);

        document.getElementById('messagesList').appendChild(cardRow);
      }
    });
  }

//  creates a new pot
document.getElementById('newPotForm').addEventListener('submit', function (event) {
  event.preventDefault();
  const newNumber = document.getElementById('potNumber').value;
  const newPrice = document.getElementById('potPrice').value;
  const newBlurb = document.getElementById('potDescription').value;
  const newSold = document.getElementById('forsale').checked;
  const newCol = document.getElementById('potCol').value;
  const newPicture = document.getElementById('potpicturefile').files[0];

  const reqBody = {
    number: newNumber,
    price: newPrice,
    blurb: newBlurb,
    sold: newSold,
    collection: newCol
  };
  console.log(JSON.stringify(reqBody));
  fetch('http://localhost:6970/newPot', {
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
  });
});

//  edits or creates a new collection
document.getElementById('editColForm').addEventListener('submit', function (event) {
  event.preventDefault();
  const newColName = document.getElementById('colName').value;
  const newColMembers = document.getElementById('colMembers').value;
  const overwrite = document.getElementById('overwrite').checked;

  const reqBody = {
    name: newColName,
    members: newColMembers,
    overwrite
  };
  fetch('http://localhost:6970/editCol', {
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
  });
});

// lists and filters pots by number, price or blurb
document.getElementById('browsePots').addEventListener('submit', function (event) {
  event.preventDefault();
  const inputParams = document.getElementById('browseParam').value;
  const inputVal = document.getElementById('browseTerm').value;
  fetch('http://localhost:6970/browsePots?param=' + inputParams + '&term=' + inputVal)
  .then(out => out.json())
  .then(out => {
    const browseResults = document.getElementById('browseResults');
    while (browseResults.firstChild) {
      browseResults.removeChild(browseResults.firstChild);
    }
    if (out.length === 0) {
      document.getElementById('browseFormError').hidden = false;
      setTimeout(() => {
        document.getElementById('noResultsWarning').hidden = true;
      }, 5000);
    } else {
      document.getElementById('browseFormError').hidden = true;
      document.getElementById('browsePots').reset();
      for (const i of out) {
        const termColumn = document.createElement('div');
        termColumn.className = 'col-6 col-sm-4 m-2 col-md-3 col-lg-2 p-2 bg-image rounded-2 collectionIcon text-light d-flex align-items-center justify-content-center align-content-center';
        termColumn.innerHTML = i.number;
        termColumn.style.backgroundImage = "url('http://localhost:6970/images/" + i.number + "')";
        browseResults.appendChild(termColumn);
      }
      document.getElementById('browseResultsContainer').hidden = false;
    }
  })
  .catch(err => console.log(err));
});
