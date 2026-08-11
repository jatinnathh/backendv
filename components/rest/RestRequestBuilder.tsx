"use client";

type HttpMethod =
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE";

interface Props {
    method: HttpMethod;
    setMethod: (value: HttpMethod) => void;

    id: string;
    setId: (value: string) => void;

    name: string;
    setName: (value: string) => void;

    email: string;
    setEmail: (value: string) => void;

    age: string;
    setAge: (value: string) => void;

    role: string;
    setRole: (value: string) => void;

    page: string;
    setPage: (value: string) => void;

    limit: string;
    setLimit: (value: string) => void;

    search: string;
    setSearch: (value: string) => void;

    filterRole: string;
    setFilterRole: (value: string) => void;

    sortBy: string;
    setSortBy: (value: string) => void;

    order: string;
    setOrder: (value: string) => void;

    endpoint: string;

    loading: boolean;

    onExecute: () => void;
}

export default function RestRequestBuilder({
    method,
    setMethod,

    id,
    setId,

    name,
    setName,

    email,
    setEmail,

    age,
    setAge,

    role,
    setRole,

    page,
    setPage,

    limit,
    setLimit,

    search,
    setSearch,

    filterRole,
    setFilterRole,

    sortBy,
    setSortBy,

    order,
    setOrder,

    endpoint,

    loading,

    onExecute,
}: Props) {

    const needsBody =
        method === "POST" ||
        method === "PUT" ||
        method === "PATCH";


    return (
        <div className="border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">

            <div className="mb-6">

                <h2 className="text-xl font-medium">
                    REST Request Builder
                </h2>

                <p className="text-sm text-zinc-500 mt-1">
                    Send a real request to the Express backend.
                </p>

            </div>


            {/* METHOD */}

            <div>

                <label className="text-sm text-zinc-400">
                    HTTP Method
                </label>

                <div className="flex flex-wrap gap-2 mt-2">

                    {[
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                    ].map((item) => (

                        <button
                            key={item}
                            onClick={() =>
                                setMethod(
                                    item as HttpMethod
                                )
                            }
                            className={`
                                px-4
                                py-2
                                rounded-lg
                                text-sm
                                border
                                transition
                                ${
                                    method === item
                                        ? "bg-white text-black border-white"
                                        : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600"
                                }
                            `}
                        >
                            {item}
                        </button>

                    ))}

                </div>

            </div>


            {/* URL */}

            <div className="mt-5">

                <label className="text-sm text-zinc-400">
                    Request URL
                </label>

                <div className="mt-2 bg-black border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-300 break-all">

                    <span className="text-white">
                        {method}
                    </span>{" "}

                    {endpoint}

                </div>

            </div>


            {/* ID */}

            {(method !== "POST") && (

                <div className="mt-5">

                    <label className="text-sm text-zinc-400">
                        Resource ID
                    </label>

                    <input
                        value={id}
                        onChange={e =>
                            setId(e.target.value)
                        }
                        placeholder={
                            method === "GET"
                                ? "Leave empty to fetch collection"
                                : "User ID"
                        }
                        className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 outline-none"
                    />

                    <p className="text-xs text-zinc-600 mt-2">
                        Leave empty for the collection endpoint:
                        /users
                    </p>

                </div>

            )}


            {/* QUERY */}

            {method === "GET" && !id && (

                <div className="mt-6 border-t border-zinc-800 pt-5">

                    <div className="text-sm font-medium">
                        Query Parameters
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">

                        <div>
                            <label className="text-xs text-zinc-500">
                                Page
                            </label>

                            <input
                                value={page}
                                onChange={e =>
                                    setPage(e.target.value)
                                }
                                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-zinc-500">
                                Limit
                            </label>

                            <input
                                value={limit}
                                onChange={e =>
                                    setLimit(e.target.value)
                                }
                                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-zinc-500">
                                Search
                            </label>

                            <input
                                value={search}
                                onChange={e =>
                                    setSearch(e.target.value)
                                }
                                placeholder="name or email"
                                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-zinc-500">
                                Role
                            </label>

                            <select
                                value={filterRole}
                                onChange={e =>
                                    setFilterRole(e.target.value)
                                }
                                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5"
                            >
                                <option value="">
                                    All
                                </option>

                                <option value="USER">
                                    USER
                                </option>

                                <option value="ADMIN">
                                    ADMIN
                                </option>

                                <option value="MODERATOR">
                                    MODERATOR
                                </option>

                            </select>

                        </div>

                    </div>


                    <div className="grid grid-cols-2 gap-4 mt-4">

                        <select
                            value={sortBy}
                            onChange={e =>
                                setSortBy(e.target.value)
                            }
                            className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5"
                        >
                            <option value="createdAt">
                                createdAt
                            </option>

                            <option value="name">
                                name
                            </option>

                            <option value="email">
                                email
                            </option>

                            <option value="age">
                                age
                            </option>

                        </select>


                        <select
                            value={order}
                            onChange={e =>
                                setOrder(e.target.value)
                            }
                            className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5"
                        >
                            <option value="desc">
                                DESC
                            </option>

                            <option value="asc">
                                ASC
                            </option>

                        </select>

                    </div>

                </div>

            )}


            {/* BODY */}

            {needsBody && (

                <div className="mt-6 border-t border-zinc-800 pt-5">

                    <div className="text-sm font-medium">
                        Request Body
                    </div>

                    <div className="space-y-4 mt-4">

                        <div>
                            <label className="text-xs text-zinc-500">
                                Name
                            </label>

                            <input
                                value={name}
                                onChange={e =>
                                    setName(e.target.value)
                                }
                                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3"
                            />

                        </div>


                        <div>
                            <label className="text-xs text-zinc-500">
                                Email
                            </label>

                            <input
                                value={email}
                                onChange={e =>
                                    setEmail(e.target.value)
                                }
                                className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3"
                            />

                        </div>


                        <div className="grid grid-cols-2 gap-4">

                            <div>

                                <label className="text-xs text-zinc-500">
                                    Age
                                </label>

                                <input
                                    value={age}
                                    onChange={e =>
                                        setAge(e.target.value)
                                    }
                                    type="number"
                                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3"
                                />

                            </div>


                            <div>

                                <label className="text-xs text-zinc-500">
                                    Role
                                </label>

                                <select
                                    value={role}
                                    onChange={e =>
                                        setRole(e.target.value)
                                    }
                                    className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3"
                                >

                                    <option value="USER">
                                        USER
                                    </option>

                                    <option value="ADMIN">
                                        ADMIN
                                    </option>

                                    <option value="MODERATOR">
                                        MODERATOR
                                    </option>

                                </select>

                            </div>

                        </div>


                        <pre className="bg-black border border-zinc-800 rounded-lg p-4 text-xs text-zinc-400 overflow-auto">
{JSON.stringify(
    {
        name,
        email,
        age:
            age === ""
                ? undefined
                : Number(age),
        role,
    },
    null,
    2
)}
                        </pre>

                    </div>

                </div>

            )}


            {/* SEND */}

            <button
                onClick={onExecute}
                disabled={loading}
                className="w-full mt-6 bg-white text-black rounded-lg p-3 font-medium disabled:opacity-50"
            >
                {loading
                    ? "Sending Request..."
                    : "Send Request"}
            </button>


            <div className="mt-4 text-xs text-zinc-600">

                Backend:

                <span className="text-zinc-400 ml-1">
                    Express + Prisma + PostgreSQL
                </span>

            </div>

        </div>
    );
}