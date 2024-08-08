# Login Button

Login button at API should allow for easy access to a token. I probably need to create a client for ActionSchema.com that retrieves the access token of the services directly.

Ideally we'd show the access token directly to copy, to give the dev a way to directly build with it. If access was already there, then the token can immediately be shown at the page. If it's a non-oauth secret, we need to provide super easy instructions.

# Build button

✅ URLs for each operation are now served from API. All functional logic should.

✅ Added 'Build' button with URL too

This could show a chat that, after sending, streams the response back (code + spec + openapi) and get it deployed with the click of a button.

# Provider Pages & SEO

✅ Made a simple page showing more info about the provider that might be useful to a developer.

Add image placeholder and 'sameas' links to socials.

🚫 **Need ActionSchema**: Make provider page more extensive with popular endpoints, examples, etc.

From homepage, add links to `/apps/{provider}` for each icon.

Add sitemap

# Resiliency

Hitting the ratelimit is quite common so we'd rather have it retry with wait ms incremental backoff ... Or just find an API with a bigger ratelimit, for now.

We need to be able to handle users better and point them to the waitlist if it's too much.

🚫 **Need ActionSchema**: The problem here is that we're limited to a minute if we don't stream. I'd love to simply put this whole thing in an ActionSchema instead, because it's double work if I'd implement streaming now... >.<
