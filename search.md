# Login

Login button at API should allow for easy access to a token. I probably need to create a client for ActionSchema.com that retrieves the access token of the services directly.

Ideally we'd show the access token directly to copy, to give the dev a way to directly build with it. If access was already there, then the token can immediately be shown at the page. If it's a non-oauth secret, we need to provide super easy instructions.

# Build button

Build button should go to https://eval.actionschema.com/new.html?context={prunedOpenapiUrl}&q=Please+build+me+a+Vercel+serverless+endpoint+that+uses+this&send=false.

This could simply stream the response back (code + spec + openapi) and get it deployed with the click of a button.

# Search GPT

- Add the links into the API
