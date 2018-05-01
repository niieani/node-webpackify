require('jsdom-global')()
require('./file.css')
console.log(document.documentElement.innerHTML)
