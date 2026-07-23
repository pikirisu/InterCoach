import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const [{ default: app }, { default: connectDB }] = await Promise.all([
  import("./app.js"),
  import("./db/index.js"),
]);

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error: ", error);
    process.exit(1);
  });
