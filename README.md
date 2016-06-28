# UBI Administration panel

## To run:

1. Clone repo
2. run npm install
3. run bower install
4. Refer to the Gruntfile.js for your desired initial build task, however "grunt dev" is a good starting point
5. View the project on localhost

## Notes:

- Only for examinging code, API endpoints are internal only
- Project has been worked on by a total of two people and went through a phase of major refactoring early, however not all code has been re-written

## Features:

- Custom search module
- Architecture & Routing prepared for large scale development

## Versioning

- Using grunt-replace I have enabled the index file to be the leanest possible
- Versioning is controlled using the package.json and bower.json files.
- Project files are built into dist folder with current version ammended
- Index file is ammended with the current version changes
- Index file is adjusted to match the minified or debug versions of the build, depending on grunt task used.
