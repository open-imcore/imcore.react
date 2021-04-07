module.exports = function override(config, env) {
  if (process.env.STAGING) {
    config.mode = "development";
    config.optimization.minimize = false;
    config.optimization.minimizer = [];

    console.log("I'm making a ghetto production build.");
  }

  return config;
};
