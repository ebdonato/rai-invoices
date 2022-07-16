module.exports = {
    root: true,
    env: {
        es2019: true,
        node: true,
    },
    extends: ["eslint:recommended", "prettier"],
    rules: {
        quotes: ["error", "double"],
    },
}
