// const JSDOM = require("jsdom");
// const DOMParser = require("xmldom").DOMParser;
// const parseString = require('xml2js').parseString;

const collectorIncomes = require("./collectorIncomes");
const collectorDrugs = require("./collectorDrugs");

module.exports = class CollectorMega {
    constructor(path, type, query) {
        this.collectIncomes = new collectorIncomes(query);
        this.collectDrugs = new collectorDrugs(query);

        this.path = path;
        this.type = type;

        this.query = query;
    }

    #data_merger(wages, drugs) {
        var data = {};

        Object.entries(wages).forEach(([state, years]) => {
            data[state] = {};
            Object.entries(years).forEach(([year, d]) => {
                data[state][year] = {"wages" : {}, "drugs" : {}}
                data[state][year].wages = d;
            });
        });

        Object.entries(drugs).forEach(([state, years]) => {
            Object.entries(years).forEach(([year, d]) => {
                data[state][year].drugs = d;
            });
        });

        return data;
    }

    #wages_to_xml(wages) {
        var s = "<wages>";
        Object.entries(wages).forEach(([quarter, data]) => {
            s += `<quarter id=${quarter}>`;
            Object.entries(data).forEach(([key, value]) => {
                key = key.split(' ')[0];
                s += `<${key}>${value}</${key}>`;
            });
            s += "</quarter>";
        });
        s += "</wages>";
        // console.log("XML/WAGES : ", s);
        return s;
    }

    #drugs_to_xml(drugs) {
        var s = "<drugs>";
        Object.entries(drugs).forEach(([age, drugs]) => {
            s += `<age id=${age}>`;
            Object.entries(drugs).forEach(([drug, data]) => {
                s += `<drug id=${drug}>`;
                Object.entries(data).forEach(([key, value]) => {
                    key = key.split(' ')[0];
                    s += `<${key}>${value}</${key}>`;
                });
                s += "</drug>";
            });
            s += "</age>";
        });
        s += "</drugs>";
        // console.log("XML/DRUGS : ", s);
        return s;
    }

    #to_xml(data) {
        const that = this;
        const path = this.path;

        var s = `<?xml version="1.0" encoding="UTF-8"?>`;
        Object.entries(data).forEach(([state, years]) => {
            console.log(state);
            s += `<state id=${state}>`;
            Object.entries(years).forEach(([year, data]) => {
                console.log(year);
                s += `<year id=${year}>`;
                if (path == "all") {
                    console.log(Object.keys(data));
                    s += that.#wages_to_xml(data.wages);
                    s += that.#drugs_to_xml(data.drugs);
                } else if (path == "wages") {
                    s += that.#wages_to_xml(data);
                } else if (path == "drugs") {
                    s += that.#drugs_to_xml(data);
                }
                s += "</year>";
            });

            s += "</state>";
        });

        return s;
    }

    #parse_xml(txt) {
        var xmlDoc = undefined;

        // if (window.DOMParser) {
        //     parser = new DOMParser();
        //     xmlDoc = parser.parseFromString(s, "text/xml");
        // } else {
        //     xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        //     xmlDoc.async = false;
        //     xmlDoc.loadXML(s);
        // }

        // const parser = new DOMParser();
        // xmlDoc = parser.parseFromString(txt, "text/xml");

        return xmlDoc;
    }

    #to_rdf(data) {
        return this.#to_xml(data);
    }

    #format_data(type, data) {
        if (type == "xml") {
            data = this.#to_xml(data);
            // data = this.#parse_xml(data);
            // data = JSON.stringify(data);
            // console.log("OUT : ", typeof data);
        } else if (type == "rdf") {
            data = this.#to_rdf(data);
        }

        return data;
    }

    compute() {
        var data = {};
        if (this.path == "all") {
            const dataWages = this.collectIncomes.compute();
            const dataDrugs = this.collectDrugs.compute();
            // console.log(dataWages, dataDrugs);
            data = this.#data_merger(dataWages, dataDrugs);
        } else if (this.path == "wages") {
            data = this.collectWages.compute();
        } else if (this.path == "drugs") {
            data = this.collectDrugs.compute();
        }

        return this.#format_data(this.type, data);
    }

};
