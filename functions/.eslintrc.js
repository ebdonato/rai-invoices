module.exports = {
    root: true,
    env: {
        es2021: true,
        node: true,
    },
    extends: ["eslint:recommended", "prettier"],
    rules: {
        quotes: ["error", "double"],
    },
}
