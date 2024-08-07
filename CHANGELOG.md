<!--

Search is the vital first step that comes before endpoint authentication and execution. It should be done super well.

1. User types in a request or records it, or gets sent a request from a phonecall or so.
2. '/search/providers' responds with selection of providers.
3. For each provider, a follow up `/search/operations`
4. User creates selection creates an oauth2-app, framework-sdk, or tests individual operations.

-->

# Superfast search (august 6th, 2024)

- ✅ For now implement `POST /search/providers` as a simple filter over `providerSlugs` and returns `providers.json` subset
- ✅ Each change made to the input bar, throw it through a `isQuerySearchableValidator => boolean` and if `true`, call `POST /search/providers` and store the response into `localStorage.searches:{"query":{version,createdAt,result}}`.
- ✅ On `GET /search` try getting it from localStorage first (new enough, same version, same query) or call `/search` if not available.
- ✅ Results render nicely
- ✅ Added a small link on `search.html` that links to a form to sign up for API Waitlist. In this form, also explain the features.
- ✅ Added a dynamic `reference.html` and link to it via `search.html`

# Recording Search (august 7th, 2024)

- ✅ Hold control to record
- ❌ Find Deepgram examples for streaming in HTML and/or Edge **GROQ is cheaper**
- ✅ send groq transcription and fill result as search
- ❌ Implement `isQuerySearchableValidator(q)=>boolean`: last word part is a known word or name **not relevant for slow query**
- ❌ Ratelimit this endpoint per IP. **groq has default general ratelimit for me as a free user**

# Provider search and selection (august 7th, 2024)

- ✅ For each provider result, call `/search/operations?q=%s&providerSlug={%p}` with same prompt and find top operations.
- ✅ Render all operations in a list with on the right the highlighting of the operations!
- ✅ For each operation, add 'try it now' button linking to `reference.html` in a new tab
- ✅ Operation selection
- ✅ Link to https://auth.actionschema.com/client/create?selection={providerSlug}:{operationId,operationId,operationId}&selection={....} to create a new client or add it to an existing client.
- ✅ Link to https://openapi-util.actionschema.com/generateSdk?selection={providerSlug}:{operationId,operationId,operationId}&selection={....} to create a new SDK.
- ✅ Button to copy it as config setting for ActionSchema-migrate
