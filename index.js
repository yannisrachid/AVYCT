"use strict";

const express = require('express');

const CollectorMega = require("./collectorMega");

const app = express();
const PORT = process.env.PORT || 3000 ;

const collect = (res, path, type, query) => { 
  try {
    var collector = new CollectorMega(path, type, query);
    // console.log(collector);
    const data = collector.compute();
    console.log(data);
    return data;
  } catch (e) {
    return {error : "Too bad : " + e.toString()};
  }
}

app.get("/", function (req, res) {
  console.log(req.query)
  res.format({
    json : () => {
      console.log("JSON");
      const data = collect(res, "all", "json", req.query);
      res.status(("error" in data) ? 400 : 200);
      res.json(data);
    },

    xml : () => {
      const data = collect(res, "all", "xml", req.query);
      res.status(("error" in data) ? 400 : 200);
      res.send(data);
    },

    rdf : () => {
      const data = collect(res, "all", "rdf", req.query);
      res.status(("error" in data) ? 400 : 200);
      res.write(data);
    },
  
    default : () => {
      res.status(406).send('Not Acceptable');
    }
  });

  // var collector = new CollectorMega("all", "json", req.query);
  // console.log(collector);
  // const data = collector.compute();

  // res.status(("error" in data) ? 400 : 200);
  // res.send(data);

});

app.listen(PORT, function () {
  console.log('Serveur sur le port :' + PORT);
});