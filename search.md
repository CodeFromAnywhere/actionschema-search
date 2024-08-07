<!--

Search is the vital first step that comes before endpoint authentication and execution. It should be done super well.

1. User types in a request or records it, or gets sent a request from a phonecall or so.
2. '/search/providers' responds with selection of providers.
3. For each provider, a follow up `/search/operations`
4. User creates selection creates an oauth2-app, framework-sdk, or tests individual operations.

-->

# Superfast search

- ✅ For now implement `POST /search/providers` as a simple filter over `providerSlugs` and returns `providers.json` subset
- ✅ Each change made to the input bar, throw it through a `isQuerySearchableValidator => boolean` and if `true`, call `POST /search/providers` and store the response into `localStorage.searches:{"query":{version,createdAt,result}}`.
- ✅ On `GET /search` try getting it from localStorage first (new enough, same version, same query) or call `/search` if not available.
- ✅ Results render nicely
- ✅ Added a small link on `search.html` that links to a form to sign up for API Waitlist. In this form, also explain the features.
- ✅ Added a dynamic `reference.html` and link to it via `search.html`

# ❗️ JSON Schema & OAS Validation

Still get errors like `JSONParserError: Token "OperationsWithTags" does not exist.` and `JSONParserError: Token "paths" does not exist`

Ensure the OAS and schema gets validated at every endpoint or function, even if it takes some resources... It's needed!

I now don't have any requirements and input validation on all my functions. It'd be great if things could be validated first before putting it into the function because it's wasting me a lot of time already if I can't locate the bug. Things are getting complex.

Ensure to fail the pipeline on invalidation at any step...

# Provider search and selection

- `/search/providers`: To allow for longer queries, can do a match of providerslug on each word that contains one, for now.
- For each provider result, call `/search/operations?q=%s&providerSlug={%p}` with same prompt and find top operations. For now just take first 10.
- Render the operations after they're loaded behind a button, in an expandable list
- Render select all and select each operation, so you can make a selection.
- For each operation, add 'try it now' button linking to `reference.html` in a new tab
- Link to https://auth.actionschema.com/client/create?selection={providerSlug}:{operationId,operationId,operationId}&selection={....} to create a new client or add it to an existing client.
- Link to https://openapi-util.actionschema.com/generateSdk?selection={providerSlug}:{operationId,operationId,operationId}&selection={....} to create a new SDK.
- Button to copy it as config setting for ActionSchema-migrate

# Semantic Search or LLM Search

🤔 Maybe intitially LLM search is better. Simply because it'd

- Can I make a Semantic Search over `providers.json` via local ActionSchema? How to make semantic search the fastest over edge/api?
- Build this as a part of the CRUD OpenAPI or separate if it gives more possibilities, but it needs sync.
- Add semantic search to both `/search/providers` and `/search/operations`

🎉 I think this already is super valuable and will serve as a foundation for strongly improved codegen, that I can use in my own work. Now, adding a couple of codegen templates will be perfect, and I'll be able to write good code... much, much, faster.

# Auth mapping

👨‍🍳 Now we're cooking.....

- If `authToken` is there, use it on search.actionschema.com and using that, also fetch your authenticated providers, and map that onto the search result
- Also add your own custom providers if you have them, such as agents and cruds, with the proper auth
- Sort it different, prioritising authed apps
- Show more details for authed apps.

# Recording Search

- ✅ Hold control to record
- Find Deepgram examples for streaming in HTML and/or Edge
- Make edge streaming endpoint `POST /transcribe` to stream recording to Deepgram and stream back the transcript directly.
- Fill transcript in the search bar while streaming. Depending on how long the recording took and how many words are there already, when done, immediately go to `search.html?q=` or wait for a couple hundred MS and then go.
- Implement `isQuerySearchableValidator(q)=>boolean`: last word part is a known word or name
- Ratelimit this endpoint per IP
