"use client";

import { useState } from "react";

const sections = [
    {
        title: "What is REST?",
        content: `
REST is an architectural style for designing networked applications.

Instead of thinking about endpoints as actions such as:

POST /createUser

REST encourages thinking about resources:

/users

HTTP methods then describe what you want to do with that resource.

GET    /users
POST   /users
GET    /users/:id
PUT    /users/:id
PATCH  /users/:id
DELETE /users/:id
        `,
    },

    {
        title: "Resource vs Endpoint",
        content: `
A resource represents a piece of data or a domain object.

Examples:

/users
/products
/orders

/users is a collection.

/users/42 represents one specific resource.

The URL identifies the resource.
The HTTP method describes the operation.
        `,
    },

    {
        title: "PUT vs PATCH",
        content: `
PUT generally represents replacement of a resource.

Example:

PUT /users/42

{
    "name": "Jatin",
    "email": "jatin@example.com",
    "age": 21,
    "role": "USER"
}

PATCH represents a partial modification.

PATCH /users/42

{
    "age": 22
}

A PATCH request does not need to contain the entire resource.
        `,
    },

    {
        title: "Status Codes",
        content: `
REST APIs communicate the result of an operation through HTTP status codes.

200 OK
The request succeeded.

201 Created
A new resource was created.

204 No Content
The request succeeded but there is no response body.

400 Bad Request
The client sent invalid data.

401 Unauthorized
Authentication is required or invalid.

403 Forbidden
The client is authenticated but does not have permission.

404 Not Found
The requested resource does not exist.

409 Conflict
The request conflicts with existing state.

500 Internal Server Error
Something unexpected happened on the server.
        `,
    },

    {
        title: "Pagination",
        content: `
Returning thousands of records in one response is inefficient.

Instead APIs commonly support:

?page=2&limit=10

For page 2:

offset = (page - 1) * limit

offset = (2 - 1) * 10
offset = 10

The database can then return only the required records.
        `,
    },

    {
        title: "Filtering",
        content: `
Query parameters can describe filters.

GET /users?role=ADMIN

The server converts the HTTP query parameter into a database filter.

Conceptually:

role=ADMIN

↓

Prisma WHERE

↓

role = "ADMIN"

↓

PostgreSQL
        `,
    },

    {
        title: "Sorting",
        content: `
APIs can expose controlled sorting.

GET /users?sortBy=name&order=asc

The server should NOT blindly accept arbitrary database fields.

Instead, maintain an allow-list:

createdAt
name
email
age

This prevents unexpected database queries and keeps the API predictable.
        `,
    },

    {
        title: "Controller vs Service",
        content: `
A controller handles HTTP concerns.

It understands:

req
res
params
query
body
status codes

The service handles application logic.

Controller:

HTTP request
    ↓
Controller
    ↓
Service

Service:

Service
    ↓
Prisma
    ↓
Database

Keeping these responsibilities separate makes the backend easier to test and maintain.
        `,
    },

    {
        title: "The Complete Request",
        content: `
Your REST experiment follows this architecture:

Browser
   ↓
HTTP Request
   ↓
Express Router
   ↓
Middleware
   ↓
Controller
   ↓
Service
   ↓
Prisma
   ↓
PostgreSQL
   ↓
Service
   ↓
Controller
   ↓
HTTP Response
   ↓
Browser

This is one of the most important backend flows to understand.
        `,
    },
];


export default function RestNotes() {

    const [open, setOpen] =
        useState<number | null>(0);


    return (
        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">

            <div className="p-6 border-b border-zinc-800">

                <div className="text-xs text-zinc-600 uppercase tracking-wider">
                    Study Material
                </div>

                <h2 className="text-2xl font-medium mt-2">
                    REST API Notes
                </h2>

                <p className="text-zinc-500 mt-2">
                    Read these concepts, then return to the
                    experiment and try them against the real backend.
                </p>

            </div>


            {sections.map((section, index) => (

                <div
                    key={section.title}
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

                        <span className="text-sm font-medium">
                            {section.title}
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
                                {section.content.trim()}
                            </pre>

                        </div>

                    )}

                </div>

            ))}

        </div>
    );
}