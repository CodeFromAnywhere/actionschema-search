Improving the reliability:

# JSONGPT

Error calling Groq API: Error: HTTP error! status: 500 with JSON: {"error":{"message":"Internal Server Error","type":"internal_server_error"}}

Groq gives this all the time... Let's parse it ourselves and ensure we can still continue...

# Long running LLM API calls

The problem here is that we're limited to a minute if we don't stream. I'd love to simply put this whole thing in an ActionSchema instead, because it's double work if I'd implement streaming now... >.<

# Resiliency

Hitting the ratelimit is quite common so we'd rather have it retry with wait ms incremental backoff ... Or just find an api with a bigger ratelimit, for now.
