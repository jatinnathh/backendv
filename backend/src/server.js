import app from './app.js';

const PORT = Number(process.env.PORT) || 8000;

app.listen(PORT, () => {
  console.log(`

 Server: http://localhost:${PORT}
 Environment: ${process.env.NODE_ENV || "development"}
  `);
});