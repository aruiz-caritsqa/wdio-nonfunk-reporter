const events = require('events')
const Handlebars = require('handlebars')
const fs = require('fs-extra')
const _ = require('lodash');
const path = require('path')
const moment = require('moment')
const momentDurationFormatSetup = require("moment-duration-format")
momentDurationFormatSetup(moment)
require('locus')
const VisualReporter = require('./visual_reporter')

class NonfunkReporter extends events.EventEmitter {
    constructor (baseReporter, config, options = {}) {
        super()

        this.baseReporter = baseReporter

        this.visualData = {}
        this.accessibilityData = {}
        this.performanceData = {}
        this.securityData = {}
        this.loadData = {}

        this.on('runner:start', function (runner) {
          this.visualData[runner.cid] = {
            title: "",
            specfile: "",
            duration: 0,
            screenshots: [],
          }
        })
        //
        // this.on('suite:start', function (suite) {
        // })
        //
        // this.on('test:pending', function (test) {
        // })
        //
        // this.on('test:pass', function (test) {
        // })
        //
        // this.on('runner:screenshot', function (runner) {
        // })

        this.on('nonfunk:visual:screenshot', function(data) {
          const cid = data.cid

          console.log(JSON.stringify(this.visualData, null, 2))

          this.visualData[cid].screenshots.push({
            filename: data.filename,
            url: data.url,
            desc: data.desc
          })
        })

        this.on('suite:end', function (suite) {
          this.visualData[suite.cid].title = suite.title
          this.visualData[suite.cid].specfile = suite.file
          this.visualData[suite.cid].duration = suite.duration
        })
        //
        this.on('runner:end', function (runner) {
          VisualReporter.runComparison(this.baseReporter.stats.runners[runner.cid].config, this.visualData[runner.cid].screenshots)

          console.log("AFTER COMPARISON:")
          console.log(JSON.stringify(this.visualData, null, 2))
        })

        this.on('end', function () {
          VisualReporter.runKoboldComparison(this.visualData)
        })

    }




    htmlOutput() {

      //
      //
      //
      //
      //
      //
      //
      // let source = fs.readFileSync(path.resolve(__dirname, '../lib/wdio-html-reporter-template.hbs'), 'utf8')
      //
      // Handlebars.registerHelper('imageAsBase64', function(screenshotFile, screenshotPath, options) {
      //   if (!fs.existsSync(screenshotFile)) {
      //     const fullpath = `${screenshotPath}/${screenshotFile}`
      //     return `data:image/png;base64,${fs.readFileSync(fullpath, 'base64')}`
      //   } else {
      //     return `data:image/png;base64,${fs.readFileSync(screenshotFile, 'base64')}`
      //   }
      // })
      //
      // Handlebars.registerHelper('isValidSuite', function(suite, options) {
      //   if (suite.title.length > 0 && suite.uid.match(new RegExp(suite.title))) {
      //     return options.fn(this)
      //   }
      //   return options.inverse(this)
      // })
      //
      // Handlebars.registerHelper('testStateColour', function(state, options) {
      //   if (state === 'pass') {
      //     return 'test-pass'
      //   } else if (state === 'fail') {
      //     return 'test-fail'
      //   } else if (state === 'pending') {
      //     return 'test-pending'
      //   }
      // })
      //
      // Handlebars.registerHelper('suiteStateColour', function(tests, options) {
      //   let numTests = Object.keys(tests).length
      //
      //   let fail = _.values(tests).find((test) => {
      //     return test.state === 'fail'
      //   })
      //   if (fail != null) {
      //     return 'suite-fail'
      //   }
      //
      //   let pending = _.values(tests).find((test) => {
      //     return test.state === 'pending'
      //   })
      //   if (pending != null) {
      //     return 'suite-pending'
      //   }
      //
      //   let passes = _.values(tests).filter((test) => {
      //     return test.state === 'pass'
      //   })
      //   if (passes.length === numTests && numTests > 0) {
      //     return 'suite-pass'
      //   }
      //
      //   return 'suite-unknown'
      //
      // })
      //
      // Handlebars.registerHelper('humanizeDuration', function(duration, options) {
      //   return moment.duration(duration, "milliseconds").format('hh:mm:ss.SS', {trim: false})
      // })
      //
      // Handlebars.registerHelper('ifSuiteHasTests', function(testsHash, options) {
      //     if (Object.keys(testsHash).length > 0) {
      //       return options.fn(this)
      //     }
      //     return options.inverse(this)
      // })
      //
      // const template = Handlebars.compile(source)
      // const data = {stats: this.baseReporter.stats}
      // const result = template(data)
      //
      // fs.outputFileSync('./wdio-report.html', result);
    }
}
module.exports = NonfunkReporter
