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

    this.on('runner:end', function (runner) {
      VisualReporter.runComparison(this.baseReporter.stats.runners[runner.cid].config, this.visualData[runner.cid].screenshots)

      console.log("AFTER COMPARISON:")
      console.log(JSON.stringify(this.visualData, null, 2))
    })

    this.on('end', function () {
      VisualReporter.runKoboldComparison(this.visualData)
    })
  }
}
module.exports = NonfunkReporter
