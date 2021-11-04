const csv = require('csv-parser');
const fs = require('fs');
const Papa = require("papaparse");
const { addAbortSignal } = require('stream');
var _ = require("underscore");
const fetch = require("cross-fetch");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = class CollectorIncomes {
    

    constructor(query) {
        this.query = query;
        this.data = this.extract_data('incomes');
    }

    compute() {
        // var data = this.extract_data('incomes');

        // this.data = this.extract_data('incomes');
        const that = this;

        this.format_query();
        //console.log(this.query);
        this.data = _.pick(this.data, this.query.state);

        // this.data = this.data.map(state => {
        //     state = _.pick(state, that.query.year);

        //     state = state.map(year => {
        //         year = _.pick(year, that.query.quarter);
            
        //     });
        // });

        for (let state in this.data) {
            var state_obj = this.data[state];
            state_obj = _.pick(state_obj, this.query.year);
            //console.log("years", state_obj);
            for (let year in state_obj) {
                var year_obj = state_obj[year];
                year_obj = _.pick(year_obj, this.query.quarter);
                state_obj[year] = year_obj;

                for (let quarter in year_obj) {
                    var quarter_obj = year_obj[quarter];
                    quarter_obj = _.pick(quarter_obj, this.query.metric);
                    year_obj[quarter] = quarter_obj;
                    console.log("metric", quarter_obj);
                }

            }
            this.data[state] = state_obj;
        }
        console.log("COMPUTE(I) : ", this.data);
        //console.log("COMPUTE(I) query : ", this.query);
        return this.data;

    }

    format_query() {

        const default_query = { state: 'Alabama', year: undefined, quarter: undefined, metric: ["personal_income", "population", "per_capita_personal_income"], type: "json"};

        this.query = Object.assign(default_query, this.query);

        // STATES
        if (this.query.state.includes(',')) {

            this.query.state = this.query.state.split(',');
        }

        // YEARS
        if (this.query.year !== undefined && this.query.year.includes(',')) {

            this.query.year = this.query.year.split(',');

        } else if (this.query.year !== undefined && this.query.year.includes('-')){

            this.query.year = this.query.year.split('-');

            this.query.year = this.query.year.map(x => parseInt(x, 10));

            var tbl=[]

            for (var i = this.query.year[0]; i<=this.query.year[1]; i++) {

                tbl.push(i);
            }

            this.query.year = tbl;

        } else if (this.query.year === undefined) {

            this.query.year = []
            for (var i = 2013; i<=2019; i++) {
                this.query.year.push(i);
            }
        }

        // QUARTERS
        if (this.query.quarter !== undefined && this.query.quarter.includes(',')) {

            this.query.quarter = this.query.quarter.split(',');

        } else if (this.query.quarter !== undefined && this.query.quarter.includes('-')){

            this.query.quarter = this.query.quarter.split('-');

            this.query.quarter = this.query.quarter.map(x => x[1]);
            this.query.quarter = this.query.quarter.map(x => parseInt(x, 10));

            var tbl=[]

            for (var i = this.query.quarter[0]; i<=this.query.quarter[1]; i++) {

                tbl.push("Q"+i);
            }

            this.query.quarter = tbl;

        } else if (this.query.quarter === undefined) {

            this.query.quarter = []
            for (var i = 1; i<=4; i++) {
                this.query.quarter.push("Q"+i);
            }
        }

        // METRICS
        if (typeof this.query.metric != "object" && this.query.metric.includes(',')) {
            this.query.metric = this.query.metric.split(',');
        }

    }

    httpGet(theUrl) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
        xmlHttp.send( null );
        return xmlHttp.responseText;
    }

    extract_data(csv_name) {
        
        try {
            
            // VERSION CSV
            // let csv = fs.readFileSync('./data/' + csv_name + '.csv', "utf-8");
            // let csv_json = Papa.parse(csv, {encoding: "utf-8"});
            
            // //TODO: modifier les appels
            // var output = this.formating_wages_from_csv(csv_json);
            // //console.log(Object.keys(output));
            // return output;

            // VERSION FETCH
            var csv_fetch = undefined;
            /*
            fetch("http://91.168.117.237:1905/incomes.csv")
            .then(res => res.json())
            .then(data => {
                csv_fetch = data; // do something with data
                // console.log(csv_fetch);

                //let csv = fs.readFileSync('./data/' + csv_name + '.csv', "utf-8");
                //let csv_json = Papa.parse(csv, {encoding: "utf-8"});
                //console.log(csv_json.data.length);
                
                //TODO: modifier les appels
                var output = this.formating_wages_from_csv(csv_fetch);

                return output;
            })
            .catch(rejected => {
                console.log(rejected);
            });
            */
            const resp = this.httpGet("http://91.168.117.237:1905/incomes.csv");
            const csvjson =  JSON.parse(resp);
            var output = this.formating_wages_from_csv(csvjson);
            return output;
            //console.log(output);
            //return output;
            //console.log(csv_fetch);
        
        } catch(e){
            console.error(e);
        }
   
    }

    rename_keys(old_line, map) {

        _.each(old_line, function(value, key) {
            key = map[key] || key;
            old_line[key] = value;
        });
        
        return _.omit(old_line, Object.keys(map));
    };

    formating_wages_from_csv(csv_json) {
        
        const header_line = "4"
        const column_names = Object.values(csv_json.data[header_line]);
        // Remaing GeoName into States
        column_names["1"] = "State";
        
        let map = new Object()
        for (let col = 0; col < column_names.length; col++) {
            map[col] = column_names[col];
            };
        
        /*
        var map = {
            '0': 'GeoFips',
            '1': 'GeoName',
            '2': 'LineCode',
            '3': 'Description',
            '4': '2010:Q1',
            '5': '2010:Q2',
            '6': '2010:Q3',
            '7': '2010:Q4', etc ....
        }*/

        //var a = Object.values(csv_json.data[5]);
        // for each line in csv line =  rename_keys(a, map)
        var new_data = new Object()  
        
        Object.entries(csv_json.data).forEach(entry => {

            const [key, value] = entry;
            const new_line = this.rename_keys(Object.values(value), map);
            //suppressing the first 4 rows of headers, not states
            if (key > parseInt(header_line))
                new_data[key] = new_line;
            });
        /*
        var test = new Object()
        test["11"] = new_data["11"]
        test["12"] = new_data["12"]
        test["13"] = new_data["13"]
        test["14"] = new_data["14"]
        test["15"] = new_data["15"]
            */
        //console.log(test);
        /*
        11 {
            GeoFips: '04000',
            State: 'Arizona',
            LineCode: '1',
            Description: 'Personal income (millions of dollars, seasonally adjusted)',
            '2010:Q1': '212514.4'
          }
          12 {
            GeoFips: '04000',
            State: 'Arizona',
            LineCode: '2',
            Description: 'Population (midperiod, persons) 1/',
            '2010:Q1': '6385037',
            '2010:Q2': '6399687'
          }
          13 {
            GeoFips: '04000',
            State: 'Arizona',
            LineCode: '3',
            Description: 'Per capita personal income (dollars) 2/',
            '2010:Q1': '33283',
            '2010:Q2': '33735'
          }*/
        
        /*
        [
            Arizona: [
                {
                    GeoFips: '04000',
                    State: 'Arizona',
                    LineCode: '1',
                    Description: 'Personal income (millions of dollars, seasonally adjusted)',
                    '2010:Q1': '212514.4'
                },
                {
                    GeoFips: '04000',
                    State: 'Arizona',
                    LineCode: '2',
                    Description: 'Population (midperiod, persons) 1/',
                    '2010:Q1': '6385037',
                    '2010:Q2': '6399687'
                },
                {
                    GeoFips: '04000',
                    State: 'Arizona',
                    LineCode: '3',
                    Description: 'Per capita personal income (dollars) 2/',
                    '2010:Q1': '33283',
                    '2010:Q2': '33735'
                }
            ]
        ]
        */
       /*
        [
            Arizona: {
                '2010:Q1': { 'Personal income (millions of dollars, seasonally adjusted)' : '212514.4',
                             'Population (midperiod, persons) 1/' : '6385037',
                             'Per capita personal income (dollars) 2/' : '33283',

                            },
                '2010:Q2': { 'Personal income (millions of dollars, seasonally adjusted)' : '212514.4',
                             'Population (midperiod, persons) 1/' :  '6399687',
                             'Per capita personal income (dollars) 2/' : '33283',

                            },
                ....

            }
        
        ]
        */
       /*
        [
            Arizona: {
                '2010':
                    {'Q1': { 'Personal income (millions of dollars, seasonally adjusted)' : '212514.4',
                             'Population (midperiod, persons) 1/' : '6385037',
                             'Per capita personal income (dollars) 2/' : '33283',

                            },
                     'Q2': { 'Personal income (millions of dollars, seasonally adjusted)' : '212514.4',
                             'Population (midperiod, persons) 1/' :  '6399687',
                             'Per capita personal income (dollars) 2/' : '33283',

                            },
                     'Q3':
                     'Q4':
                    }
                '2011': {}

            }
            
            
        
        ]
        */
        //var colnames = new_data.filter(i => !new_data[].includes(i))
        //const row2ban = [0,1,2,3,4];
        //var filtered = Object.fromEntries(Object.entries(new_data).filter(([key]) => row2ban.includes(key)));
        //var filtered = Object.filter(new_data, new_data => new_data > header_line); 
        //console.log(Object.keys(new_data));
        
        var pivoted_states = Object.values(new_data).reduce((final, current) => {
            
            var state_name = current.State;
            // state_name.replace(" *","");
            if (state_name == "Alaska *")
                state_name = "Alaska";
            if (state_name == "Hawaii *")
                state_name = "Hawaii";
            // create object with State as keys and objects as values (always 3 values per state)
            if (Object.keys(final).includes(state_name)) {
                final[state_name].push(current);
            } else {
                final[state_name] = new Array();
                final[state_name].push(current);
            }
            return final;
        }, []);
        
        //var entry_list = pivoted_states.Arizona;

        Object.entries(pivoted_states).forEach(entry => {

            const [key, value] = entry;
            pivoted_states[key] = this.pivot_years(value)
            
            });
        /*
        Object.entries(pivoted_states).forEach(entry => {

            const [key, value] = entry;
            console.log(key);
            console.log(value);
            });
        */
        delete pivoted_states["undefined"];
        //console.log(Object.keys(pivoted_states));
        return pivoted_states;
    }

    
    pivot_years(array_3_descriptions) {

        const all_cols = Object.keys(array_3_descriptions[0]);
        const columns2ban = ['GeoFips', 'State',   'LineCode', 'Description'];
        var colnames = all_cols.filter(i => !columns2ban.includes(i))

        var output_object = new Object();
        Object.values(colnames).forEach(value => {

            output_object[value] = new Object();
            //console.log(key, new_line);
            });
        
        Object.values(array_3_descriptions).forEach(value => {

            const key_name = value.Description
            //console.log(key_name);
            
            Object.values(colnames).forEach(colname => {

                output_object[colname][key_name] = value[colname]
                
                });
        });        
        
        var pivoted_quarters = this.pivot_quarters(output_object);

        return pivoted_quarters
    };

    pivot_quarters(pivoted_year){

        /*
        input object:
        {
            '2010:Q1': { 'Personal income (millions of dollars, seasonally adjusted)' : '212514.4',
                         'Population (midperiod, persons) 1/' : '6385037',
                         'Per capita personal income (dollars) 2/' : '33283',

                        },
            '2010:Q2': { 'Personal income (millions of dollars, seasonally adjusted)' : '212514.4',
                         'Population (midperiod, persons) 1/' :  '6399687',
                         'Per capita personal income (dollars) 2/' : '33283',

                        },*/

        const quartiles = ['Q1', 'Q2', 'Q3', 'Q4'];

        var output_quarter_pivot = new Object();
        Object.keys(pivoted_year).forEach(key => {
            
            let year = key.slice(0,4);
            if (!Object.keys(output_quarter_pivot).includes(year))
                output_quarter_pivot[year] = new Object();

        });

        var map_stat = {
            'Personal income (millions of dollars, seasonally adjusted)': 'personal_income',
            'Population (midperiod, persons) 1/': 'population',
            'Per capita personal income (dollars) 2/': 'per_capita_personal_income'
        };

        Object.keys(output_quarter_pivot).forEach(key => {
                
            for (var q of quartiles) {
                
                const key2search = key.concat(':', q);
                if (Object.keys(pivoted_year).includes(key2search)){
                    var stat_block = this.rename_keys(pivoted_year[key2search], map_stat);
                    output_quarter_pivot[key][q] = stat_block;
                };

            };
        });

        return output_quarter_pivot
    };
    
    
    
};