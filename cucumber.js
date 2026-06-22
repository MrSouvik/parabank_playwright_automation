module.exports = {
  default: {
    require: ['src/hooks/*.ts', 'src/steps/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'json:reports/cucumber-report.json',
      'allure-cucumberjs/reporter'
    ],
    formatOptions: {
      resultsDir: 'allure-results'
    },
    paths: ['features/**/*.feature'],
    parallel: 1
  }
}
