# Ethiopic-Calendar [![Build Status](https://travis-ci.org/moe-szyslak/Ethiopic-Calendar.svg?branch=master)](https://travis-ci.org/moe-szyslak/Ethiopic-Calendar)

JavaScript implementation of [Beyene-Kudlek](http://geez.org/Calendars/) algorithm.

### Installation
`npm install ethiopic-calendar --save`

### Usage
```javascript
const { isGregorianLeap, gj, je, eg, ge, AA, AM  } = require('ethiopic-calendar');

// isGregorianLeap(Year) -> Boolean;
// gj(Year, Month, Day) -> Number; given Gregorian returns JDN
// je(JDN[, era]) -> { year, month, day }; given JDN returns Ethiopic equivalent
// eg(year, month, day[, era]) -> { year, month, day }; converts Ethiopic to Gregorian
// ge(year, month, day) -> { year, month, day }; converts Gregorian to Ethiopic
// AA -> Number; ዓ/ዓ JD offset
// AM -> Number; ዓ/ም JD offset (default era for je and eg)
```

### TODO
- [X] Pass ESLint rules
- [X] Tests
- [ ] Make functions pure
