const csv = require('csv-parser');
const fs = require('fs');
const Papa = require("papaparse");
const { addAbortSignal } = require('stream');
var _ = require("underscore");
const fetch = require("cross-fetch");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = class CollectorDrugs {
    

    constructor(query) {
        this.query = query;
        //TO DO MERGE
        //this.data = this.extract_data('drugs');
    }

    compute() {
        const that = this;

        this.format_query();
        //console.log(this.query);
        this.data = this.get_data(this.query.year);

        this.data = _.pick(this.data, this.query.state);

        for (let state in this.data) {
            var state_obj = this.data[state];

            for (let year in state_obj) {
                var year_obj = state_obj[year];
                year_obj = _.pick(year_obj, this.query.age);
                

                for (let age in year_obj) {
                    var age_obj = year_obj[age];
                    age_obj = _.pick(age_obj, this.query.drug);
                    year_obj[age] = age_obj;
                    //console.log("metric", age_obj);
                    //console.log(Object.keys(year_obj));
                }
                state_obj[year] = year_obj;
            }
            this.data[state] = state_obj;
        }
        // console.log("COMPUTE(D) : ", this.data);
        return this.data;

    }

    get_data(param) {

        // 2015 ou [2015, 2016, 2017]

        // console.log(param);
        if (param !== undefined && typeof param == "string") {
            const some = this.extract_data("drugs_" + param);
            return some;
            // return this.extract_data('drugs_'+param);

        } else if (param !== undefined && typeof param == "object") {

            var debut = 1;
            var big_obj = new Object;

            for (var i = 1; i<param.length; i++) {
                if (debut==0) {
                    // console.log('milieu');
                    // console.log(param[i]);
                    var obj_i = this.extract_data("drugs_"+param[i]);
                    big_obj = this.merge_object_years(big_obj, obj_i);
                } else {
                    // console.log('debut');
                    // console.log(param[i-1], param[i]);
                    var obj_1 = this.extract_data("drugs_"+param[i-1]);
                    var obj_2 = this.extract_data("drugs_"+param[i]);
                    big_obj = this.merge_object_years(obj_1, obj_2);
                    debut=0;
                }
            }
        }
        return big_obj;
    }


    format_query() {

        const default_query = { state: 'Alabama', year: undefined, age: ['12+', '12-17','18+', '18-25','26+'], estimate: undefined, drug: ['alcohol','cigarette','cocaine','marijuana','heroin','illicit_drug','substance','pain_reliever','tobacco_product','depressive','methamphetamine','suicide','mental'], type: "json"};

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
        // AGE
        if (typeof this.query.age!= "object" && this.query.age.includes(',')) {
            this.query.age = this.query.age.split(',');
        }

        // ESTIMATE
        if (typeof this.query.age == "string") {

            if (this.query.age.includes(' ')) {
                this.query.age = this.query.age.replace(" ", "");
            }
            
            if (this.query.estimate == undefined) {

                var lst_est = ['Estimate', '95L', '95U'];
                var tbl=[]

                if (!this.query.age.includes('-')) {
                    Object.values(lst_est).forEach(value => {
                        tbl.push(this.query.age+'+'+value);
                    });

                } else {   
                    Object.values(lst_est).forEach(value => {
                        tbl.push(this.query.age+'-'+value);
                    });
                }

                this.query.age = tbl;

            } else if (this.query.estimate == "true") {
                
                if (!this.query.age.includes('-')) {

                    this.query.age = this.query.age+'+'+'Estimate';

                } else {

                    this.query.age = this.query.age+'-Estimate';
                }

            } else {

                var lst_est = ['95L', '95U'];
                var tbl=[]

                if (!this.query.age.includes('-')) {
                    Object.values(lst_est).forEach(value => {
                        tbl.push(this.query.age+'+'+value);
                    });

                } else {   
                    Object.values(lst_est).forEach(value => {
                        tbl.push(this.query.age+'-'+value);
                    });
                }

                this.query.age = tbl;
            }

        // else if (typeof this.query.age == "object")
        } else {

            if (this.query.estimate == undefined) {

                var lst_est = ['Estimate', '95L', '95U'];
                var tbl=[]

                
                Object.values(this.query.age).forEach(value_q => {

                    if (value_q.includes(' ')) {
                        value_q = value_q.replace(" ", "");
                    }

                    if (!value_q.includes('-')) {
                        Object.values(lst_est).forEach(value => {
                            tbl.push(value_q+'+'+value);
                        });

                    } else {   
                        Object.values(lst_est).forEach(value => {
                            tbl.push(value_q+'-'+value);
                        });
                    }
                });

                this.query.age = tbl;

            } else if (this.query.estimate == "true") {

                //query_age = ['12+', '12-17']

                var tbl = [];
                
                Object.values(this.query.age).forEach(value_q => {

                    if (value_q.includes(' ')) {
                        value_q = value_q.replace(" ", "");
                    }

                    if (!value_q.includes('-')) {

                        tbl.push(value_q+'+'+'Estimate');

                    } else {

                        tbl.push(value_q+'-Estimate');   
                    }

                });

                console.log(tbl);

                this.query.age = tbl;

            } else if (this.query.estimate == "false") {

                var lst_est = ['95L', '95U'];
                var tbl=[]

                //query_age = ['12+', '12-17']

                Object.values(this.query.age).forEach(value_q => {

                    if (value_q.includes(' ')) {
                        value_q = value_q.replace(" ", "");
                    }

                    if (!value_q.includes('-')) {
                        Object.values(lst_est).forEach(value => {
                            tbl.push(value_q+'+'+value);
                        });

                    } else {   
                        Object.values(lst_est).forEach(value => {
                            tbl.push(value_q+'-'+value);
                        });
                    }

                });

                this.query.age = tbl;
            }

        }

        // DRUGS
        if (typeof this.query.drug!= "object" && this.query.drug.includes(',')) {
            this.query.drug = this.query.drug.split(',');
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
            // const csv_name = 'drugs_2016'
            // VERSION CSV
            // let csv = fs.readFileSync('./data/' + csv_name + '.csv', "utf-8");
            // let csv_json = Papa.parse(csv, {encoding: "utf-8"});
            
            // //TODO: modifier les appels
            // var output = this.formating_drugs_from_csv(csv_name, csv_json);
            // //console.log(Object.keys(output));
            // return output;
            /**/
            
            // VERSION FETCH
            /*
            var csv_fetch = undefined;
            fetch("http://91.168.117.237:1905/" + csv_name + ".csv")
            .then(res => res.json())
            .then(data => {
                // console.log(data);
                csv_fetch = data; // do something with data
                // console.log(csv_fetch);

                //let csv = fs.readFileSync('./data/' + csv_name + '.csv', "utf-8");
                //let csv_json = Papa.parse(csv, {encoding: "utf-8"});
                //console.log(csv_json.data.length);
                
                //TODO: modifier les appels
                var output = this.formating_drugs_from_csv(csv_name, data);
                return output;
            })
            .catch(rejected => {
                console.log(rejected);
            });
            //console.log(csv_fetch);
            */
            const resp = this.httpGet("http://91.168.117.237:1905/" + csv_name + ".csv");
            const csvjson =  JSON.parse(resp);
            var output = this.formating_drugs_from_csv(csv_name, csvjson);
            return output;
        
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

    formating_drugs_from_csv(csv_name, csv_json) {

        const year = csv_name.split("_")[1];
        
        const header_line_ages_cat = "0"
        const header_line_drugs_cat = "1"
        const column_names_ages_cat = Object.values(csv_json.data[header_line_ages_cat]);
        const column_names_drugs_cat = Object.values(csv_json.data[header_line_drugs_cat]);
        //console.log(column_names_ages_cat);
        //console.log(column_names_drugs_cat);
        
        // Remaing GeoName into States
        //column_names_ages_cat["0"] = "State";
        
        let map = new Object()
        for (let col = 0; col < column_names_ages_cat.length; col++) {
            if (col == 0)
                map[col] = 'State'
            else
                map[col] = column_names_ages_cat[col].concat('&&', column_names_drugs_cat[col]);
            };
        //if (col = 0)
            //    map[col] = 'State'
            //else
        //console.log(map);
        /*
        var map = {
            '206': '18+Estimate&&alcohol_use_disorder_in_the_past_year',
            '207': '18+Estimate&&alcohol_use_in_the_past_month',
            '208': '18+Estimate&&any_mental_illness_in_the_past_year',
            '209': '18+Estimate&&binge_alcohol_use_in_the_past_month', 
            etc ....
        }*/

        //var a = Object.values(csv_json.data[5]);
        // for each line in csv line =  rename_keys(a, map)
        
        var new_data = new Object()  
        
        Object.entries(csv_json.data).forEach(entry => {

            const [key, value] = entry;
            const new_line = this.rename_keys(Object.values(value), map);
            //suppressing the first 4 rows of headers, not states
            if (key > 2)
                new_data[key] = new_line;
            });
        //console.log(new_data);
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
        '55': {
                '&&': 'Washington',
                '12+95L&&alcohol_use_disorder_in_the_past_year': '283',
                '12+95L&&alcohol_use_in_the_past_month': '3,188',
                '12+95L&&binge_alcohol_use_in_the_past_month': '1,280',
                '12+95L&&cigarette_use_in_the_past_month': '850',
                '12+95L&&cocaine_use_in_the_past_year': '88',
                '12+95L&&first_use_of_marijuana': '64',
                }
        '56': {
                '&&': 'West Virginia',
                '12+95L&&alcohol_use_disorder_in_the_past_year': '283',
                '12+95L&&alcohol_use_in_the_past_month': '3,188',
                '12+95L&&binge_alcohol_use_in_the_past_month': '1,280',
                '12+95L&&cigarette_use_in_the_past_month': '850',
                '12+95L&&cocaine_use_in_the_past_year': '88',
                '12+95L&&first_use_of_marijuana': '64',
                }
            
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
            Washington: [
                {
                    'State': 'Washington',
                    '12+95L&&alcohol_use_disorder_in_the_past_year': '283',
                    '12+95L&&alcohol_use_in_the_past_month': '3,188',
                    '12+95L&&binge_alcohol_use_in_the_past_month': '1,280',
                    '12+95L&&cigarette_use_in_the_past_month': '850',
                    '12+95L&&cocaine_use_in_the_past_year': '88',
                    '12+95L&&first_use_of_marijuana': '64',
                },
                {
                    'State': 'Washington',
                    '12+95L&&alcohol_use_disorder_in_the_past_year': '283',
                    '12+95L&&alcohol_use_in_the_past_month': '3,188',
                    '12+95L&&binge_alcohol_use_in_the_past_month': '1,280',
                    '12+95L&&cigarette_use_in_the_past_month': '850',
                    '12+95L&&cocaine_use_in_the_past_year': '88',
                    '12+95L&&first_use_of_marijuana': '64',
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
            //if (state_name == "Alaska *")
            //     state_name = "Alaska";
            // if (state_name == "Hawaii *")
            //     state_name = "Hawaii";
            // create object with State as keys and objects as values (always 3 values per state)
            if (Object.keys(final).includes(state_name)) {
                final[state_name].push(current);
            } else {
                final[state_name] = new Array();
                final[state_name].push(current);
            }
            return final;
        }, []);
        //console.log(Object.keys(pivoted_states));
        
        //var entry_list = pivoted_states.Arizona;
        
        // var year = '2016'

        Object.entries(pivoted_states).forEach(entry => {

            const [key, value] = entry;
            pivoted_states[key] = this.add_year(value, year)
            //pivoted_states[key] = this.pivot_years(value)
            
            });
        //console.log(pivoted_states);
        
        
        delete pivoted_states[""];
        //console.log(Object.keys(pivoted_states));
        
        return pivoted_states;

    }

    add_year(value, year) {

        var output_object = new Object();

        output_object[year] = this.pivot_on_age_cat(value)   
        //console.log(output_object);    

        return output_object

    }

    pivot_on_age_cat(array_of_columns) {
        /* INPUT IS :
        [
            {
                'State': 'Washington',
                '12+95L&&alcohol_use_disorder_in_the_past_year': '283',
                '12+95L&&alcohol_use_in_the_past_month': '3,188',
                '12+95L&&binge_alcohol_use_in_the_past_month': '1,280',
                '12+95L&&cigarette_use_in_the_past_month': '850',
                '12+95L&&cocaine_use_in_the_past_year': '88',
                '12+95L&&first_use_of_marijuana': '64',
            },
            {
                'State': 'Washington',
                '12+95L&&alcohol_use_disorder_in_the_past_year': '283',
                '12+95L&&alcohol_use_in_the_past_month': '3,188',
                '12+95L&&binge_alcohol_use_in_the_past_month': '1,280',
                '12+95L&&cigarette_use_in_the_past_month': '850',
                '12+95L&&cocaine_use_in_the_past_year': '88',
                '12+95L&&first_use_of_marijuana': '64',
            },
            {
                'State': 'Washington',
                '12+95L&&alcohol_use_disorder_in_the_past_year': '283',
                '12+95L&&alcohol_use_in_the_past_month': '3,188',
                '12+95L&&binge_alcohol_use_in_the_past_month': '1,280',
                '12+95L&&cigarette_use_in_the_past_month': '850',
                '12+95L&&cocaine_use_in_the_past_year': '88',
                '12+95L&&first_use_of_marijuana': '64',
            }
        ]
        */

        // creation des blocs par catégories d'age
        const first_block = array_of_columns[0]
        var output_pivot_cat = new Object();
        Object.keys(first_block).forEach(key => {
            if (key.includes("&&")){
                let category = key.split('&&')[0];
                if (!Object.keys(output_pivot_cat).includes(category))
                    output_pivot_cat[category] = new Object();
            }
        });

        //transmission des infos dans chaque catégorie
        Object.values(array_of_columns).forEach(block => {
            
            Object.entries(block).forEach(entry => {
                const [key, value] = entry;
                if (key.includes("&&")){
                    let category = key.split('&&')[0];
                    let drug_label = key.split('&&')[1];
                    output_pivot_cat[category][drug_label] = value;

                    if (!Object.keys(output_pivot_cat).includes(category))
                        output_pivot_cat[category] = new Object();
                }
            });
           
        });
        
        //console.log(Object.values(output_pivot_cat));
        /*
        KEYS ARE:
        in each value, a set of all cateorgies (long labels) with data linked
        [
            '12+95L',      '12+95U',
            '12+Estimate', '12-17-95L',
            '12-17-95U',   '12-17-Estimate',
            '18+95L',      '18+95U',
            '18+Estimate', '18-25-95L',
            '18-25-95U',   '18-25-Estimate',
            '26+95L',      '26+95U',
            '26+Estimate'
          ]
        */
        Object.entries(output_pivot_cat).forEach(entry => {
            var[key, value] = entry
            /* VALUE BEFORE
            {
                alcohol_use_disorder_in_the_past_year: '22',
                alcohol_use_in_the_past_month: '208',
                any_mental_illness_in_the_past_year: '70',
                binge_alcohol_use_in_the_past_month: '91',
                cigarette_use_in_the_past_month: '84',
                cocaine_use_in_the_past_year: '3',
            }
             */
            output_pivot_cat[key] = this.pivot_general_drug(value)

        });
        
        //console.log(Object.entries(output_pivot_cat));
        return output_pivot_cat;

    }

    pivot_general_drug(value) {
        /*
        INPUT : 
        {
            alcohol_use_disorder_in_the_past_year: '22',
            alcohol_use_in_the_past_month: '208',
            any_mental_illness_in_the_past_year: '70',
            binge_alcohol_use_in_the_past_month: '91',
            cigarette_use_in_the_past_month: '84',
            cocaine_use_in_the_past_year: '3',
        }
        */
        var output_general_drugs = new Object();

        const list_drugs = ['alcohol','cigarette','cocaine','marijuana','heroin','illicit_drug','substance','pain_reliever','tobacco_product','depressive','methamphetamine','suicide','mental']
        
        // creating each category from list above : list_drugs
        Object.values(list_drugs).forEach(drug => {
            Object.keys(value).forEach(drug_long_label => {
                if (drug_long_label.includes(drug)){
                    if (!Object.keys(output_general_drugs).includes(drug)){
                        output_general_drugs[drug] = new Object();
                    }
                    output_general_drugs[drug][drug_long_label] = value[drug_long_label];
                }
            });
        });
        //console.log(output_general_drugs);
        /* OUPUT : 
        {
            alcohol: {
              alcohol_use_disorder_in_the_past_year: '22',
              alcohol_use_in_the_past_month: '208',
              binge_alcohol_use_in_the_past_month: '91',
              needing_but_not_receiving_treatment_at_a_specialty_facility_for_alcohol_use_in_the_past_year: '22',
              perceptions_of_great_risk_from_having_five_or_more_drinks_of_an_alcoholic_beverage_once_or_twice_a_week: '162'
            },
            cigarette: {
              cigarette_use_in_the_past_month: '84',
              perceptions_of_great_risk_from_smoking_one_or_more_packs_of_cigarettes_per_day: '252'
            },
            cocaine: {
              cocaine_use_in_the_past_year: '3',
              perceptions_of_great_risk_from_using_cocaine_once_a_month: '285'
            },
            
          }
        */

        return output_general_drugs;
    }

    merge_object_years(object_ann1, object_ann2) {
    /*  const object1 = { 
                'Alabama': {
                    2018: {'a': 'a', 'b': 'b', 'c': 'c'}
                }, 
                'Arkansas': {
                    2018: {'a': 'a', 'b': 'b', 'c': 'c'}
                }, 
                'Miami': {
                    2018: {'a': 'a', 'b': 'b', 'c': 'c'}
                }, 
            };
            
            const object2 = {
                Alabama: {
                    '2016': { 'a': 'a', 'b': 'b', 'c': 'c' },
                    '2017': { 'a': 'a', 'b': 'b', 'c': 'c' }
                },
                Arkansas: {
                    '2016': { 'a': 'a', 'b': 'b', 'c': 'c' },
                    '2017': { 'a': 'a', 'b': 'b', 'c': 'c' }
                },
                Miami: {
                    '2016': { 'a': 'a', 'b': 'b', 'c': 'c' },
                    '2017': { 'a': 'a', 'b': 'b', 'c': 'c' }
                }
                };

            output will be :
            {
            Alabama: {
                    '2016': { a: 'a', b: 'b', c: 'c' },
                    '2017': { a: 'a', b: 'b', c: 'c' },
                    '2018': { a: 'a', b: 'b', c: 'c' }
                },
                Arkansas: {
                    '2016': { a: 'a', b: 'b', c: 'c' },
                    '2017': { a: 'a', b: 'b', c: 'c' },
                    '2018': { a: 'a', b: 'b', c: 'c' }
                },
                Miami: {
                    '2016': { a: 'a', b: 'b', c: 'c' },
                    '2017': { a: 'a', b: 'b', c: 'c' },
                    '2018': { a: 'a', b: 'b', c: 'c' }
                }
            }
        */
        // Création de notre objet à output
        var output_object = new Object();
        // possible copie
        //var output_object =object_ann1;

        Object.entries(object_ann1).forEach(entry_object_1=> {
            const [state, value_object_1] = entry_object_1;
            output_object[state]=new Object;
            //const ann1=Object.keys(values_state_1);

            
            Object.entries(value_object_1).forEach(entry=> {
                const [year, value_year] = entry;
                output_object[state][year]=value_year;
            });

            Object.entries(object_ann2[state]).forEach(entry=> {
                const [year, value_year] = entry;
                output_object[state][year]=value_year;
            });

        });

        return output_object;

    }

    
    
};