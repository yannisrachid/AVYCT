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
                s += `<"${key}">${value}</${key}>`;
            });
            s += "</quarter>";
        });
        s += "</wages>";
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
        return s;
    }

    #to_xml(data) {
        const that = this;
        const path = this.path;
        var s = `<?xml version="1.0" encoding="UTF-8"?>`;
        Object.entries(data).forEach(([state, years]) => {
            s += `<state id=${state}>`;
            Object.entries(years).forEach(([year, data]) => {
                s += `<year id=${year}>`;
                if (path == "all") {
                    s += that.#wages_to_xml(data.Wages);
                    s += that.#drugs_to_xml(data.Drugs);
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

    #to_rdf(data) {
        return this.#to_xml(data);
    }

    #format_data(type, data) {
        if (type == "xml") {
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
            console.log(dataWages, dataDrugs);
            data = this.#data_merger(dataWages, dataDrugs);
        } else if (this.path == "wages") {
            data = this.collectWages.compute();
        } else if (this.path == "drugs") {
            data = this.collectDrugs.compute();
        }

        return this.#format_data(this.type, data);
    }

};
