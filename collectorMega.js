// const collectorWages = require("./collectorWages");
// const collectorDrugs = require("./collectorDrugs");

module.exports = class CollectorMega {
    constructor(path, query) {
        // this.collectWages = new collectorWages(query);
        // this.collectDrugs = new collectorDrugs(query);
        this.path = path;
        this.query = query;
        this.type = "json";
        if ("type" in this.query) {
            this.type = this.query.type;
            delete this.query.type;
        }
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
        var s = `<wages>`;
        console.log(`\t\tWAGE`);
        Object.entries(wages).forEach(([quarter, data]) => {
            s += `<quarter id:${quarter}>`;
            console.log(`\t\t\tQUARTER:${quarter}`);
            Object.entries(data).forEach(([key, value]) => {
                key = key.split(' ')[0];
                console.log(`\t\t\t\t${key}:${value}`);
                s += `<"${key}">${value}</${key}>`;
            });
            s += `</quarter>`;
            console.log(`\t\t\t/QUARTER`);
        });
        s += `</wages>`;
        console.log(`\t\t/WAGE`);
        return s;
    }

    #drugs_to_xml(drugs) {
        var s = "<drugs>";
        console.log("\t\tDRUGS");
        Object.entries(drugs).forEach(([age, drugs]) => {
            s += `<age id:${age}>`;
            console.log(`\t\t\tAGE:${age}`);
            Object.entries(drugs).forEach(([drug, data]) => {
                s += `<drug id:${drug}>`;
                console.log(`\t\t\t\tDRUG:${drug}`);
                Object.entries(data).forEach(([key, value]) => {
                    key = key.split(' ')[0];
                    console.log(`\t\t\t\t\t${key}:${value}`);
                    s += `<${key}>${value}</${key}>`;
                });
                s += `</drug>`;
                console.log(`\t\t\t\t/DRUG`);
            });
            s += `</age>`;
            console.log(`\t\t\t/AGE`);
        });
        s += "</drugs>";
        console.log("\t\tDRUGS");
        return s;
    }

    #to_xml(data) {
        const that = this;
        const path = this.path;
        var s = `<?xml version="1.0" encoding="UTF-8"?>`;
        Object.entries(data).forEach(([state, years]) => {
            s += `<state id:${state}>`;
            Object.entries(years).forEach(([year, data]) => {
                s += `<year id:${year}>`;
                if (path == "all") {
                    s += that.#wages_to_xml(data.Wages);
                    s += that.#drugs_to_xml(data.Drugs);
                } else if (path == "wages") {
                    s += that.#wages_to_xml(data);
                } else if (path == "drugs") {
                    s += that.#drugs_to_xml(data);
                }

                s += `</year>`;
            });

            s += `</state>`;
        });
        return s;
    }

    #format_data(type, data) {
        if (type == "json") {
            data = JSON.Stringify(data);
        } else if (type == "xml") {
            data = this.#to_xml(data);
        } else if (type == "rdf") {
            data = this.#to_xml(data);
        }

        return data;
    }

    compute = () => {
        if (this.path == "all") {
            dataWages = this.collectorWages.compute();
            dataDrugs = this.collectorDrugs.compute();

            data = this.#data_merger(dataWages, dataDrugs);
            
        } else if (this.path == "wages") {
            data = this.collectorWages.compute();
        } else if (this.path == "drugs") {
            data = this.collectorDrugs.compute();
        }

        return this.#format_data(this.type, data);
    }

};
