'use strict'
const ilegalChars = new RegExp(/[|*&;$%"'`=/\\\\<>(){}+,]/g);
module.exports = ilegalChars;