<!-- Search is the vital first step that comes before endpoint authentication and execution. It should be done super well. -->

# Superfast search

- ✅ For now implement `POST /search` as a simple filter over `providerSlugs` and returns `providers.json` subset
- Each change made to the input bar, throw it through a `isQuerySearchableValidator => boolean` and if `true`, call `POST /search` and store the response into `localStorage.searches:{"query":{version,createdAt,result}}`.
- On `GET /search` try getting it from localStorage first (new enough, same version, same query) or call `/search` if not available.
- Results render nicely with app logo + description

<!-- IMPLEMENT THIS ASAP AS A FIRST NICE DEMO -->

# Recording Search

- ✅ Hold control to record
- Find Deepgram examples for streaming in HTML and/or Edge
- Make edge streaming endpoint to stream recording to Deepgram and stream back the transcript directly.
- Fill transcript in the search bar while streaming. Depending on how long the recording took and how many words are there already, when done, immediately go to `search.html?q=` or wait for a couple hundred MS and then go.
- Implement `isQuerySearchableValidator(q)=>boolean`: last word part is a known word or name
- Ratelimit this endpoint per IP

# Personal Hybrid Semantic Search

- 🤔 Can I make a Semantic Search over providers.json via local ActionSchema? How to make semantic search the fastest over edge/api? Build this as a part of the CRUD OpenAPI or separate if it gives more possibilities, but it needs sync.
- For top 10 results, do follow up search in the endpoints with slightly different prompt and find top endpoints. Can I make semantic search over semantic openapi summaries too?
- Authenticated apps get 2x weighted factor over new ones
