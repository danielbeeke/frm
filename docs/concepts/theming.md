# Theming

FRM uses bootstrap but in such a way that it would be possible to write a theme with a different framework or even frameworkless.

There are only two places where you will find Bootstrap specific code:

`src/templates/bootstrap`
`src/scss/bootstrap`

These are then included in the defaultConfig. In the future there might be a base config without those includes.

