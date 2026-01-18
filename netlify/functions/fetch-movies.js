const { exec } = require("child_process");
const path = require("path");

exports.handler = async (event, context) => {
  const scriptPath = path.join(__dirname, "../../scripts/fetch-movies.mjs");

  return new Promise((resolve, reject) => {
    exec(
      `node ${scriptPath}`,
      { cwd: path.join(__dirname, "../..") },
      (error, stdout, stderr) => {
        if (error) {
          console.error("Error executing fetch-movies.mjs:", error);
          reject({
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
          });
        } else {
          console.log("fetch-movies.mjs executed successfully:", stdout);
          resolve({
            statusCode: 200,
            body: JSON.stringify({
              message: "Movies fetched successfully",
              output: stdout,
            }),
          });
        }
      }
    );
  });
};
