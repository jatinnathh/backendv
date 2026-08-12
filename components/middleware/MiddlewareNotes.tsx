"use client";

import { useState } from "react";

type Props = {
    experiment: any;
};

const notes = [
    {
        title: "What is middleware?",
        content: `
Middleware is a function that runs during the HTTP request-response lifecycle.

A middleware function receives:

(req, res, next)

req:
Contains information about the incoming HTTP request.

res:
Used to construct and send the HTTP response.

next:
A function that tells Express to continue to the next middleware or handler.

Basic example:

app.use((req, res, next) => {

    console.log("Request received");

    next();

});

The important idea is that middleware sits between the incoming request and the final request handler.
        `,
    },

    {
        title: "The Express request pipeline",
        content: `
A simplified Express request lifecycle looks like this:

Client
   ↓
HTTP Request
   ↓
Application Middleware
   ↓
Router
   ↓
Route Middleware
   ↓
Controller
   ↓
Service
   ↓
Database
   ↓
Controller
   ↓
HTTP Response
   ↓
Client

Middleware can inspect or modify the request before the controller executes.
        `,
    },

    {
        title: "What does next() do?",
        content: `
next() transfers control to the next middleware function.

Example:

app.get(
    "/users",

    (req, res, next) => {

        console.log("Middleware 1");

        next();
    },

    (req, res, next) => {

        console.log("Middleware 2");

        next();
    },

    (req, res) => {

        res.json({
            message: "Controller"
        });

    }
);

The execution order is:

Middleware 1
      ↓
Middleware 2
      ↓
Controller
        `,
    },

    {
        title: "What happens if next() is not called?",
        content: `
If middleware neither calls next() nor sends a response, the request can remain pending.

Example:

app.use((req, res, next) => {

    console.log("Request stopped");

});

There is no next().

There is also no res.json(), res.send(), or res.end().

Therefore Express has no instruction to continue or finish the request.

The browser can wait indefinitely.

Middleware must normally do one of two things:

1. Continue the pipeline using next()

OR

2. End the request by sending a response.
        `,
    },

    {
        title: "Middleware execution order",
        content: `
Express executes middleware in registration order.

Example:

app.use(A);
app.use(B);
app.use(C);

The request flows:

A → B → C

Changing the order changes application behavior.

This is extremely important for:

authentication
logging
validation
CORS
body parsing
error handling

For example, authentication must run before a protected controller if the controller depends on req.user.
        `,
    },

    {
        title: "Request vs response modification",
        content: `
Middleware can modify the request:

req.user = decodedToken;

req.requestId = generatedId;

req.validatedBody = validatedData;

It can also modify the response:

res.setHeader(
    "X-Request-ID",
    requestId
);

This allows middleware to attach information that later parts of the application can use.
        `,
    },

    {
        title: "Authentication middleware",
        content: `
Authentication middleware answers:

"Who is making this request?"

A common flow is:

Authorization header
        ↓
Bearer token
        ↓
JWT verification
        ↓
Decoded payload
        ↓
req.user
        ↓
Controller

If authentication fails:

Request
   ↓
Auth middleware
   ↓
401 Unauthorized

The controller does not need to implement authentication itself.
        `,
    },

    {
        title: "Validation middleware",
        content: `
Validation middleware checks whether incoming data has the expected structure and values.

For example:

POST /users

{
    "name": "Jatin",
    "age": 21
}

Validation might check:

name exists
name is a string
age exists
age is a number
age is positive

If validation fails:

Request
   ↓
Validation middleware
   ↓
400 Bad Request

The controller does not execute.

This keeps invalid requests away from business logic.
        `,
    },

    {
        title: "Application-level middleware",
        content: `
Application middleware is attached to the Express application.

Example:

app.use(logger);

This middleware can execute for many or all routes.

Common examples:

logging
CORS
authentication
request IDs
body parsing

Application middleware usually belongs near the top-level Express configuration.
        `,
    },

    {
        title: "Router-level middleware",
        content: `
Router middleware applies to a particular router.

Example:

const router = express.Router();

router.use(logger);

router.get("/users", controller);

router.get("/orders", controller);

The logger runs for routes inside that router.

This is useful when different sections of an API require different middleware.
        `,
    },

    {
        title: "Route-level middleware",
        content: `
Middleware can also be attached to one specific route.

Example:

router.get(
    "/admin",

    authMiddleware,
    adminMiddleware,

    controller
);

Only this route receives those middleware functions.

This provides fine-grained control over request processing.
        `,
    },

    {
        title: "Error-handling middleware",
        content: `
Express error middleware has four arguments:

(err, req, res, next)

Example:

app.use((err, req, res, next) => {

    res.status(500).json({
        error: err.message
    });

});

The four arguments are important.

Express recognizes this function as error-handling middleware because of its signature.

A common pipeline is:

Controller
    ↓
Error
    ↓
next(error)
    ↓
Error middleware
    ↓
HTTP response
        `,
    },

    {
        title: "Middleware and security",
        content: `
Middleware is often the first security boundary in an application.

Examples:

Authentication
Authorization
Input validation
Rate limiting
CORS
Security headers

However, middleware does not automatically make an application secure.

Each middleware must be correctly implemented and configured.
        `,
    },

    {
        title: "Request IDs and observability",
        content: `
A request ID gives one request a unique identifier.

Example:

X-Request-ID:
8a7f...

The same ID can be included in:

request logs
database logs
service logs
error logs
tracing systems

This makes it possible to follow one request through a complex backend.
        `,
    },

    {
        title: "Middleware vs Controller",
        content: `
Middleware:

Usually handles cross-cutting concerns.

Examples:

authentication
logging
validation
timing
request IDs

Controller:

Usually handles the HTTP endpoint itself.

Example:

GET /users

The controller decides what response should be returned.

A useful mental model is:

Middleware:
"Should and how should this request continue?"

Controller:
"What should this endpoint do?"
        `,
    },

    {
        title: "Middleware vs Service",
        content: `
A service normally contains application/business logic.

A middleware normally participates in the HTTP pipeline.

Example:

Request
  ↓
Auth Middleware
  ↓
Controller
  ↓
User Service
  ↓
Prisma
  ↓
PostgreSQL

This separation prevents controllers and middleware from becoming huge blocks of code.
        `,
    },

    {
        title: "Why middleware order matters",
        content: `
Consider:

app.use(express.json());
app.use(authMiddleware);

The JSON body parser runs before authentication.

Now consider:

app.use(authMiddleware);
app.use(express.json());

Authentication middleware executes before JSON parsing.

The order can therefore affect what information is available to later middleware.

Always understand the pipeline rather than treating middleware as independent functions.
        `,
    },

    {
        title: "The complete mental model",
        content: `
When debugging an Express API, ask:

1. Did the request reach Express?
2. Which global middleware ran?
3. Which router matched?
4. Which route middleware ran?
5. Did middleware call next()?
6. Did middleware terminate the request?
7. Did the controller execute?
8. Did the service execute?
9. Did the database execute?
10. Did an error reach error middleware?
11. What response was finally sent?

This is exactly what the Middleware Lab is designed to help you visualize.
        `,
    },
];


export default function MiddlewareNotes({
    experiment,
}: Props) {

    const [open, setOpen] =
        useState<number | null>(0);


    return (
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">

            <div className="p-6 border-b border-zinc-800">

                <div className="text-xs uppercase tracking-wider text-zinc-600">
                    Study Material
                </div>

                <h2 className="text-2xl font-medium mt-2">
                    Middleware Notes
                </h2>

                <p className="text-zinc-500 mt-2 max-w-3xl">
                    Study the concept, run the experiment,
                    then compare the explanation with the
                    actual Express execution trace.
                </p>

            </div>


            {notes.map(
                (note, index) => (

                    <div
                        key={note.title}
                        className="border-b border-zinc-800 last:border-b-0"
                    >

                        <button
                            onClick={() =>
                                setOpen(
                                    open === index
                                        ? null
                                        : index
                                )
                            }
                            className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-900"
                        >

                            <span className="font-medium text-sm">
                                {note.title}
                            </span>

                            <span className="text-zinc-600">
                                {open === index
                                    ? "−"
                                    : "+"}
                            </span>

                        </button>


                        {open === index && (

                            <div className="px-5 pb-6">

                                <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-zinc-400">
                                    {note.content.trim()}
                                </pre>

                            </div>

                        )}

                    </div>

                )
            )}

        </div>
    );
}
