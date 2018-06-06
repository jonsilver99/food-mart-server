'use strict'
const ilegalProductChars = new RegExp(/[|*&;$%"`=/\\\\<>(){}+]/g);
module.exports = ilegalProductChars;