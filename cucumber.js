require('dotenv').config();

module.exports = {
  default: {
    require: ['src/hooks/*.ts', 'src/steps/*.ts'],
    requireModule: ['ts-node/register'],
    tags: process.env.TAGS || '@smoke',
    format: [
      'progress-bar',
      'json:reports/cucumber-report.json',
      'allure-cucumberjs/reporter'
    ],
    formatOptions: {
      resultsDir: 'allure-results',
      singleFile: true
    },
    paths: ['features/**/*.feature'],
    parallel: 1
  }
}