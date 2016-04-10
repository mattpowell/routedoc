[![Build Status](https://travis-ci.org/mattpowell/routedoc.svg?branch=master)](https://travis-ci.org/mattpowell/routedoc) [![codecov.io](https://codecov.io/github/mattpowell/routedoc/coverage.svg?branch=master)](https://codecov.io/github/mattpowell/routedoc?branch=master)
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