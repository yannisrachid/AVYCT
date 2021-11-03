# Récupération et formatage des données CSV

Pour les données concernant les chiffres liés à la drogue aux États-Unis, nous avons récupéré des fichiers zip l’aide de l’URL suivante : https://www.samhsa.gov/data/data-we-collect/nsduh-national-survey-drug-use-and-health

Chaque fichier zip correspond à une année et contient des fichiers au format « .csv » où chaque fichier contient les chiffres pour une métrique donnée (par exemple : le nombre de personnes dépendantes à l’alcool).

À l’aide du script merge_csv.py, on fusionne tous les fichiers « .csv » contenus dans le fichier « .zip » afin d’obtenir un seul et même fichier « .csv » correspondant à une seule année. Ce script permet également de nettoyer les données afin qu’elles soient au format requis pour notre API. En effet, nous avons simplifié l’écriture des métriques et regrouper les données sous forme d’un DataFrame multi-index avec un regroupant par tranche d’âge puis par métrique.

Les fichiers « .csv » par année, résultats de notre traitement, sont répertoriés dans le dossier drugs_data.
