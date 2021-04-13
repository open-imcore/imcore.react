module.exports = {
    babel: process.env.REACT_APP_WDYR === "I_WANTED_TO" ? {
        loaderOptions: (babelLoaderOptions) => {
            console.log("🚨 Building with WDYR injected. This is terrible for perf. Only use for render profiling.");

            const origBabelPresetCRAIndex = babelLoaderOptions.presets.findIndex((preset) => {
                return preset[0].includes("babel-preset-react-app");
            });

            const origBabelPresetCRA = babelLoaderOptions.presets[origBabelPresetCRAIndex];

            babelLoaderOptions.presets[origBabelPresetCRAIndex] = function overridenPresetCRA(api, opts, env) {
                const babelPresetCRAResult = require(
                    origBabelPresetCRA[0]
                )(api, origBabelPresetCRA[1], env);

                babelPresetCRAResult.presets.forEach(preset => {
                    // detect @babel/preset-react with {development: true, runtime: 'automatic'}
                    if (!preset || !preset[1] || preset[1].runtime !== "automatic" || !preset[1].development) return;
                    preset[1].importSource = "@welldone-software/why-did-you-render";
                });

                return babelPresetCRAResult;
            };

            return babelLoaderOptions;
        },
    } : {},
    webpack: {
        configure: config => {
            if (process.env.STAGING) {
                config.mode = "development";
                config.optimization.minimize = false;
                config.optimization.minimizer = [];

                console.log("I'm making a ghetto production build.");
            }

            return config;
        }
    }
};