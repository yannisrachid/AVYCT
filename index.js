"use strict";

const express = require('express');
const fs = require("fs");

const CollectorMega = require("./collectorMega");

const app = express();
const PORT = process.env.PORT || 3000 ;

const collect = (res, path, type, query) => { 
  try {
    var collector = new CollectorMega(path, type, query);
    const data = collector.compute();
    return data;
  } catch (e) {
    return {error : e.toString()};
  }
}

app.get("/:path", function (req, res) {
  console.log(req.query)
  res.format({
    "application/json" : () => {
      // console.log("JSON");
      const data = collect(res, req.params.path, "json", req.query);
      res.status(("error" in data) ? 400 : 200);
      res.json(data);
    },

    "application/xml" : () => {
      // console.log("XML");
      const data = collect(res, req.params.path, "xml", req.query);
      res.status((typeof data !== "string") ? 400 : 200);
      res.send(data);
    },

    "application/rdf+xml" : () => {
      // console.log("RDF/XML");
      const data = collect(res, req.params.path, "rdf", req.query);
      res.status((typeof data !== "string") ? 400 : 200);
      res.send(data);
    },
  
    default : () => {
      res.status(406).send('Not Acceptable');
    }
  });

});

app.get("/rdf", function (req, res) {
  try {
    const rdf = fs.readFileSync("assets/vocabulary.rdf", "utf-8");
    res.status(200);
    res.send(rdf);  
  } catch (e) {
    res.status(400);
    res.send("Error during file parse.");
  }
});

app.listen(PORT, function () {
  console.log('Serveur sur le port :' + PORT);
});