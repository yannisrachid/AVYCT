  # Bills and Pills
*Projet Open Data*

Notre projet est de créer une API (en Node.js) permettant de récolter des données sur la consommation de drogues et les salaires moyens aux États-unis, de l'année 2013 jusqu'à 2019. Les données ont été récoltées sur le site du [Bureau of Economic Analysis](https://www.bea.gov/) ainsi que sur le site des [Substance Abuse and Mental Health Service Administration (SAMHSA)](https://www.samhsa.gov/).

<!-- Une partie de l'équipe s'est penché sur le reformatage des données, tandis que les autres ont commencé la construction de l'API.  -->

# RDF

# API
Il est possible d'obtenir deux types de données différentes, en passant par les chemins suivants :
- wages : les salaires moyens
- drugs : la consommation de drogues estimée
- all : permet d'obtenir le croisement des deux types de données

Nous allons voir plus en détail comment manipuler l'API et appliquer des filtres aux requêtes.

Pour tout type de requête il est possible de choisir le format des données renvoyées. Il suffit d'ajouter dans la requête un attribut *type* suivant le type de format voulu, parmis XML, JSON et RDF. Si aucun type n'est spécifié les données seront envoyées dans le format JSON.

## Wages 
Si aucun filtre n'est demandé, l'API renvoie les salaires moyens de tous les États-Unis, ainsi que les salaires moyens pour chaque partie du pays (Nord, Sud, ...).

Filtres :
- year : applique un filtre sur les années spécifiées
  - "20XX" : pour obtenir sur une année
  - "20XX-20XX" : pour obtenir une plage d'années
  - "20XX,20XX" : pour obtenir des années spécifiques
- state : applique un filtre sur les états voulus, pour obtenir plusieurs états il faut les séparer par une virgule, si aucun état n'est spécifié une valeur pour la globalité des états-unis est donnée, si la valeur *all* est donnée un résultat pour chaque état est rendu
- quarters : applique un filtre sur les trimestre spécifiés, pour obtenir plusieurs trimestres il faut les séparer par une virgule -parmis : [Q1, Q2, Q3, Q4]-
  - "QX" : pour obtenir un trimestre
  - "QX-QX" : pour obtenir une plage de trimestres
  - "QX,QX" : pour obtenir des trimestres spécifiques
- metric : pour obtenir seulement les métriques spécifiées, pour obtenir plusieurs métriques il faut les séparer par une virgule -parmis : [personal_income, population, per_capita_personal_income]-

__Exemple :__

```
/wages?year=2015,2017&state=Washington,California&quarters=Q3
```
Renvoie :
```json
{
    "Washington": {
        "2015": {
            "Q1": {
                "personal_income": "375275.0",
                "population": "7127237",
                "per_capita_personal_income": "52654"
            },
            "Q2": {
                "personal_income": "379570.6",
                "population": "7153455",
                "per_capita_personal_income": "53061"
            },
            "Q3": {
                "personal_income": "383645.8",
                "population": "7184839",
                "per_capita_personal_income": "53397"
            },
            "Q4": {
                "personal_income": "386140.9",
                "population": "7218992",
                "per_capita_personal_income": "53490"
            }
        },
        "2017": {
            "Q1": {
                "personal_income": "419580.3",
                "population": "7380986",
                "per_capita_personal_income": "56846"
            },
            "Q2": {
                "personal_income": "423413.0",
                "population": "7411604",
                "per_capita_personal_income": "57128"
            },
            "Q3": {
                "personal_income": "427814.4",
                "population": "7441358",
                "per_capita_personal_income": "57491"
            },
            "Q4": {
                "personal_income": "434326.2",
                "population": "7467379",
                "per_capita_personal_income": "58163"
            }
        }
    },
    "California": {
        "2015": {
            "Q1": {
                "personal_income": "2084189.7",
                "population": "38793917",
                "per_capita_personal_income": "53725"
            },
            "Q2": {
                "personal_income": "2117632.1",
                "population": "38865317",
                "per_capita_personal_income": "54486"
            },
            "Q3": {
                "personal_income": "2138781.8",
                "population": "38940551",
                "per_capita_personal_income": "54924"
            },
            "Q4": {
                "personal_income": "2161117.7",
                "population": "39008270",
                "per_capita_personal_income": "55402"
            }
        },
        "2017": {
            "Q1": {
                "personal_income": "2288241.5",
                "population": "39275811",
                "per_capita_personal_income": "58261"
            },
            "Q2": {
                "personal_income": "2306107.8",
                "population": "39313978",
                "per_capita_personal_income": "58659"
            },
            "Q3": {
                "personal_income": "2325376.1",
                "population": "39356311",
                "per_capita_personal_income": "59085"
            },
            "Q4": {
                "personal_income": "2354852.3",
                "population": "39389401",
                "per_capita_personal_income": "59784"
            }
        }
    }
}
```

## Drugs 
Si aucun filtre n'est demandé, l'API renvoie une estimation de l'utilisation de drogues ainsi qu'un pourcentage, pour différentes tranches d'âge dans tous les États-Unis.

Filtres :
- year : applique un filtre sur les années spécifiées
  - "20XX" : pour obtenir sur une année
  - "20XX-20XX" : pour obtenir une plage d'années
  - "20XX,20XX" : pour obtenir des années spécifiques
- state : applique un filtre sur les états voulus, pour obtenir plusieurs états il faut les séparer par une virgule, si la valeur *all* est donnée un résultat pour chaque état est rendu
- estimate : false pour obtenir les intervalles de confiance, true pour obtenir une estimation, si rien n'est spécifié les deux sont retournés
- age : pour obtenir seulement certaines catégories d'âges -parmis [12-17, 18-25, 26+, 12+, 18+]-
- drug : pour obtenir seulement les colonnes concernant une drogue en particulier, pour plusieurs drogues il faut les séparer par une virgule -parmis : [alcohol, cigarette, cocaine, marijuana, heroin, illicit_drug, substance, pain_reliever, tobacco_product, depressive, methamphetamine, suicide, mental]-
- metric : pour obtenir seulement les métriques spécifiées, pour obtenir plusieurs métriques il faut les séparer par une virgule -parmis : [personal_income, population, per_capita_personal_income]-


__Exemple :__
```
/drugs?year=2016&state=California,Washington&drug=marijuana&age=12-17,26+&estimate=true
```
Renvoie :
```json
{
    "California": {
        "2016": {
            "12-17-Estimate": {
                "marijuana": {
                    "first_use_of_marijuana": "150",
                    "illicit_drug_use_other_than_marijuana_in_the_past_month": "81",
                    "marijuana_use_in_the_past_month": "223",
                    "marijuana_use_in_the_past_year": "402",
                    "perceptions_of_great_risk_from_smoking_marijuana_once_a_month": "723"
                }
            },
            "26+Estimate": {
                "marijuana": {
                    "first_use_of_marijuana": "66",
                    "illicit_drug_use_other_than_marijuana_in_the_past_month": "859",
                    "marijuana_use_in_the_past_month": "2,190",
                    "marijuana_use_in_the_past_year": "3,399",
                    "perceptions_of_great_risk_from_smoking_marijuana_once_a_month": "8,239"
                }
            }
        }
    },
    "Washington": {
        "2016": {
            "12-17-Estimate": {
                "marijuana": {
                    "first_use_of_marijuana": "26",
                    "illicit_drug_use_other_than_marijuana_in_the_past_month": "14",
                    "marijuana_use_in_the_past_month": "42",
                    "marijuana_use_in_the_past_year": "72",
                    "perceptions_of_great_risk_from_smoking_marijuana_once_a_month": "98"
                }
            },
            "26+Estimate": {
                "marijuana": {
                    "first_use_of_marijuana": "18",
                    "illicit_drug_use_other_than_marijuana_in_the_past_month": "148",
                    "marijuana_use_in_the_past_month": "508",
                    "marijuana_use_in_the_past_year": "784",
                    "perceptions_of_great_risk_from_smoking_marijuana_once_a_month": "963"
                }
            }
        }
    }
}
```
## All

Filtres :
- year : applique un filtre sur les années spécifiées
  - "20XX" : pour obtenir sur une année
  - "20XX-20XX" : pour obtenir une plage d'années
  - "20XX,20XX" : pour obtenir des années spécifiques
- state : applique un filtre sur les états voulus, pour obtenir plusieurs états il faut les séparer par une virgule, si la valeur *all* est donnée un résultat pour chaque état est rendu
- quarters : pour obtenir seulement les trimestres spécifiés, pour obtenir plusieurs trimestres il faut les séparer par une virgule -parmis : [Q1, Q2, Q3, Q4]-
  - "QX" : pour obtenir un trimestre
  - "QX-QX" : pour obtenir une plage de trimestres
  - "QX,QX" : pour obtenir des trimestres spécifiques
- estimate : false pour obtenir les pourcentages, true pour obtenir une estimation, si rien n'est spécifié les deux sont retournés
- age : pour obtenir seulement certaines catégories d'âges -parmis [12-17, 18-25, 26+, 12+, 18+]-
- drug : pour obtenir seulement les colonnes concernant une drogue en particulier, pour plusieurs drogues il faut les séparer par une virgule -parmis : [Marijuana, Cocaine, Heroin, PainReliever, Alcohol, Tobacco, Illicit, Mental, Suicide]-

__Exemple :__

La requête :
```
/all?year=2015,2018&state=California&age=26+&drug=heroin,cocaine&quarter=Q2-Q4
```
Renvoie :
```json
{
    "California": {
        "2015": {
            "wages": {
                "Q2": {
                    "personal_income": "2117632.1",
                    "population": "38865317",
                    "per_capita_personal_income": "54486"
                },
                "Q3": {
                    "personal_income": "2138781.8",
                    "population": "38940551",
                    "per_capita_personal_income": "54924"
                },
                "Q4": {
                    "personal_income": "2161117.7",
                    "population": "39008270",
                    "per_capita_personal_income": "55402"
                }
            },
            "drugs": {
                "26+Estimate": {
                    "heroin": {
                        "heroin_use_in_the_past_year": "37"
                    },
                    "cocaine": {
                        "cocaine_use_in_the_past_year": "407"
                    }
                },
                "26+95L": {
                    "heroin": {
                        "heroin_use_in_the_past_year": "19"
                    },
                    "cocaine": {
                        "cocaine_use_in_the_past_year": "328"
                    }
                },
                "26+95U": {
                    "heroin": {
                        "heroin_use_in_the_past_year": "73"
                    },
                    "cocaine": {
                        "cocaine_use_in_the_past_year": "504"
                    }
                }
            }
        },
        "2018": {
            "wages": {
                "Q2": {
                    "personal_income": "2419125.1",
                    "population": "39424643",
                    "per_capita_personal_income": "61361"
                },
                "Q3": {
                    "personal_income": "2449911.3",
                    "population": "39443390",
                    "per_capita_personal_income": "62112"
                },
                "Q4": {
                    "personal_income": "2470501.2",
                    "population": "39450951",
                    "per_capita_personal_income": "62622"
                }
            },
            "drugs": {
                "26+Estimate": {
                    "heroin": {
                        "heroin_use_in_the_past_year": "47",
                        "perceptions_of_great_risk_from_trying_heroin_once_or_twice": "22,222"
                    },
                    "cocaine": {
                        "cocaine_use_in_the_past_year": "585",
                        "perceptions_of_great_risk_from_using_cocaine_once_a_month": "17,861"
                    }
                },
                "26+95L": {
                    "heroin": {
                        "heroin_use_in_the_past_year": "25",
                        "perceptions_of_great_risk_from_trying_heroin_once_or_twice": "21,922"
                    },
                    "cocaine": {
                        "cocaine_use_in_the_past_year": "491",
                        "perceptions_of_great_risk_from_using_cocaine_once_a_month": "17,471"
                    }
                },
                "26+95U": {
                    "heroin": {
                        "heroin_use_in_the_past_year": "89",
                        "perceptions_of_great_risk_from_trying_heroin_once_or_twice": "22,502"
                    },
                    "cocaine": {
                        "cocaine_use_in_the_past_year": "697",
                        "perceptions_of_great_risk_from_using_cocaine_once_a_month": "18,241"
                    }
                }
            }
        }
    }
}
```
