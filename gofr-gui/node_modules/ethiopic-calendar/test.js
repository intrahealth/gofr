const test = require('tape');
const { eg, ge, AA } = require('./index');

test(`Running 'eg'`, (t) => {
  t.plan(37);

  t.deepEqual(eg(1855, 2, 20), { year: 1862, month: 10, day: 29 }, '1862-10-29');
  t.deepEqual(eg(1857, 10, 29), { year: 1865, month: 7, day: 5 }, '1865-7-5');
  t.deepEqual(eg(1858, 5, 22), { year: 1866, month: 1, day: 29 }, '1858-5-22');
  t.deepEqual(eg(1858, 8, 10), { year: 1866, month: 4, day: 17 }, '1866-4-17');
  t.deepEqual(eg(1859, 4, 28), { year: 1867, month: 1, day: 5 }, '1867-1-5');
  t.deepEqual(eg(1860, 5, 5), { year: 1868, month: 1, day: 13 }, '1868-1-13');

  t.deepEqual(eg(5492, 5, 7, AA), { year: 0, month: 1, day: 1 }, '0-1-1');
  t.deepEqual(eg(5493, 5, 8, AA), { year: 1, month: 1, day: 1 }, '1-1-1');
  t.deepEqual(eg(5499, 13, 6, AA), { year: 7, month: 8, day: 27 }, '7-8-27');

  t.deepEqual(eg(5500, 1, 1, AA), { year: 7, month: 8, day: 28 }, '7-8-28');
  t.deepEqual(eg(5500, 1, 2, AA), { year: 7, month: 8, day: 29 }, '1-1-1');
  t.deepEqual(eg(1, 1, 1), { year: 8, month: 8, day: 27 }, '8-8-27');
  t.deepEqual(eg(2, 1, 1), { year: 9, month: 8, day: 27 }, '9-8-27');
  t.deepEqual(eg(3, 1, 1), { year: 10, month: 8, day: 27 }, '10-8-27');
  t.deepEqual(eg(4, 1, 1), { year: 11, month: 8, day: 28 }, '11-8-28');

  t.deepEqual(eg(5500, 13, 5, AA), { year: 8, month: 8, day: 26 }, '8-8-26');
  t.deepEqual(eg(1, 13, 5), { year: 9, month: 8, day: 26 }, '9-8-26');
  t.deepEqual(eg(2, 13, 5), { year: 10, month: 8, day: 26 }, '10-8-26');
  t.deepEqual(eg(3, 13, 5), { year: 11, month: 8, day: 26 }, '11-8-26');
  t.deepEqual(eg(3, 13, 6), { year: 11, month: 8, day: 27 }, '11-8-27');
  t.deepEqual(eg(4, 13, 5), { year: 12, month: 8, day: 26 }, '12-8-26');

  t.deepEqual(eg(1575, 2, 6), { year: 1582, month: 10, day: 13 }, '1582-10-13');
  t.deepEqual(eg(1575, 2, 7), { year: 1582, month: 10, day: 14 }, '1582-10-14');

  t.deepEqual(eg(1575, 2, 8), { year: 1582, month: 10, day: 15 }, '1582-10-15');
  t.deepEqual(eg(1575, 2, 9), { year: 1582, month: 10, day: 16 }, '1582-10-16');

  t.deepEqual(eg(1892, 4, 23), { year: 1900, month: 1, day: 1 }, '1900-1-1');
  t.deepEqual(eg(1997, 4, 23), { year: 2005, month: 1, day: 1 }, '2005-1-1');
  t.deepEqual(eg(2000, 13, 5), { year: 2008, month: 9, day: 10 }, '2008-9-10');

  t.deepEqual(eg(1893, 4, 22), { year: 1900, month: 12, day: 31 }, '1900-12-31');
  t.deepEqual(eg(1985, 4, 22), { year: 1992, month: 12, day: 31 }, '1992-12-31');
  t.deepEqual(eg(1989, 4, 22), { year: 1996, month: 12, day: 31 }, '1996-12-31');
  t.deepEqual(eg(1993, 4, 22), { year: 2000, month: 12, day: 31 }, '2000-12-31');
  t.deepEqual(eg(1997, 4, 22), { year: 2004, month: 12, day: 31 }, '2004-12-31');
  t.deepEqual(eg(2001, 4, 22), { year: 2008, month: 12, day: 31 }, '2008-12-31');
  t.deepEqual(eg(2993, 4, 14), { year: 3000, month: 12, day: 31 }, '3000-12-31');
  t.deepEqual(eg(3993, 4, 7), { year: 4000, month: 12, day: 31 }, '4000-12-31');
  t.deepEqual(eg(5993, 3, 22), { year: 6000, month: 12, day: 31 }, '6000-12-31');
});

test(`Running 'ge'`, (t) => {
  t.plan(37);

  t.deepEqual(ge(1862, 10, 29), { year: 1855, month: 2, day: 20 }, '1855-2-20');
  t.deepEqual(ge(1865, 7, 5), { year: 1857, month: 10, day: 29 }, '1857-10-29');
  t.deepEqual(ge(1866, 1, 29), { year: 1858, month: 5, day: 22 }, '1858-5-22');
  t.deepEqual(ge(1866, 4, 17), { year: 1858, month: 8, day: 10 }, '1858-8-10');
  t.deepEqual(ge(1867, 1, 5), { year: 1859, month: 4, day: 28 }, '1859-4-28');
  t.deepEqual(ge(1868, 1, 13), { year: 1860, month: 5, day: 5 }, '1860-5-5');

  t.deepEqual(ge(0, 1, 1), { year: 5492, month: 5, day: 7 }, '5492-5-7');
  t.deepEqual(ge(1, 1, 1), { year: 5493, month: 5, day: 8 }, '5493-5-8');
  t.deepEqual(ge(7, 8, 27), { year: 5499, month: 13, day: 6 }, '5499-13-6');

  t.deepEqual(ge(7, 8, 28), { year: 5500, month: 1, day: 1 }, '5500-1-1');
  t.deepEqual(ge(7, 8, 29), { year: 5500, month: 1, day: 2 }, '5500-1-2');
  t.deepEqual(ge(8, 8, 27), { year: 1, month: 1, day: 1 }, '1-1-1');
  t.deepEqual(ge(9, 8, 27), { year: 2, month: 1, day: 1 }, '2-1-1');
  t.deepEqual(ge(10, 8, 27), { year: 3, month: 1, day: 1 }, '3-1-1');
  t.deepEqual(ge(11, 8, 28), { year: 4, month: 1, day: 1 }, '4-1-1');

  t.deepEqual(ge(8, 8, 26), { year: 5500, month: 13, day: 5 }, '5500-13-5');
  t.deepEqual(ge(9, 8, 26), { year: 1, month: 13, day: 5 }, '1-13-5');
  t.deepEqual(ge(10, 8, 26), { year: 2, month: 13, day: 5 }, '2-13-5');
  t.deepEqual(ge(11, 8, 26), { year: 3, month: 13, day: 5 }, '3-13-5');
  t.deepEqual(ge(11, 8, 27), { year: 3, month: 13, day: 6 }, '3-13-6');
  t.deepEqual(ge(12, 8, 26), { year: 4, month: 13, day: 5 }, '4-13-5');

  t.deepEqual(ge(1582, 10, 13), { year: 1575, month: 2, day: 6 }, '1575-2-6');
  t.deepEqual(ge(1582, 10, 14), { year: 1575, month: 2, day: 7 }, '1575-2-7');

  t.deepEqual(ge(1582, 10, 15), { year: 1575, month: 2, day: 8 }, '1575-2-8');
  t.deepEqual(ge(1582, 10, 16), { year: 1575, month: 2, day: 9 }, '1575-2-9');

  t.deepEqual(ge(1900, 1, 1), { year: 1892, month: 4, day: 23 }, '1892-4-23');
  t.deepEqual(ge(2005, 1, 1), { year: 1997, month: 4, day: 23 }, '1997-4-23');
  t.deepEqual(ge(2008, 9, 10), { year: 2000, month: 13, day: 5 }, '2000-13-5');

  t.deepEqual(ge(1900, 12, 31), { year: 1893, month: 4, day: 22 }, '1893-4-22');
  t.deepEqual(ge(1992, 12, 31), { year: 1985, month: 4, day: 22 }, '1985-4-22');
  t.deepEqual(ge(1996, 12, 31), { year: 1989, month: 4, day: 22 }, '1989-4-22');
  t.deepEqual(ge(2000, 12, 31), { year: 1993, month: 4, day: 22 }, '1993-4-22');
  t.deepEqual(ge(2004, 12, 31), { year: 1997, month: 4, day: 22 }, '1997-4-22');
  t.deepEqual(ge(2008, 12, 31), { year: 2001, month: 4, day: 22 }, '2001-4-22');
  t.deepEqual(ge(3000, 12, 31), { year: 2993, month: 4, day: 14 }, '2993-4-22');
  t.deepEqual(ge(4000, 12, 31), { year: 3993, month: 4, day: 7 }, '3993-4-7');
  t.deepEqual(ge(6000, 12, 31), { year: 5993, month: 3, day: 22 }, '5993-3-22');
});
