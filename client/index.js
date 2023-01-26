
// POTD functionality
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        fetch('http://localhost:6970/potd')
            .then(out => out.json())
            .then(out => {
                for (const [key, value] of Object.entries(out)) {
                    if (key === 'price' || key === 'blurb') {
                        document.getElementById('potd' + key).innerHTML = value;
                    } else if (key === 'number') {
                        document.getElementById('potd' + key).innerHTML = '#' + value;
                    }
                }
                document.getElementById('potdimage').style.backgroundImage = 'url(http://localhost:6970/images/' + out.number + ')';
                document.getElementById('potdBuyButton').value = out.number;
                if (out.sold === true) {
                    document.getElementById('potdBuyButton').innerHTML = 'Sold';
                    document.getElementById('potdBuyButton').disabled = true;
                }
        }).catch(err => {
            console.log(err);
            if (err.message.includes('Failed to fetch')) {
                document.getElementById('connectionErrorMessage').hidden = false;
                setTimeout(() => {
                    document.getElementById('connectionErrorMessage').hidden = true;
                }, 5000);
            };
        });
    });
} else {
    fetch('http://localhost:6970/potd')
            .then(out => out.json())
            .then(out => {
                for (const [key, value] of Object.entries(out)) {
                    if (key === 'price' || key === 'blurb') {
                        document.getElementById('potd' + key).innerHTML = value;
                    } else if (key === 'number') {
                        document.getElementById('potd' + key).innerHTML = '#' + value;
                    }
                }
                document.getElementById('potdimage').style.backgroundImage = 'url(http://localhost:6970/images/' + out.number + ')';
                document.getElementById('potdBuyButton').value = out.number;
                if (out.sold === true) {
                    document.getElementById('potdBuyButton').innerHTML = 'Sold';
                    document.getElementById('potdBuyButton').disabled = true;
                }
        }).catch(err => {
            console.log(err);
            if (err.message.includes('Failed to fetch')) {
                document.getElementById('connectionErrorMessage').hidden = false;
                setTimeout(() => {
                    document.getElementById('connectionErrorMessage').hidden = true;
                }, 5000);
            };
        });
}

//  potd buy button
document.getElementById('potdBuyButton').addEventListener('click', function () {
    const number = this.value;
    fetch('http://localhost:6970/buy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ number })
    })
    .then(res => {
        if (res.ok) {
            document.getElementById('potdBuyButton').innerHTML = 'Sold';
            document.getElementById('potdBuyButton').disabled = true;
        }
    })
    .catch(err => {
        console.log(err);
        if (err.message.includes('Failed to fetch')) {
            document.getElementById('connectionErrorMessage').hidden = false;
            setTimeout(() => {
                document.getElementById('connectionErrorMessage').hidden = true;
            }, 5000);
        };
    });
});

//  initialise MDB inputs
document.querySelectorAll('.form-outline').forEach((formOutline) => {
    // eslint-disable-next-line
    new mdb.Input(formOutline).init();
  });

// initialise MDB ripple effect
document.querySelectorAll('.ripple').forEach((ripple) => {
    // eslint-disable-next-line
    new mdb.Ripple(ripple).init();
    });

//  search function for a single pot
function singlePotSearch (number) {
    fetch('http://localhost:6970/singlePot?number=' + number)
        .then(res => res.json())
        .then(res => {
            for (const [key, value] of Object.entries(res[0])) {
                if (key === 'price' || key === 'blurb') {
                    document.getElementById('search' + key).innerHTML = value;
                } else if (key === 'number') {
                    document.getElementById('search' + key).innerHTML = '#' + value;
                };
            }
            document.getElementById('searchpicture').src = 'http://localhost:6970/images/' + res[0].number;
            document.getElementById('searchBuyButton').value = res[0].value;
            if (res[0].sold === true) {
                document.getElementById('searchBuyButton').innerHTML = 'Sold';
                document.getElementById('searchBuyButton').disabled = true;
            } else {
                document.getElementById('searchBuyButton').innerHTML = 'Buy now';
                document.getElementById('searchBuyButton').disabled = false;
                document.getElementById('searchBuyButton').addEventListener('click', function () {
                    fetch('http://localhost:6970/buy', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ number: this.value })
                    })
                    .then(res => {
                        if (res.ok) {
                            document.getElementById('searchBuyButton').innerHTML = 'Sold';
                            document.getElementById('searchBuyButton').disabled = true;
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        if (err.message.includes('Failed to fetch')) {
                            document.getElementById('connectionErrorMessage').hidden = false;
                            setTimeout(() => {
                                document.getElementById('connectionErrorMessage').hidden = true;
                            }, 5000);
                        };
                    });
                });
            }

            if (document.getElementById('searchResults').hidden === true) {
            document.getElementById('searchResults').hidden = false;
            if (document.getElementById('searchContainer').hidden === true) {
                document.getElementById('searchContainer').hidden = false;
            }
        }
        })
        .catch(err => {
            console.log(err);
            if (err.message.includes('Failed to fetch')) {
                document.getElementById('connectionErrorMessage').hidden = false;
                setTimeout(() => {
                    document.getElementById('connectionErrorMessage').hidden = true;
                }, 5000);
            };
        });
}

//  search function for a collection of pots
function collectionSearch (name) {
    fetch('http://localhost:6970/singleCollection?term=' + name)
        .then(res => res.json())
        .then(res => {
            while (document.getElementById('collectionSearchResults').firstChild) {
                document.getElementById('collectionSearchResults').removeChild(document.getElementById('collectionSearchResults').firstChild);
            }
            const heading = document.createElement('h3');
            heading.setAttribute('class', 'text-center');
            heading.innerHTML = 'Search results for ' + name.split('_').join(' ');
            document.getElementById('collectionSearchResults').appendChild(heading);
            if (res.length === 0) {
                document.getElementById('searchContainer').hidden = true;
                document.getElementById('noResultsWarning').hidden = false;
                setTimeout(() => {
                    document.getElementById('noResultsWarning').hidden = true;
                }, 5000);
                return;
            } else {
                for (const i of res) {
                    const column = document.createElement('div');
                    column.setAttribute('class', 'col-6 col-sm-4 col-md-3 col-lg-2 p-2 collectionIcon');

                    const link = document.createElement('a');
                    link.setAttribute('href', '#!');
                    link.setAttribute('id', 'searchresult' + String(i));
                    link.setAttribute('number', i);
                    column.appendChild(link);

                    const box = document.createElement('div');
                    box.setAttribute('class', 'h-100 bg-image rounded-5');
                    box.style.backgroundImage = 'url(\'http://localhost:6970/images/' + i + '\')';
                    box.style.backgroundPosition = 'center';
                    box.style.backgroundSize = 'cover';
                    link.appendChild(box);

                    const altText = document.createElement('p');
                    altText.setAttribute('class', 'visually-hidden');
                    altText.innerHTML = 'Click here for more info about pot number' + i;
                    link.appendChild(altText);

                    document.getElementById('collectionSearchResults').appendChild(column);
                    document.getElementById('searchresult' + String(i)).addEventListener('click', function (event) {
                        event.preventDefault();
                        singlePotSearch(parseInt(this.getAttribute('number')));
                    }
                    );
                }
            }
            document.getElementById('collectionSearchResults').hidden = false;
            document.getElementById('searchContainer').hidden = false;
        }).catch(err => {
            console.log(err);
            if (err.message.includes('Failed to fetch')) {
                document.getElementById('connectionErrorMessage').hidden = false;
                setTimeout(() => {
                    document.getElementById('connectionErrorMessage').hidden = true;
                }, 5000);
            };
        });
}

// search bar functionality
document.getElementById('searchForAPot').addEventListener('submit', function (event) {
    event.preventDefault();
    const searchTerm = document.getElementById('searchInput').value;
    const checkInt = parseInt(searchTerm);
    if (Number.isInteger(checkInt)) {
        document.getElementById('collectionSearchResults').innerHTML = '';
        if (document.getElementById('collectionSearchResults').hidden === false) {
            document.getElementById('collectionSearchResults').hidden = true;
        }
        singlePotSearch(searchTerm);
    } else {
        if (document.getElementById('searchResults').hidden === false) {
            document.getElementById('searchResults').hidden = true;
        }
        collectionSearch(searchTerm);
}
});

for (const i of document.querySelectorAll('.colButton')) {
    i.addEventListener('click', function (event) {
        if (document.getElementById('searchResults').hidden === false) {
            document.getElementById('searchResults').hidden = true;
        };
        collectionSearch(event.currentTarget.id);
    });
}

// contact me form functionality
document.getElementById('contactMeForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    fetch('http://localhost:6970/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, message })
    })
    .then(res => {
        if (res.ok) {
            document.getElementById('contactEmail').value = '';
            document.getElementById('contactMessage').value = '';
            document.getElementById('contactMeForm').hidden = true;
            document.getElementById('confirmMessage').hidden = false;
        } else {
            console.log(res);
        };
    })
    .catch(err => {
        console.log(err);
        if (err.message.includes('Failed to fetch')) {
            document.getElementById('connectionErrorMessage').hidden = false;
            setTimeout(() => {
                document.getElementById('connectionErrorMessage').hidden = true;
            }, 5000);
        };
    });
});

//  contact me form resubmission button
document.getElementById('resend').addEventListener('click', function () {
    document.getElementById('contactMeForm').reset();
    document.getElementById('confirmMessage').hidden = true;
    document.getElementById('contactMeForm').hidden = false;
});
