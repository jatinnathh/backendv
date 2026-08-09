export function errorHandler(error, req, res, next) {
  console.error("Global Error Handler:", error);

  const trace = error?.trace || [
      { step: "controller", status: "completed" },
      { step: "database_query", status: "failed" },
      { step: "error_handler", status: "active" }
  ];

  res.status(500).json({
    error: "Internal server error",
    trace
  });
}
