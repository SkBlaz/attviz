"""
Summarization of tokens based on attention values - qualitative!
"""
import json
import scipy.stats as stats
import numpy as np
import pandas as pd
from collections import defaultdict
import seaborn as sns
import matplotlib.pyplot as plt
import argparse
sns.set_palette("Set2")

parser = argparse.ArgumentParser()
parser.add_argument("--input_json",default="generated_json_inputs/example_bbc_explanations.json")
args = parser.parse_args()


input_json = args.input_json
top_k = 15

all_inputs = ["generated_json_inputs/positive.json",
              "generated_json_inputs/negative.json",
              "generated_json_inputs/neutral.json"]

names = ["Positive","Negative","Neutral"]
first_dataframe = []
for input_json, fname in zip(all_inputs, names):
    ## construct
    fx = open(input_json,"rt")
    json_file = eval(fx.read())
    fx.close()
    dobj = defaultdict(list)
    for head in json_file:
        text = head['text']
        sets = head['sets']
        for el in sets:
            attention_vectors = el['attention_vectors']
            token_space = el['tokens']
            for el2 in attention_vectors:
                vecs = el2['vectors']
                vecs = [float(x) for x in vecs]
                assert len(vecs) == len(token_space)
                for a,b in zip(token_space, vecs):
                    if "[CLS]" in a:
                        continue
                    if "[SEP]" in a:
                        continue
                    dobj[a].append(b)

    for token, attention_values in dobj.items():
        out_object = {}
        out_object['token'] = token
        out_object['mean-att'] = np.mean(attention_values)
        out_object['max-att'] = np.max(attention_values)
        out_object['min-att'] = np.min(attention_values)
        out_object['std-att'] = np.std(attention_values)
        out_object['dataset'] = fname
        first_dataframe.append(out_object)

## plot
first_df = pd.DataFrame(first_dataframe)
for fname in names:

    first_subset = first_df[first_df['dataset'] == fname]
    first_subset = first_subset.sort_values(by = ["mean-att"], ascending=False)
    first_subset = first_subset.iloc[0:top_k]
    sns.barplot(first_subset.token,first_subset['mean-att'],palette = "coolwarm_r", yerr = first_subset['std-att'])
    sns.barplot(first_subset.token,first_subset['max-att'],palette = "coolwarm_r", alpha = 0.3)
    plt.ylabel("Mean attention value (max in the background)")
    plt.xlabel("Top tokens")
    plt.xticks(rotation=90)
    plt.tight_layout()
    plt.savefig("figures/{}.png".format(fname), dpi = 300)
    plt.clf()

first_df['max-att'] = first_df['max-att'].transform(lambda x: np.log(x))
first_df['mean-att'] = first_df['mean-att'].transform(lambda x: np.log(x))
first_df['min-att'] = first_df['min-att'].transform(lambda x: np.log(x))
    
for fname in names:
    subset = first_df[first_df['dataset'] == fname]
    sns.distplot(subset['max-att'],label = fname)
plt.legend()
plt.xlabel("Attention value")
plt.ylabel("Density")
plt.tight_layout()
plt.savefig("figures/max_dist.png".format(fname), dpi = 300)
plt.clf()

for fname in names:
    subset = first_df[first_df['dataset'] == fname]
    sns.distplot(subset['mean-att'],label = fname)
plt.legend()
plt.xlabel("Attention value")
plt.ylabel("Density")
plt.tight_layout()
plt.savefig("figures/mean_dist.png".format(fname), dpi = 300)
plt.clf()

for fname in names:
    subset = first_df[first_df['dataset'] == fname]
    sns.distplot(subset['min-att'],label = fname)
plt.legend()
plt.xlabel("Attention value")
plt.ylabel("Density")
plt.tight_layout()
plt.savefig("figures/min_dist.png".format(fname), dpi = 300)
plt.clf()

stats.probplot(first_df['max-att'], dist="norm", plot=sns.mpl.pyplot)
plt.tight_layout()
plt.savefig("figures/maxqq.png".format(fname), dpi = 300)
plt.clf()

stats.probplot(first_df['min-att'], dist="norm", plot=sns.mpl.pyplot)
plt.tight_layout()
plt.savefig("figures/minqq.png".format(fname), dpi = 300)
plt.clf()

stats.probplot(first_df['mean-att'], dist="norm", plot=sns.mpl.pyplot)
plt.tight_layout()
plt.savefig("figures/meanqq.png".format(fname), dpi = 300)
plt.clf()
