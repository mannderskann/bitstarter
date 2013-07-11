#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT ="www.google.de";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        //console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var getFileSync = function(url, checks){
    rest.get(url).on('complete', function(result) {
        if (result instanceof Error) {
          //console.log("ERROR restler")
          this.retry(5000); // try again after 5 sec
        } else {
          //console.log ( __dirname + "/downloaded.html");
          fs.writeFile(__dirname + "/downloaded.html", result, function(err) {
              check("downloaded.html", checks);
          });
          
        }
    });
};

function check(file, checks) {
    var checkJson = checkHtmlFile(file, checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <jsonfile>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --url <htmlurl>', 'Url to html file' )
        .option('-f, --file <htmlfile', 'Path to index.html')
        
        .parse(process.argv);

    if (program.url) {
      getFileSync(String(program.url), program.checks);
    } else if (program.file) {
      check(program.file, program.checks)
    }

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
