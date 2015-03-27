# leap-card  
> Easily retrieve your Dublin Leap Card informations

[![Build Status](https://travis-ci.org/tabman83/leap-card.svg?branch=master)](https://travis-ci.org/tabman83/leap-card) 
[![NPM Version](https://img.shields.io/npm/v/leap-card.svg)](https://www.npmjs.com/package/leap-card)
[![NPM Downloads](https://img.shields.io/npm/dm/leap-card.svg)](https://www.npmjs.com/package/leap-card)


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

## Disclaimer

Use with caution. This software may contain serious bugs. I can not be made responsible for
any damage the software may cause to your system or files.

## License

leap-card

Copyright (C) 2015 by Antonino Parisi <tabman83@gmail.com>

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.
