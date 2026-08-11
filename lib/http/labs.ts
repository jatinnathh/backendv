// lib/http/labs.ts
import { HttpMethod } from "./api";

export interface LearnContent {
    title: string;
    description: string;
    explanation: string;
    commonMistakes?: string[];
}

export interface ExperimentConfig {
    defaultMethod: HttpMethod;
    endpoint: string;
    allowedMethods: HttpMethod[];
    defaultHeaders?: Record<string, string>;
    defaultQuery?: Record<string, string>;
    defaultBody?: string;
    tryItSteps: string[];
}

export interface NoteSection {
    title: string;
    content: string;
}

export interface NotesContent {
    summary: string;
    sections: NoteSection[];
    interviewQuestions: string[];
}

export interface HttpLabConfig {
    id: string;
    categoryId: string;
    name: string;
    
    learn: LearnContent;
    experiment: ExperimentConfig;
    notes: NotesContent;
}

export interface CurriculumCategory {
    id: string;
    title: string;
    labs: string[];
}

export const CURRICULUM_CATEGORIES: CurriculumCategory[] = [
    {
        id: "fundamentals",
        title: "FOUNDATIONS",
        labs: ["request-anatomy", "http-lifecycle", "methods", "routing", "query-params"]
    },
    {
        id: "request-data",
        title: "REQUEST DATA",
        labs: ["headers", "body", "content-type", "cookies"]
    },
    {
        id: "responses",
        title: "RESPONSES",
        labs: ["status-codes", "redirects"]
    },
    {
        id: "performance",
        title: "PERFORMANCE",
        labs: ["delay-latency", "caching-etags"]
    },
    {
        id: "security",
        title: "SECURITY",
        labs: ["cors"]
    }
];

export const HTTP_LABS: HttpLabConfig[] = [
    {
        id: "request-anatomy",
        categoryId: "fundamentals",
        name: "Request Anatomy",
        learn: {
            title: "The Structure of a Request",
            description: "How HTTP requests are built from methods, paths, and metadata.",
            explanation: `
An HTTP Request is composed of several key parts:
- **Method**: The action to perform (GET, POST).
- **URL / Path**: The resource being acted upon.
- **Headers**: Metadata about the client and request.
- **Body**: Optional data sent to the server.
            `.trim(),
            commonMistakes: [
                "Thinking the URL is just a string. It's actually a structured locator."
            ]
        },
        experiment: {
            defaultMethod: "POST",
            endpoint: "/api/http/echo",
            allowedMethods: ["GET", "POST", "PUT", "DELETE"],
            defaultQuery: { "user": "42" },
            defaultHeaders: { 
                "Authorization": "Bearer xyz",
                "User-Agent": "HTTP-Lab/1.0"
            },
            defaultBody: '{\n  "message": "Hello Server!"\n}',
            tryItSteps: [
                "Send the request and observe the Raw Request in the Inspect tab.",
                "See how the Express /echo endpoint extracts and returns these exact parts."
            ]
        },
        notes: {
            summary: "Requests are structured text messages.",
            sections: [
                { title: "Parts", content: "Method + Path + Version\nHeaders\n\nBody" }
            ],
            interviewQuestions: [
                "What are the main components of an HTTP Request?"
            ]
        }
    },
    {
        id: "http-lifecycle",
        categoryId: "fundamentals",
        name: "HTTP Lifecycle",
        learn: {
            title: "What is HTTP?",
            description: "The medium through which the browser talks to our servers to send and receive data.",
            explanation: `
### Stateless and Client-Server Model

**Statelessness:** HTTP has no memory of past interactions. Every request is self-contained. Because it's stateless, we use Auth tokens or session tokens to remember who a user is. 
This provides simplicity, no session info stored on the server (less RAM used), and infinite scalability.

**Client-Server Model:** The client asks for resources, the server provides it. HTTP is always initiated by the client.
            `.trim(),
            commonMistakes: [
                "Thinking the server can initiate an HTTP request to the client (use WebSockets for that).",
                "Assuming HTTP remembers you between requests."
            ]
        },
        experiment: {
            defaultMethod: "GET",
            endpoint: "/api/http/echo",
            allowedMethods: ["GET"],
            tryItSteps: [
                "Send the request and observe the stateless response."
            ]
        },
        notes: {
            summary: "HTTP is the stateless, client-server protocol powering the web.",
            sections: [
                { title: "Statelessness", content: "No memory of past requests. Needs tokens to maintain state." },
                { title: "TCP Backing", content: "Uses TCP for reliable packet delivery." }
            ],
            interviewQuestions: [
                "Why is HTTP considered a stateless protocol?",
                "How do we maintain user sessions in a stateless protocol?"
            ]
        }
    },
    {
        id: "methods",
        categoryId: "fundamentals",
        name: "HTTP Methods",
        learn: {
            title: "Intent of Interaction",
            description: "Methods define the semantic meaning of an interaction.",
            explanation: `
- **GET:** To fetch data from server. Should not modify anything on the server.
- **POST:** Create some data in the server. Contains a body.
- **PATCH:** Update some data in the server.
- **PUT:** Complete replacement of a resource.
- **DELETE:** To delete a resource from the server.
- **OPTIONS:** Used to fetch the capabilities of a server (used heavily for CORS).

### Idempotent vs Non-Idempotent
**Idempotent:** Repeating the operation does not change the outcome further (GET, PUT, DELETE).
**Non-Idempotent:** Changes the result every time it runs, e.g. count++ (POST).
            `.trim()
        },
        experiment: {
            defaultMethod: "POST",
            endpoint: "/api/http/users",
            allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            defaultBody: '{\n  "name": "Jatin",\n  "email": "jatin@example.com"\n}',
            tryItSteps: [
                "Send a POST request to create a user in the Postgres DB.",
                "Check the TraceTimeline to see the real Prisma query executed.",
                "Try sending a GET request to /api/http/users to fetch the users."
            ]
        },
        notes: {
            summary: "Methods define the verb of the action.",
            sections: [
                { title: "Idempotency", content: "Idempotent: GET, PUT, DELETE\nNon-Idempotent: POST" }
            ],
            interviewQuestions: [
                "What is the difference between PUT and PATCH?",
                "Why is POST non-idempotent?"
            ]
        }
    },
    {
        id: "routing",
        categoryId: "fundamentals",
        name: "Backend Routing",
        learn: {
            title: "How backends handle URLs",
            description: "Routing tells the server's intention and where to send your data.",
            explanation: `
A route is a combination of **HTTP method + URL path**. \`GET /users\` and \`POST /users\` are different routes.

### 1. Static Routes
Fixed paths (\`GET /users\`).

### 2. Route Parameters (Dynamic Segments)
Parts of the URL that act as variables, marked with \`:\` (\`GET /users/:id\`).
Used when you need to identify a specific resource.
            `.trim()
        },
        experiment: {
            defaultMethod: "GET",
            endpoint: "/api/http/params/123",
            allowedMethods: ["GET", "POST"],
            tryItSteps: [
                "Send a request to a dynamic segment path like /params/123.",
                "See how Express extracts the ID parameter in the Trace Timeline."
            ]
        },
        notes: {
            summary: "Routes map URLs and Methods to code handlers.",
            sections: [
                { title: "Mental Model", content: "/resources (collection)\n/resources/:id (single)" }
            ],
            interviewQuestions: [
                "When should you use a Query Parameter vs a Route Parameter?"
            ]
        }
    },
    {
        id: "query-params",
        categoryId: "fundamentals",
        name: "Query Parameters",
        learn: {
            title: "Query Parameters",
            description: "Key-value pairs appended after `?`.",
            explanation: `
Used for filtering, searching, sorting, pagination.
**Param vs Query:** 
\`/users/123\` → Identity
\`/users?name=jatin\` → Discovery/Filtering
            `.trim()
        },
        experiment: {
            defaultMethod: "GET",
            endpoint: "/api/http/query",
            allowedMethods: ["GET"],
            defaultQuery: { "search": "javascript", "page": "1", "limit": "10" },
            tryItSteps: [
                "Send the request and observe the query parameter parsing in the backend.",
                "Try changing the values in the Experiment tab."
            ]
        },
        notes: {
            summary: "Query params modify a request without changing the fundamental route.",
            sections: [
                { title: "Common uses", content: "Pagination, searching, sorting." }
            ],
            interviewQuestions: [
                "How do query parameters differ from request body?"
            ]
        }
    },
    {
        id: "headers",
        categoryId: "request-data",
        name: "Headers",
        learn: {
            title: "HTTP Headers",
            description: "Metadata attached to an HTTP request or response.",
            explanation: `
Headers tell the client and server how to communicate information about the request or response.

### Request Headers
Sent by client to server to provide info about the request or client environment:
- **User-Agent:** Tells us what the type of user is (Postman, browser, mobile)
- **Authorization:** Sends credentials
- **Accept:** Content type expected by the client
            `.trim(),
            commonMistakes: [
                "Headers ≠ Query Parameters"
            ]
        },
        experiment: {
            defaultMethod: "GET",
            endpoint: "/api/http/headers",
            allowedMethods: ["GET", "POST"],
            defaultHeaders: { 
                "Authorization": "Bearer token123",
                "X-Lab-Header": "custom-value"
            },
            tryItSteps: [
                "Change the X-Lab-Header.",
                "Send the request and see how Express extracts headers."
            ]
        },
        notes: {
            summary: "Headers provide extensible metadata.",
            sections: [
                {
                    title: "Authorization",
                    content: "Commonly used for JWTs."
                }
            ],
            interviewQuestions: [
                "How can custom headers be used?"
            ]
        }
    },
    {
        id: "body",
        categoryId: "request-data",
        name: "Request Body",
        learn: {
            title: "Sending Data",
            description: "The body carries the main payload of the request.",
            explanation: `
Unlike headers or URLs, the body can carry large amounts of data in various formats (JSON, XML, Form Data).
The server uses the \`Content-Type\` header to know how to parse this body.
            `.trim()
        },
        experiment: {
            defaultMethod: "POST",
            endpoint: "/api/http/body",
            allowedMethods: ["POST", "PUT", "PATCH"],
            defaultHeaders: { "Content-Type": "application/json" },
            defaultBody: '{\n  "score": 100\n}',
            tryItSteps: [
                "Observe how the backend parses the JSON payload.",
                "Change the Content-Type to text/plain and see the difference in the trace."
            ]
        },
        notes: {
            summary: "The body is the main data payload.",
            sections: [
                { title: "Parsers", content: "Express uses express.json() or express.text() to read the body stream." }
            ],
            interviewQuestions: [
                "Can a GET request have a body?"
            ]
        }
    },
    {
        id: "content-type",
        categoryId: "request-data",
        name: "Content Negotiation",
        learn: {
            title: "Content Types and Accept",
            description: "How client and server agree on data formats.",
            explanation: `
- **Content-Type**: Tells the receiver what format the body is in.
- **Accept**: Tells the server what formats the client is willing to receive.

This process of agreeing on a format is called Content Negotiation.
            `.trim()
        },
        experiment: {
            defaultMethod: "GET",
            endpoint: "/api/http/content-type",
            allowedMethods: ["GET"],
            defaultHeaders: { "Accept": "text/plain" },
            tryItSteps: [
                "Send with Accept: text/plain and see the server return raw text.",
                "Change to Accept: application/json and see the server return JSON."
            ]
        },
        notes: {
            summary: "Content negotiation ensures compatibility.",
            sections: [
                { title: "Headers", content: "Content-Type (what I'm sending), Accept (what I want)" }
            ],
            interviewQuestions: [
                "What is Content Negotiation?"
            ]
        }
    },
    {
        id: "cookies",
        categoryId: "request-data",
        name: "Cookies",
        learn: {
            title: "Stateful Memory",
            description: "Small pieces of data stored in the browser.",
            explanation: `
Since HTTP is stateless, Cookies allow servers to remember clients.
When a server sends a \`Set-Cookie\` header, the browser stores it and automatically attaches it to subsequent requests to that domain.
            `.trim()
        },
        experiment: {
            defaultMethod: "GET",
            endpoint: "/api/http/cookies",
            allowedMethods: ["GET"],
            defaultQuery: { "action": "set" },
            tryItSteps: [
                "Send with action=set to instruct the server to Set-Cookie.",
                "Remove action=set and observe the browser automatically sending the cookie back.",
                "Use action=clear to delete it."
            ]
        },
        notes: {
            summary: "Cookies add state to HTTP.",
            sections: [
                { title: "HttpOnly", content: "Prevents JS from reading the cookie (XSS protection)." }
            ],
            interviewQuestions: [
                "What is the difference between LocalStorage and Cookies?"
            ]
        }
    },
    {
        id: "status-codes",
        categoryId: "responses",
        name: "Status Codes",
        learn: {
            title: "HTTP Status Codes",
            description: "3-digit numbers communicating the result of a request.",
            explanation: `
### 2xx — Success
**200 OK** — Standard success.
**201 Created** — Resource was created (POST/PUT).
**204 No Content** — Success, but nothing to return (DELETE).

### 4xx — Client Errors (Your fault)
**400 Bad Request** — Malformed syntax.
**401 Unauthorized** — Authentication is required.
**403 Forbidden** — Authenticated, but not authorized to perform action.
**404 Not Found**
            `.trim(),
            commonMistakes: [
                "Confusing 401 and 403. 401 = 'I don't know who you are'. 403 = 'I know who you are, but you can't do this'."
            ]
        },
        experiment: {
            defaultMethod: "GET",
            endpoint: "/api/http/status/403",
            allowedMethods: ["GET"],
            tryItSteps: [
                "Send the request to receive a 403 Forbidden response.",
                "Change the URL path to /status/201 or /status/500."
            ]
        },
        notes: {
            summary: "Status codes tell the client exactly what happened without reading the body.",
            sections: [
                { title: "401 vs 403", content: "401 -> Authentication problem\n403 -> Authorization problem" }
            ],
            interviewQuestions: [
                "What is the difference between 401 and 403?",
                "When should POST return 201 vs 200?"
            ]
        }
    },
    {
        id: "redirects",
        categoryId: "responses",
        name: "Redirects",
        learn: {
            title: "Moving Traffic",
            description: "Telling the client to go somewhere else.",
            explanation: `
- **301 Moved Permanently**: Browsers cache this heavily.
- **302 Found**: Temporary redirect.

The server responds with a 3xx status and a \`Location\` header indicating where the client should go next.
            `.trim()
        },
        experiment: {
            defaultMethod: "GET",
            endpoint: "/api/http/redirect",
            allowedMethods: ["GET"],
            tryItSteps: [
                "Send the request and inspect the Raw Response.",
                "Notice the 302 Status and the Location header."
            ]
        },
        notes: {
            summary: "Redirects guide the client to a new URL.",
            sections: [
                { title: "Location Header", content: "The absolute or relative URL the client should request next." }
            ],
            interviewQuestions: [
                "What is the difference between 301 and 302?"
            ]
        }
    },
    {
        id: "delay-latency",
        categoryId: "performance",
        name: "Delay & Latency",
        learn: {
            title: "Network Time",
            description: "Understanding response times.",
            explanation: `
Every request takes time to travel over the network and process on the server.
By artificially injecting delay on the server, we can simulate high-latency environments.
            `.trim()
        },
        experiment: {
            defaultMethod: "GET",
            endpoint: "/api/http/delay",
            allowedMethods: ["GET"],
            defaultQuery: { "ms": "2000" },
            tryItSteps: [
                "Send the request and watch the UI wait for ~2 seconds.",
                "Check the timeline to see the delay_started and delay_ended trace events."
            ]
        },
        notes: {
            summary: "Latency impacts user experience.",
            sections: [
                { title: "Measuring", content: "Browsers measure Time to First Byte (TTFB) and total duration." }
            ],
            interviewQuestions: [
                "How does latency differ from bandwidth?"
            ]
        }
    },
    {
        id: "caching-etags",
        categoryId: "performance",
        name: "Caching & ETags",
        learn: {
            title: "Avoiding Redundant Work",
            description: "Decreasing server load and payload size.",
            explanation: `
### HTTP Caching
Storing copies of responses for reuse to decrease server load.

### ETags (Entity Tags)
An ETag is a hash or version identifier for a resource.
1. Server sends \`ETag: "abc123"\`.
2. Next time, client sends \`If-None-Match: "abc123"\`.
3. If the resource hasn't changed, server returns \`304 Not Modified\` (empty body).
            `.trim()
        },
        experiment: {
            defaultMethod: "GET",
            endpoint: "/api/http/cache",
            allowedMethods: ["GET"],
            tryItSteps: [
                "Send the first request. The server will return a 200 OK and an ETag header.",
                "Add an If-None-Match header matching that ETag and send again.",
                "Observe the 304 Not Modified response."
            ]
        },
        notes: {
            summary: "Caching makes HTTP significantly faster.",
            sections: [
                { title: "304 Not Modified", content: "Tells the client to use its cached version, saving bandwidth." }
            ],
            interviewQuestions: [
                "How do ETags work?"
            ]
        }
    },
    {
        id: "cors",
        categoryId: "security",
        name: "CORS & Preflight",
        learn: {
            title: "Cross-Origin Resource Sharing",
            description: "The browser security system that controls origin access.",
            explanation: `
CORS checks if a frontend from one origin (e.g. localhost:3000) can access resources from another (localhost:8000).

### Preflight Request
Happens when the browser thinks the actual request may modify server state. The browser sends an \`OPTIONS\` request first.
Server responds with allowed methods and headers. Then browser sends the REAL request.
            `.trim(),
            commonMistakes: [
                "Thinking CORS protects the server. It actually protects the CLIENT (browser) from reading unauthorized data."
            ]
        },
        experiment: {
            defaultMethod: "OPTIONS",
            endpoint: "/api/http/cors",
            allowedMethods: ["GET", "OPTIONS", "POST"],
            defaultHeaders: {
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST"
            },
            tryItSteps: [
                "Send an OPTIONS request simulating a browser preflight.",
                "Look at the CORS headers returned by Express (Access-Control-Allow-Origin, etc)."
            ]
        },
        notes: {
            summary: "CORS prevents malicious sites from reading data on behalf of a user.",
            sections: [
                { title: "Preflight Options", content: "Browser sends OPTIONS request to check permissions before a state-modifying request." }
            ],
            interviewQuestions: [
                "What triggers a CORS preflight request?"
            ]
        }
    }
];
