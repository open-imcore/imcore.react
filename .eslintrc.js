module.exports = {
  "extends": ["react-app"],
  "rules": {
    quotes: ["error", "double"],
    semi: ["error", "always"]
  },
  "overrides": [
    {
      "files": ["**/*.ts?(x)"],
      "rules": {
        "react-hooks/exhaustive-deps": "off",
        "import/first": "off"
      }
    }
  ]
};