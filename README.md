# leap-card
Easily retrieve your Dublin Leap Card informations

## Description

This package retrieves your Dublin Bus Leap Card informations and returns them into a pretty JSON.

## Usage

```
var leapcard = require('leap-card');
leapcard.getCardsInfo('username','password', function(err, data) {

    if(err) {
        console.log(err);
        return
    }

    console.log(data);

});
```
