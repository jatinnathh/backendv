export type HttpLabConfig = {
    id: string;
    category: string;
    name: string;
    description: string;
    endpoint: string;
    defaultMethod: string;
    allowedMethods: string[];
    explanation: string;
    tryItSteps: string[];
    defaultQuery?: Record<string, string>;
    defaultHeaders?: Record<string, string>;
    defaultBody?: string;
};

export const HTTP_LABS: HttpLabConfig[] = [
    {
        id: "echo",
        category: "FOUNDATIONS",
        name: "Request Anatomy",
        description: "Inspect every part of an HTTP request.",
        endpoint: "/api/http/echo",
        defaultMethod: "POST",
        allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        explanation: `
### What is an HTTP Request?
Every time your browser loads a page or your app fetches data, it sends an HTTP request.
A request consists of 4 main parts:
1. **Method**: The action to perform (e.g., GET, POST).
2. **URL & Path**: The address of the resource.
3. **Headers**: Metadata like Content-Type or Authorization.
4. **Body**: The actual data being sent (often JSON).
        `,
        tryItSteps: [
            "Change the Method to POST",
            "Add a Query Parameter (e.g., page=2)",
            "Add a JSON Body",
            "Send the request and inspect the Trace Timeline to see how Express parsed it."
        ],
        defaultQuery: { page: "2" },
        defaultHeaders: { "Content-Type": "application/json" },
        defaultBody: '{\n  "name": "Jatin"\n}'
    },
    {
        id: "methods",
        category: "FOUNDATIONS",
        name: "HTTP Methods",
        description: "Learn how different HTTP methods behave.",
        endpoint: "/api/http/methods",
        defaultMethod: "GET",
        allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        explanation: `
### HTTP Methods
- **GET**: Retrieve a resource.
- **POST**: Create a new resource.
- **PUT**: Replace a resource completely.
- **PATCH**: Partially update a resource.
- **DELETE**: Remove a resource.
        `,
        tryItSteps: [
            "Select the POST method",
            "Provide a name in the body",
            "Send the request to see Prisma create a record in the database."
        ]
    }
];
