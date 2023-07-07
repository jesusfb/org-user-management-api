const config = require('#config');

module.exports = function checkEnvironmentVariables() {
  config.ENVS_VARS.forEach((variable) => {
    if (!process.env[variable]) {
      console.error(`Environment variable ${variable} is missing.`);
      process.exit(1);
    }
  });
};
