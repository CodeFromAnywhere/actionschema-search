improving the reliability:

# JSON Schema & OAS Validation

Still get errors like `JSONParserError: Token "OperationsWithTags" does not exist.` and `JSONParserError: Token "paths" does not exist`

Ensure the OAS and schema gets validated at every endpoint or function, even if it takes some resources... It's needed!

I now don't have any requirements and input validation on all my functions. It'd be great if things could be validated first before putting it into the function because it's wasting me a lot of time already if I can't locate the bug. Things are getting complex.

Ensure to fail the pipeline on invalidation at any step...

Afterwards, use SDK for openai chat completion as well as groq chat completion!

# JSONGPT

Error calling Groq API: Error: HTTP error! status: 500 with JSON: {"error":{"message":"Internal Server Error","type":"internal_server_error"}}

Groq gives this all the time... Let's parse it ourselves and ensure we can still continue...

# Long running LLM API calls

The problem here is that we're limited to a minute if we don't stream. I'd love to simply put this whole thing in an ActionSchema instead, because it's double work if I'd implement streaming now... >.<

# Resiliency

Hitting the ratelimit is quite common so we'd rather have it retry with wait ms incremental backoff ...
