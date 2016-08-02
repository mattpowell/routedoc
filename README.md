[![Build Status](https://travis-ci.org/mattpowell/routedoc.svg?branch=master)](https://travis-ci.org/mattpowell/routedoc) [![codecov](https://codecov.io/gh/mattpowell/routedoc/branch/master/graph/badge.svg)](https://codecov.io/gh/mattpowell/routedoc)
WIP
===
***
# routedoc &mdash; _documentation for routes._
`routedoc` is a tool for documenting and generating routes.

Example
===
```
/**
 * Api endpoint for searching the database
 * @name api-search
 * @param {string} q - text to query for.
 * @returns {SearchResultsJson}
 */
GET /search
```
TODO
===
- [ ] Finish README documentation
- [ ] Support multiple route files
- [ ] Api for generating urls from a route (e.g., `routedoc.toUrl('api-search', { q: 'routedoc'})` => `'/search?q=routedoc'`)
- [ ] Combine w/ Typedef to actually do type validation and coercion for params/returns
- [ ] ...?
