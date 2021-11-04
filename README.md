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
- type : le type des données -parmis : [XML, JSON]-

__Exemple :__

```
/wages?year=2015,2017&state=WA,CA&quarters=Q3
```
Renvoie :
```json
{
  "Washington" : {
    "2015" : {
      "Q3" : {
        "Personal income (millions of dollars, seasonally adjusted)" : "383645.8",
        "Population (midperiod, persons) 1/" : "7184839",
        "Per capita personal income (dollars) 2/" : "53397"
      }
    },
    "2017" : {
      "Q3" : {
        "Personal income (millions of dollars, seasonally adjusted)" : "383645.8",
        "Population (midperiod, persons) 1/" : "7184839",
        "Per capita personal income (dollars) 2/" : "53397"
      }
    }
  },
  "California" : {
    "2015" : {
      "Q3" : {
        "Personal income (millions of dollars, seasonally adjusted)" : "383645.8",
        "Population (midperiod, persons) 1/" : "7184839",
        "Per capita personal income (dollars) 2/" : "53397"
      }
    },
    "2017" : {
      "Q3" : {
        "Personal income (millions of dollars, seasonally adjusted)" : "383645.8",
        "Population (midperiod, persons) 1/" : "7184839",
        "Per capita personal income (dollars) 2/" : "53397"
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
- demographic : pour obtenir seulement certaines catégories d'âges -parmis [12-17, 18-25, 26+, 12+, 18+]-
- drugs : pour obtenir seulement les colonnes concernant une drogue en particulier, pour plusieurs drogues il faut les séparer par une virgule -parmis : [Marijuana, Cocaine, Heroin, PainReliever, Alcohol, Tobacco, Illicit, Mental, Suicide]-
- metric : pour obtenir seulement les métriques spécifiées, pour obtenir plusieurs métriques il faut les séparer par une virgule -parmis : [personal_income, population, per_capita_personal_income]-
- type : le type des données -parmis : [XML, JSON]-


__Exemple :__
```
/drugs?year=2016&state=California,Washington&drugs=marijuana&demographic=12-17,26+&estimate=true
```
Renvoie :
```json
{
  "California" : {
    "2016" : {
      "12-17-Estimate" : {
        "Marijuana" : {
          "First Use of Marijuana, by Age Group and State" : 150,
          "Marijuana Use in the Past Month, by Age Group and State" : 223,
          "Marijuana Use in the Past Year, by Age Group and State" : 402,
          .
          .
          .
        }
      },
      "26+Estimate" : {
        "Marijuana" : {
          "First Use of Marijuana, by Age Group and State" : 66,
          "Marijuana Use in the Past Month, by Age Group and State" : 2190,
          "Marijuana Use in the Past Year, by Age Group and State" : 3399,
          .
          .
          .
        }
      }
    }
  },
  "Washington" : {
    "2016" : {
      "12-17-Estimate" : {
        "Marijuana" : {
          "First Use of Marijuana, by Age Group and State" : 150,
          "Marijuana Use in the Past Month, by Age Group and State" : 223,
          "Marijuana Use in the Past Year, by Age Group and State" : 402,
          .
          .
          .
        }
      },
      "26+Estimate" : {
        "Marijuana" : {
          "First Use of Marijuana, by Age Group and State" : 66,
          "Marijuana Use in the Past Month, by Age Group and State" : 2190,
          "Marijuana Use in the Past Year, by Age Group and State" : 3399,
          .
          .
          .
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
- demographic : pour obtenir seulement certaines catégories d'âges -parmis [12-17, 18-25, 26+, 12+, 18+]-
- drugs : pour obtenir seulement les colonnes concernant une drogue en particulier, pour plusieurs drogues il faut les séparer par une virgule -parmis : [Marijuana, Cocaine, Heroin, PainReliever, Alcohol, Tobacco, Illicit, Mental, Suicide]-
- type : le type des données -parmis : [XML, JSON]-

__Exemple :__

La requête :
```
/get?year=2015,2016&state=California&demographic=26+
```
Renvoie :
```json
{
  "California" : {
    "2015" : {
      "Wages" : {
        "Q1" : {
          "Personal income (millions of dollars, seasonally adjusted)" : "383645.8",
          "Population (midperiod, persons) 1/" : "7184839",
          "Per capita personal income (dollars) 2/" : "53397"
        },
        "Q2" : {
          "Personal income (millions of dollars, seasonally adjusted)" : "383645.8",
          "Population (midperiod, persons) 1/" : "7184839",
          "Per capita personal income (dollars) 2/" : "53397"
        },
        "Q3" : {
          "Personal income (millions of dollars, seasonally adjusted)" : "383645.8",
          "Population (midperiod, persons) 1/" : "7184839",
          "Per capita personal income (dollars) 2/" : "53397"
        },
        "Q4" : {
          "Personal income (millions of dollars, seasonally adjusted)" : "383645.8",
          "Population (midperiod, persons) 1/" : "7184839",
          "Per capita personal income (dollars) 2/" : "53397"
        }
      },
      "Drugs" : {
        "26+Estimate" : {
          "Marijuana" : {
            "First Use of Marijuana, by Age Group and State" : 66,
            "Marijuana Use in the Past Month, by Age Group and State" : 2190,
            "Marijuana Use in the Past Year, by Age Group and State" : 3399,
            .
            .
            .
          }
        }
      }
    },
    "2016" : {
      "Wages" : {
        "Q1" : {
          "Personal income (millions of dollars, seasonally adjusted)" : "383645.8",
          "Population (midperiod, persons) 1/" : "7184839",
          "Per capita personal income (dollars) 2/" : "53397"
        },
        "Q2" : {
          "Personal income (millions of dollars, seasonally adjusted)" : "383645.8",
          "Population (midperiod, persons) 1/" : "7184839",
          "Per capita personal income (dollars) 2/" : "53397"
        },
        "Q3" : {
          "Personal income (millions of dollars, seasonally adjusted)" : "383645.8",
          "Population (midperiod, persons) 1/" : "7184839",
          "Per capita personal income (dollars) 2/" : "53397"
        },
        "Q4" : {
          "Personal income (millions of dollars, seasonally adjusted)" : "383645.8",
          "Population (midperiod, persons) 1/" : "7184839",
          "Per capita personal income (dollars) 2/" : "53397"
        }
      },
      "Drugs" : {
        "26+Estimate" : {
          "Marijuana" : {
            "First Use of Marijuana, by Age Group and State" : 66,
            "Marijuana Use in the Past Month, by Age Group and State" : 2190,
            "Marijuana Use in the Past Year, by Age Group and State" : 3399,
            .
            .
            .
          }
        }
      }
    }
  }
}
```
