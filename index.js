"use strict";

const express = require('express');

const CollectorMega = require("./collectorMega");

const app = express();
const PORT = process.env.PORT || 3000 ;

collect = (res, path, type, query) => { 
  try {
    const collect = CollectorMega(path, type, req.query);
    const data = collect.compute();
    return data;
  } catch (e) {
    return {error : "Too bad : " + e.toString()};
  }
}

app.get("/", function (req, res) {

  res.format({
    'application/json': function () {
      const data = collect(res, "all", "json", req.query);
      res.statusCode(("error" in data) ? 400 : 200);
      res.send(data);
    },

    'application/xml': function () {
      const data = collect(res, "all", "xml", req.query);
      res.statusCode(("error" in data) ? 400 : 200);
      res.send(data);
    },

    'application/rdf+xml': function () {
      const data = collect(res, "all", "rdf", req.query);
      res.statusCode(("error" in data) ? 400 : 200);
      res.send(data);
    },
  
    default: function () {
      res.status(406).send('Not Acceptable');
    }
  });

});

app.get("/drugs", function (req, res) {

  res.format({
    'application/json': function () {
      const data = collect(res, "drugs", "json", req.query);
      res.statusCode(("error" in data) ? 400 : 200);
      res.send(data);
    },

    'application/xml': function () {
      const data = collect(res, "drugs", "xml", req.query);
      res.statusCode(("error" in data) ? 400 : 200);
      res.send(data);
    },

    'application/rdf+xml': function () {
      const data = collect(res, "drugs", "rdf", req.query);
      res.statusCode(("error" in data) ? 400 : 200);
      res.send(data);
    },
  
    default: function () {
      res.status(406).send('Not Acceptable');
    }
  });

});

app.get("/wages", function (req, res) {

  res.format({
    'application/json': function () {
      const data = collect(res, "wages", "json", req.query);
      res.statusCode(("error" in data) ? 400 : 200);
      res.send(data);
    },

    'application/xml': function () {
      const data = collect(res, "wages", "xml", req.query);
      res.statusCode(("error" in data) ? 400 : 200);
      res.send(data);
    },

    'application/rdf+xml': function () {
      const data = collect(res, "wages", "rdf", req.query);
      res.statusCode(("error" in data) ? 400 : 200);
      res.send(data);
    },
  
    default: function () {
      res.status(406).send('Not Acceptable');
    }
  });

});

app.listen(PORT, function () {
  console.log('Serveur sur le port :' + PORT);
});