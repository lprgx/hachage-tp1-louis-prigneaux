import { createServer } from "node:http";
import { create, liste } from "./blockchain.js";
import { NotFoundError } from "./errors.js";
import { findBlocks } from "./blockchainStorage.js";
import { createBlock, verifBlocks } from "./blockchainStorage.js";

createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const url = new URL(req.url, `http://${req.headers.host}`);
  const endpoint = `${req.method}:${url.pathname}`;

  let results;

  try {
    switch (endpoint) {
      case "GET:/blockchain":
        console.log("GET request received on /blockchain");
        results = await findBlocks();
        break;
      case "POST:/blockchain": {
        console.log("POST request received on /blockchain");
        const body = await new Promise((resolve, reject) => {
          let rawData = "";
          req.on("data", (chunk) => (rawData += chunk));
          req.on("end", () => resolve(JSON.parse(rawData)));
          req.on("error", reject);
        });

        results = await createBlock(body);
        res.writeHead(201);

        const isValid = await verifBlocks(results);
        if (!isValid) {
          throw new Error("Le bloc ajouté est invalide !");
        }
        else{
            console.log("Bloc valide !")
        }
        break;
      }
      default:
        console.log(`Unknown request: ${endpoint}`);
        res.writeHead(404);
    }
    if (results) {
      res.write(JSON.stringify(results));
    }
  } catch (erreur) {
    if (erreur instanceof NotFoundError) {
      console.log("404 error: resource not found");
      res.writeHead(404);
    } else {
      console.error("Unexpected error:", erreur);
      throw erreur;
    }
  }
  res.end();
}).listen(3000, () => {
  console.log("Server is listening on http://localhost:3000");
});
