const express = require("express");
const route = express.Router();

route.get("/", (req, res) => {
  res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Learnio Server</title>
          <style>
            body {
              background-color: black;
              color: white;
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <h1>Doctorly Server is Running</h1>
        </body>
        </html>
      `);
});

module.exports = route;
