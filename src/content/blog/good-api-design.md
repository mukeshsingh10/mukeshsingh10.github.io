---
title: "Good API Design Is Mostly About Making the Right Trade-offs"
description: "A practical guide to designing APIs that are easy to use, safe to change, and able to survive real-world usage."
pubDate: "2026-09-14"
category: "backend"
categoryLabel: "Backend & Systems"
project: "Architecture"
eyebrow: "Architecture / API Design"
readTime: "8 min read"
order: 1
tags:
  - "API Design"
  - "Backend"
  - "Software Engineering"
  - "Go"
---

# Good API Design Is Mostly About Making the Right Trade-offs

When I first started learning backend development, API design seemed fairly simple.

You create an endpoint, choose a URL, define a request and response, and return some JSON.

For example:

```http
GET /users/42
```

might return:

```json
{
  "id": 42,
  "name": "Mukesh",
  "email": "mukesh@example.com"
}
```

It works.

But designing an API that continues to work after thousands of developers and applications start depending on it is a very different problem.

An API is not just a collection of endpoints.

It is a **contract between software**.

Once someone builds their application around that contract, changing it becomes expensive.

That leads to a simple principle:

> A good API should make the common things easy, the dangerous things difficult, and future changes possible.

This article is my practical understanding of what that means.

---

## 1. An API should feel predictable

When developers use an API, they should not have to learn an entirely new way of thinking.

Consider:

```http
GET /users/42
GET /posts/123
GET /comments/456
```

Most developers can understand these immediately.

Now imagine an API where every resource uses completely different conventions:

```http
GET /fetchUserByIdentifier?id=42
POST /retrievePost
GET /commentLookup?comment_identifier=456
```

Technically, all of these can work.

But the second API makes the developer think more.

That matters.

Every unusual decision in an API creates another thing users have to remember.

This is why familiar conventions are valuable.

For example:

* `GET` retrieves data
* `POST` usually creates or triggers an operation
* `PUT` commonly replaces a resource
* `PATCH` partially updates a resource
* `DELETE` removes a resource

You do not have to follow conventions blindly.

But you should have a good reason when you don't.

### Boring is often good

An API does not need to be clever.

If a developer can guess how your API works before reading the documentation, you are doing something right.

Good API design is often invisible.

The developer gets the job done and moves on.

---

## 2. An API is a contract

Suppose you expose this response:

```json
{
  "id": 10,
  "name": "Alice"
}
```

A client might write:

```go
type User struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}
```

Now imagine that you decide to rename:

```json
"name"
```

to:

```json
"display_name"
```

Your server might still work perfectly.

But the client doesn't.

The client was written against your previous contract.

This is one of the most important things to understand about APIs:

**Your users depend on behavior that you might consider an implementation detail.**

Once an API is public, its behavior becomes part of the product.

---

## 3. Avoid breaking existing clients

Suppose version 1 returns:

```json
{
  "id": 10,
  "name": "Alice"
}
```

Adding a new field is usually much safer:

```json
{
  "id": 10,
  "name": "Alice",
  "avatar": "https://example.com/alice.png"
}
```

Existing clients can continue using `id` and `name`.

But changing:

```json
"id": 10
```

into:

```json
"user_id": 10
```

is a breaking change.

The same applies to changing types.

This:

```json
{
  "id": 10
}
```

becoming:

```json
{
  "id": "10"
}
```

can break consumers.

So before changing an API, ask:

> Could an existing client behave differently because of this change?

If the answer is yes, treat the change very carefully.

---

## 4. Your database schema is not your API

One mistake I see when learning backend systems is thinking that the API should directly expose the database.

Imagine your database has:

```text
users
-----
id
first_name
last_name
password_hash
created_at
internal_status
```

It does not mean your API should return all of those fields.

You might expose:

```json
{
  "id": 42,
  "name": "Alice Smith"
}
```

The API represents what the consumer needs.

The database represents how your application stores information.

Those are different concerns.

This separation becomes extremely valuable later.

You may completely change your database while keeping the API stable.

For example:

```text
Old:

PostgreSQL
    ↓
REST API

Later:

PostgreSQL + Redis + another service
    ↓
REST API
```

The consumer doesn't need to know.

That's a healthy abstraction.

---

## 5. Don't expose internal complexity unnecessarily

Imagine your application internally needs five steps to create an order:

```text
Validate user
    ↓
Reserve inventory
    ↓
Calculate price
    ↓
Create payment
    ↓
Create order
```

The client should not necessarily have to perform those five steps itself.

A useful API might simply provide:

```http
POST /orders
```

with:

```json
{
  "product_id": 123,
  "quantity": 2
}
```

The server handles the internal workflow.

This is one of the main purposes of an API.

The API should hide implementation details that consumers don't need to understand.

---

## 6. Design around user operations

A useful question when designing an endpoint is:

> What does the user actually want to accomplish?

Suppose your system manages repositories.

Internally you might have:

```text
Repository
RepositoryMetadata
RepositoryStorage
RepositoryIndex
RepositoryPermissions
RepositoryCache
```

You don't necessarily need endpoints for every internal component.

The consumer may simply want:

```http
GET /repositories/123
```

or:

```http
POST /repositories/123/build
```

The API should represent useful operations and resources rather than mirror your internal class hierarchy.

This becomes especially important as systems grow.

---

## 7. Make retries safe

Distributed systems fail in strange ways.

Consider:

```http
POST /payments
```

The server receives the request.

It successfully charges the customer's card.

Then the network connection fails before the client receives the response.

From the client's perspective:

```text
Request
   ↓
???
```

Did the payment happen?

The client doesn't know.

If it sends the request again, the customer might be charged twice.

This is where **idempotency** becomes important.

An idempotent operation can safely be repeated without producing the same side effect multiple times.

One common approach is an idempotency key:

```http
POST /payments
Idempotency-Key: 8f7a2c...
```

The client generates a unique key for that logical operation.

The server remembers it.

If the same request arrives again:

```text
First request
    ↓
Process payment
    ↓
Store result

Retry
    ↓
Same idempotency key
    ↓
Return previous result
```

The operation is not performed twice.

This is especially important for:

* payments
* order creation
* resource provisioning
* job submission
* external side effects

The key idea is:

> A network failure does not necessarily mean the operation failed.

Good APIs account for that.

---

## 8. Don't make every operation complicated

There is another side to idempotency.

You should not add complexity just because it sounds like good engineering.

For a simple read:

```http
GET /users/42
```

there is usually no need for an idempotency key.

Reading a user twice does not create two users.

Likewise, an operation such as:

```http
DELETE /users/42
```

is naturally safe to repeat in many systems because after the first successful deletion, the resource is already gone.

The right question is not:

> "Can I add another safety mechanism?"

It is:

> "What failure mode am I protecting against?"

---

## 9. Rate limits are part of API design

A UI naturally limits how quickly a human can interact with your system.

Code doesn't.

A script can do:

```text
request
request
request
request
request
...
```

thousands of times per second.

Imagine an endpoint:

```http
POST /reports/generate
```

that takes 30 seconds of CPU time.

Without protection, one client could overwhelm the entire system.

Rate limiting gives you a control mechanism.

For example:

```text
GET requests:
1000 / minute

Report generation:
20 / minute

Large exports:
5 / hour
```

Different operations may need different limits.

An expensive endpoint should generally have a stricter limit than a cheap read.

---

## 10. Tell clients when they are being limited

Rate limiting is much more useful when the client knows what is happening.

For example:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30
```

The client can then wait before trying again.

A response might also contain information such as:

```text
Rate limit: 100
Remaining: 0
Reset: 30 seconds
```

This is much better than forcing clients to guess.

A well-designed API should help its consumers behave correctly.

---

## 11. Pagination is not optional for large collections

Imagine:

```http
GET /users
```

Your application has 50 users.

Returning all 50 is easy.

But what happens when you have:

```text
10,000 users
1,000,000 users
100,000,000 users
```

Returning everything in one response becomes impractical.

Instead, paginate.

A simple API might use:

```http
GET /users?page=1&limit=50
```

This is easy to understand.

But offset pagination can become inefficient for very large datasets.

For example:

```http
GET /users?offset=1000000&limit=50
```

The database may have to skip a huge number of records before returning the requested rows.

---

## 12. Cursor pagination

For large or frequently changing datasets, cursor-based pagination can be a better option.

Instead of:

```http
GET /users?offset=100
```

you might have:

```http
GET /users?cursor=eyJpZCI6MTAwfQ==
```

The server uses the cursor to determine where the next page begins.

A response could look like:

```json
{
  "data": [
    {
      "id": 101,
      "name": "Alice"
    },
    {
      "id": 102,
      "name": "Bob"
    }
  ],
  "next_cursor": "eyJpZCI6MTAyfQ=="
}
```

The client doesn't need to understand how the cursor works.

It simply sends it back.

```text
Request page 1
    ↓
Response + cursor
    ↓
Request page 2 with cursor
    ↓
Response + next cursor
```

This approach can work much better for large datasets.

The important lesson is:

> Think about the size of the data your API might eventually serve, not only the size you have today.

---

## 13. Don't return expensive data by default

Suppose:

```http
GET /users/42
```

returns basic user information.

But calculating one field requires:

```text
API call
    ↓
Another service
    ↓
Database query
    ↓
Aggregation
```

Returning that field every time makes the basic endpoint unnecessarily expensive.

Instead, you might allow:

```http
GET /users/42?include=subscription
```

Now the default request stays cheap:

```json
{
  "id": 42,
  "name": "Alice"
}
```

while consumers that need additional information can explicitly request it.

This is useful for:

* related resources
* analytics
* large metadata
* expensive calculations
* external service lookups

A good default response should not perform expensive work that most consumers don't need.

---

## 14. REST vs GraphQL is not the main question

API discussions often turn into:

```text
REST vs GraphQL
```

But I think the more useful question is:

> What does the client actually need?

REST can be very simple:

```http
GET /users/42
GET /users/42/posts
```

GraphQL can give clients more control over the shape of the response.

Both can work.

Neither automatically produces a good API.

You can build a terrible REST API.

You can also build a terrible GraphQL API.

The protocol is only one part of the design.

The more important questions are:

* Is the API predictable?
* Is it safe to evolve?
* Does it expose the right abstractions?
* Can clients handle failures?
* Does it scale?
* Is it easy to understand?

---

## 15. Authentication should not make simple things difficult

Authentication is another area where API designers can accidentally create unnecessary friction.

For a developer who wants to test an API, something like:

```http
Authorization: Bearer <token>
```

can be straightforward.

But some integrations need more complicated authentication flows.

For example, OAuth is extremely useful when an application needs delegated access to another user's resources.

But not every API interaction needs that complexity.

The authentication mechanism should match the problem.

For example:

```text
Personal script
    → API key may be enough

Third-party application accessing user data
    → OAuth may make more sense

Internal service
    → service identity / workload credentials
```

Security matters.

But so does usability.

---

## 16. Public and internal APIs are different

A public API may have thousands of unknown consumers.

An internal API might have:

```text
Service A
    ↓
Service B
```

inside the same organization.

The constraints are different.

With an internal API, you may be able to:

* coordinate changes across teams
* deploy all consumers together
* make breaking changes more easily
* use internal authentication systems
* inspect all consumers

With a public API, you don't have that control.

Someone might still be running an old version of your client five years from now.

That changes how conservative you need to be.

---

## 17. Versioning should solve a real problem

Sometimes breaking changes are unavoidable.

Suppose your original API is:

```http
GET /v1/users/42
```

and you eventually need a fundamentally different contract.

You might introduce:

```http
GET /v2/users/42
```

Now both versions can exist.

That protects existing clients.

But versioning is not free.

You now have:

```text
v1
v2
```

to maintain.

You need:

* tests
* documentation
* bug fixes
* monitoring
* migration guidance

And eventually someone has to decide when `v1` can be removed.

So I would not version an API simply because:

> "That's what mature APIs do."

Instead ask:

> "Can I make this change without breaking existing clients?"

If yes, prefer the compatible change.

---

## 18. Documentation is part of the API

A technically excellent API can still be painful to use if its documentation is poor.

At minimum, developers should be able to answer:

```text
What endpoint do I call?

What authentication do I need?

What parameters are required?

What does the response look like?

What errors can happen?

Can I safely retry this?

Are there rate limits?

How does pagination work?
```

A simple example is often more useful than a page of theoretical explanation.

For example:

```bash
curl https://api.example.com/users/42 \
  -H "Authorization: Bearer $TOKEN"
```

followed by:

```json
{
  "id": 42,
  "name": "Alice"
}
```

can immediately show a developer how the API works.

---

## 19. Errors are part of the contract too

An API should not only define successful responses.

It should define failure behavior.

For example:

```http
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
429 Too Many Requests
500 Internal Server Error
```

A useful error response might be:

```json
{
  "error": {
    "code": "email_already_exists",
    "message": "An account with this email already exists."
  }
}
```

The exact format is less important than consistency.

If one endpoint returns:

```json
{
  "error": "not found"
}
```

and another returns:

```json
{
  "message": "User does not exist",
  "status": 404
}
```

consumers now have to write special handling for every endpoint.

Consistency reduces client complexity.

---

## 20. Design for failure, not only success

A common mistake when designing an API is to imagine only the happy path:

```text
Request
   ↓
Success
   ↓
200 OK
```

Real systems look more like:

```text
Request
   ↓
Validation?
   ↓
Authentication?
   ↓
Authorization?
   ↓
Database available?
   ↓
Dependency available?
   ↓
Timeout?
   ↓
Client disconnected?
   ↓
Retry?
   ↓
Partial failure?
```

API design needs to account for these situations.

Ask:

* What happens if the request times out?
* Can the client safely retry?
* What if the downstream service is unavailable?
* What if the client sends the same request twice?
* What if the operation succeeds but the response is lost?
* What happens when the client exceeds its rate limit?

These questions often matter more than the exact URL structure.

---

## 21. Don't optimize for today's implementation

Suppose your database currently uses integer IDs:

```json
{
  "id": 123
}
```

Maybe that's fine.

But exposing database-specific details everywhere can make future changes harder.

For example, if you later move to UUIDs:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

every consumer may have to change assumptions.

The lesson isn't:

> "Always use UUIDs."

The lesson is:

> Be deliberate about what your API promises.

Every field you expose becomes something you may have to support for a long time.

---

## 22. The best API design is often boring

After thinking about API design for a while, I think the goal is not to create the most sophisticated API.

The goal is to create one that disappears.

A developer should be able to think:

```text
I need a user.
    ↓
GET /users/42
```

Then:

```text
I need to create one.
    ↓
POST /users
```

Then:

```text
I need the next page.
    ↓
Use the cursor from the previous response.
```

No surprises.

No unnecessary abstractions.

No strange conventions.

No accidental coupling to the implementation.

That is a good API.

---

# A practical API design checklist

Before shipping an API, I would ask:

### Usability

* Is the API familiar?
* Can a developer understand the basic usage quickly?
* Are naming conventions consistent?
* Are common operations easy?

### Compatibility

* Will this change break existing clients?
* Can I make the change additive instead?
* Do I really need a new API version?

### Reliability

* What happens when a request times out?
* Can clients safely retry?
* Do important write operations support idempotency?
* Are downstream failures handled?

### Performance

* Can responses become very large?
* Does this endpoint need pagination?
* Should pagination use cursors?
* Are expensive fields optional?

### Safety

* Are expensive operations rate-limited?
* Can one customer overwhelm the system?
* Can the API be temporarily disabled or restricted if necessary?

### Errors

* Are errors consistent?
* Are HTTP status codes meaningful?
* Can clients programmatically identify the failure?

### Evolution

* Is the API coupled to the database schema?
* Is internal implementation exposed?
* Can the backend change without forcing clients to change?

---

# Final thought

The hardest part of API design isn't deciding whether to use REST, GraphQL, JSON, or some particular naming convention.

Those choices matter, but they are not the foundation.

The deeper problem is that **an API creates a long-term relationship between your software and someone else's software**.

Your implementation can change.

Your database can change.

Your infrastructure can change.

Your team can change.

But once clients depend on your API, the contract becomes difficult to change.

So when designing an API, I try to think beyond:

> "How do I make this endpoint work?"

and instead ask:

> "What am I asking other developers to depend on?"

That question changes how you design APIs.

And, in my opinion, that is where good API design starts.
