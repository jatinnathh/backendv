import app from './src/app.js'
import connectDB from './src/config/database.js';
const port = 3000;

(async () => {
    await connectDB();
    app.listen(3000, () => {
        console.log("running on port " + port);
    });
})();