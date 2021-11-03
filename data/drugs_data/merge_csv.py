#!/usr/bin/env python
# coding: utf-8

import pandas as pd
import os

repo = 'drugs_2016/'

files = sorted(os.listdir(repo))[1:]

metrics=[]
dict_df={}

for file in files:
    metric=pd.read_csv(repo+file, sep=';', nrows=0).columns[0]
    metric = metric.split(':')[0].split('. ')[1].split(', by')[0]
    metric = metric.lower()
    metric = metric.replace(' ', '_')
    metrics.append(metric)
    
    df = pd.read_csv(repo+file, sep=';', skiprows=1)
    df = df.iloc[:, 2:]

    df = df.rename(columns={                            '12 or Older Estimate':'12+Estimate',                            '12 or Older 95% CI (Lower)':'12+95L',                            '12 or Older 95% CI (Upper)':'12+95U',                            '12-17 Estimate':'12-17-Estimate',                            '12-17 95% CI (Lower)':'12-17-95L',
                            '12-17 95% CI (Upper)':'12-17-95U',\
                            '18-25 Estimate':'18-25-Estimate',\
                            '18-25 95% CI (Lower)':'18-25-95L',
                            '18-25 95% CI (Upper)':'18-25-95U',\
                            '26 or Older Estimate':'26+Estimate',\
                            '26 or Older 95% CI (Lower)':'26+95L',\
                            '26 or Older 95% CI (Upper)':'26+95U',\
                            '18 or Older Estimate':'18+Estimate',\
                            '18 or Older 95% CI (Lower)':'18+95L',\
                            '18 or Older 95% CI (Upper)':'18+95U',\
                            '12 or Older\nEstimate':'12+Estimate',\
                            '12 or Older\n95% CI (Lower)':'12+95L',\
                            '12 or Older\n95% CI (Upper)':'12+95U',\
                            '12-17\nEstimate':'12-17-Estimate',\
                            '12-17\n95% CI (Lower)':'12-17-95L',
                            '12-17\n95% CI (Upper)':'12-17-95U',\
                            '18-25\nEstimate':'18-25-Estimate',\
                            '18-25\n95% CI (Lower)':'18-25-95L',
                            '18-25\n95% CI (Upper)':'18-25-95U',\
                            '26 or Older\nEstimate':'26+Estimate',\
                            '26 or Older\n95% CI (Lower)':'26+95L',\
                            '26 or Older\n95% CI (Upper)':'26+95U',\
                            '18 or Older\nEstimate':'18+Estimate',\
                            '18 or Older\n95% CI (Lower)':'18+95L',\
                            '18 or Older\n95% CI (Upper)':'18+95U',\
                            })
    
    dict_df[metric]=df

multi_df = pd.concat(dict_df.values(), axis=1, keys=dict_df.keys())

a = pd.read_csv(repo+files[0], sep=';', skiprows=1)
a = pd.DataFrame(a.loc[:, 'State'])
a = a['State'].to_list()

multi_df.insert(1, "State", a, True)

multi_df=multi_df.set_index('State')

multi_df.columns = multi_df.columns.swaplevel(0, 1)
multi_df.sort_index(axis=1, level=0, inplace=True)

multi_df.to_csv('drugs_2016.csv')