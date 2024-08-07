# Login

Login button at API should allow for easy access to a token. I probably need to create a client for ActionSchema.com that retrieves the access token of the services directly.

Ideally we'd show the access token directly to copy, to give the dev a way to directly build with it. If access was already there, then the token can immediately be shown at the page. If it's a non-oauth secret, we need to provide super easy instructions.

# Build button

✅ Added 'Build' button

This could simply stream the response back (code + spec + openapi) and get it deployed with the click of a button.

# API Finder GPT

✅ URLs for each operation are now served from API. All functional logic should.

The main thing we need to do for this is making it faster as it's currently too slow.

For that, semantic search over the providers will be a good help. Do this low-level.

# Provider Pages & SEO

✅ Made a simple page showing more info about the provider that might be useful to a developer.

From homepage, add links to `/apps/{provider}` for each icon.

Add sitemap, title, image placeholder, sameas links to socials.

Later I can make this more extensive with popular endpoints, examples, etc.
