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
                if (state !== "Total U.S.") data[state][year].drugs = d;
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
            s += `<etat id=${state}>`;
            Object.entries(years).forEach(([year, data]) => {
                console.log(year);
                s += `<has_annee id=${year}>`;
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

    #wages_to_rdf(year, quarter, data) {
        var s = "<rdfs:salaire>";

        s += `<rdfs:has_trimestre>${quarter}</rdfs:has_trimestre>`;

        s += `<rdfs:has_annee>${year}</rdfs:has_annee>`;
        Object.entries(data).forEach(([col_name, value]) => {
            s += `<rdfs:has_${col_name}>${value}</rdfs:has_${col_name}>`;
        });

        s += "</rdfs:salaire>";
        return s;
    }

    #drugs_to_rdf(year, age, drug, data) {
        var s = "<rdfs:drogue>";
        s += `<rdfs:has_nomDrogue>${drug}</rdfs:has_nomDrogue>`;
        s += `<rdfs:has_categorie_age>${age}</rdfs:has_categorie_age>`;

        s += `<rdfs:has_annee>${year}</rdfs:has_annee>`;
        Object.entries(data).forEach(([col_name, value]) => {
            s += `<rdfs:has_${col_name}>${value}</rdfs:has_${col_name}>`;
        });

        s += "</rdfs:drogue>";
        return s;
    }

    #to_rdf(data) {
        console.log("TO RDF");
        const that = this;
        const path = this.path;

        var s = `<?xml version="1.0" encoding="UTF-8"?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema">`;
        Object.entries(data).forEach(([state, years]) => {
            console.log(state);
            s += `<rdfs:etat>`;
            s += `<rdfs:has_nomEtat>${state}</rdfs:has_nomEtat>`;

            if (path == "all") {

                s += `<rdfs:has_collectSalaire>`;
                Object.entries(years).forEach(([year, data]) => {
                    Object.entries(data.wages).forEach(([quarter, data]) => {
                        s += that.#wages_to_rdf(year, quarter, data);
                    });
                });
                s += `</rdfs:has_collectSalaire>`;

                s += `<rdfs:has_collectDrogue>`;
                Object.entries(years).forEach(([year, data]) => {
                    Object.entries(data.drugs).forEach(([age, drugs]) => {
                        Object.entries(drugs).forEach(([drug, data]) => {
                            s += that.#drugs_to_rdf(year, age, drug, data);
                        });
                    });
                });
                s += `</rdfs:has_collectDrogue>`;

            } else if (path == "drugs") {

                s += `<rdfs:has_collectSalaire>`;
                Object.entries(years).forEach(([year, data]) => {
                    Object.entries(data.wages).forEach(([quarter, data]) => {
                        s += that.#wages_to_rdf(year, quarter, data);
                    });
                });
                s += `</rdfs:has_collectSalaire>`;

            } else if (path == "wages") {

                s += `<rdfs:has_collectDrogue>`;
                Object.entries(years).forEach(([year, data]) => {
                    Object.entries(data.drugs).forEach(([age, drugs]) => {
                        Object.entries(drugs).forEach(([drug, data]) => {
                            s += that.#drugs_to_rdf(year, age, drug, data);
                        });
                    });
                });
                s += `</rdfs:has_collectDrogue>`;

            }

            s += "</rdfs:etat>";
        });

        s += `</rdf:RDF>`;
        return s;
    }

    // #to_rdf(data) {
    //     return this.#to_xml(data);
    // }

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
            data = this.collectIncomes.compute();
        } else if (this.path == "drugs") {
            data = this.collectDrugs.compute();
        }

        return this.#format_data(this.type, data);
    }

};
