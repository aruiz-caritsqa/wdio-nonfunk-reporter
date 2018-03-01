const fs = require('fs-extra')
const Handlebars = require('handlebars')
const BlinkDiff = require('blink-diff')
const moment = require('moment')
const momentDurationFormatSetup = require("moment-duration-format")
momentDurationFormatSetup(moment)

require('locus')

class VisualReporter {

  runComparison(config, visualData) {
    const testPath = config.nonFunctionalRegressionOptions.visual.kobold.testPath
    const approvedFolder = `${testPath}/${config.nonFunctionalRegressionOptions.visual.kobold.approvedFolder}`
    const currentFolder = `${testPath}/${config.nonFunctionalRegressionOptions.visual.kobold.buildFolder}`
    const highlightFolder = `${testPath}/${config.nonFunctionalRegressionOptions.visual.kobold.highlightFolder}`

    fs.ensureDirSync(`${__dirname}/../../../${highlightFolder}`)
    const currentScreenshots = fs.readdirSync(currentFolder)
    const numCurrentScreenshots = currentScreenshots.length
    currentScreenshots.forEach((currentScreenshot, i) => {
      console.log(`==> Comparing ${currentScreenshot} ${i}/${numCurrentScreenshots}`)

      if (!fs.existsSync(`${approvedFolder}/${currentScreenshot}`)) {
        console.log(`====> Couldn't find: ${approvedFolder}/${currentScreenshot}`)
        const s = visualData.find((screenshot) => {return screenshot.filename.match(new RegExp(currentScreenshot))})
        if (s != null) {
          s['status'] = 'screen-new'
        } else {
          console.log(`==> Can't find ${currentScreenshot} in the visualData`)
        }

      } else {
        let diff = new BlinkDiff({
          imageAPath: `${__dirname}/../../../${approvedFolder}/${currentScreenshot}`,
          imageBPath: `${__dirname}/../../../${currentFolder}/${currentScreenshot}`,
          thresholdType: BlinkDiff.THRESHOLD_PERCENT,
          threshold: 0.02, // 2% threshold
          imageOutputPath: `${__dirname}/../../../${highlightFolder}/${currentScreenshot}`,
        })

        let result = diff.runSync()
        const screenInResults = visualData.find((screenshot) => {return screenshot.filename.match(new RegExp(currentScreenshot))})

        if (result.code == BlinkDiff.RESULT_DIFFERENT) {
          screenInResults['status'] = 'screen-different'
          screenInResults['diff'] = `${highlightFolder}/${currentScreenshot}`
        } else if (result.code == BlinkDiff.RESULT_IDENTICAL) {
          screenInResults['status'] = 'screen-identical'
        } else if (result.code == BlinkDiff.RESULT_SIMILAR) {
          screenInResults['status'] = 'screen-similar'
          screenInResults['diff'] = `${highlightFolder}/${currentScreenshot}`
        } else if (result.code == BlinkDiff.RESULT_UNKNOWN) {
          screenInResults['status'] = 'screen-unknown'
        }
      }
    })
  }

  runKoboldComparison(visualData) {
    Handlebars.registerHelper('humanizeDuration', function(duration, options) {
      return moment.duration(duration, "milliseconds").format('hh:mm:ss.SS', {trim: false})
    })

    Handlebars.registerHelper('largeScreenshot', function(screenshot, options) {
      if (screenshot.status === 'screen-different' || screenshot.status === 'screen-similar') {
        return screenshot.diff
      } else {
        return screenshot.filename
      }
    })

    const template = Handlebars.compile(fs.readFileSync(`${__dirname}/visual_template.hbs`, 'utf8'))
    const result = template({runners: visualData})
    fs.outputFileSync('new-visual-report.html', result);
  }
}
module.exports = new VisualReporter()
