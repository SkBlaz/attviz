"""
Summarization of tokens based on attention values - qualitative!
"""
import json
import glob
import scipy.stats as stats
import numpy as np
import pandas as pd
from collections import defaultdict
import seaborn as sns
import matplotlib.pyplot as plt
import argparse
sns.set_palette("Set2")
from wordcloud import WordCloud
import matplotlib.pyplot as plt
from matplotlib import rc, font_manager
import glob

font_size = 8
font_properties = {'family': 'serif', 'serif': ['Computer Modern Roman'],
                   'weight': 'normal', 'size': font_size}

font_manager.FontProperties(family='Computer Modern Roman', style='normal',
                            size=font_size, weight='normal', stretch='normal')
rc('text', usetex=False)
rc('font', **font_properties)
sns.set_style("white")

# parser = argparse.ArgumentParser()
# parser.add_argument("--input_json",default="generated_json_inputs/example_bbc_explanations.json")
# args = parser.parse_args()


# input_json = args.input_json
top_k = 35

# all_inputs = ["generated_json_inputs/positive.json",
#               "generated_json_inputs/negative.json",
#               "generated_json_inputs/neutral.json"]

all_inputs = glob.glob("generated_json_inputs/*")
#names = ["Positive","Negative","Neutral"]

names = [x.split("/")[-1].replace(".json","") for x in all_inputs]
first_dataframe = []

for input_json, fname in zip(all_inputs, names):

    head_instances = []
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
            vid = 0
            for el2 in attention_vectors:
                vid+=1
                vecs = el2['vectors']
                hname = el2['name']
                vecs = [float(x) for x in vecs]
                assert len(vecs) == len(token_space)
                for a,b in zip(token_space, vecs):
                    if "[CLS]" in a:
                        continue
                    if "[SEP]" in a:
                        continue
                    dobj[a].append(b)
                    head_row = [a, b, hname]
                    head_instances.append(head_row)

    for token, attention_values in dobj.items():

        out_object = {}
        out_object['token'] = token
        out_object['mean-att'] = np.mean(attention_values)
        out_object['max-att'] = np.max(attention_values)
        out_object['min-att'] = np.min(attention_values)
        out_object['std-att'] = np.std(attention_values)
        out_object['dataset'] = fname
        first_dataframe.append(out_object)

    ## analyse headspace
    head_df = pd.DataFrame(head_instances)
    head_df.columns = ['token','attention','head']

#     fig = plt.figure(figsize = (6,7))
#     fig.subplots_adjust(hspace=0.2, wspace=0.2)
#     for i in range(1, 11):
#         print(f"wc, head {i} {fname}")
#         ax = fig.add_subplot(4, 3, i)
#         shead_df = head_df[head_df['head'] == i]
#         tokenspace = shead_df['token'].values
#         attention_space = shead_df['attention'].values
#         vx = np.argsort(attention_space)[::-1][0:int(len(attention_space)/3)]
#         tokenspace = tokenspace[vx]
#         if len(tokenspace) > 0:
#             text = " ".join(tokenspace)
#             wordcloud = WordCloud(width = 3000, height = 2000, random_state=1, background_color='white', colormap='coolwarm_r', collocations=False).generate(text)
#             plt.title("Head {}".format(i))
#             plt.imshow(wordcloud) 
#             plt.axis("off")
#     plt.tight_layout()
#     plt.savefig("figures/multihead_{}.png".format(fname), dpi = 300)
# #    plt.show()
#     plt.clf()
        
## plot
first_df = pd.DataFrame(first_dataframe)
for fname in names:

    first_subset = first_df[first_df['dataset'] == fname]
    first_subset = first_subset.sort_values(by = ["mean-att"], ascending=False)
    first_subset = first_subset.iloc[0:top_k]
    sns.barplot(first_subset['mean-att'], first_subset.token, palette = "coolwarm_r", yerr = first_subset['std-att'])
    sns.barplot(first_subset['max-att'], first_subset.token, palette = "coolwarm_r", alpha = 0.3)
    plt.xlabel("Mean attention value (max in the background)")
    plt.ylabel("Top tokens")
    plt.xticks(rotation=90)
    plt.tight_layout()
    plt.savefig("figures/{}.png".format(fname), dpi = 300)
    plt.clf()

first_df['max-att'] = first_df['max-att'].transform(lambda x: np.log(x))
first_df['mean-att'] = first_df['mean-att'].transform(lambda x: np.log(x))
first_df['min-att'] = first_df['min-att'].transform(lambda x: np.log(x))

## max dist
for fname in names:
    subset = first_df[first_df['dataset'] == fname]
    sns.distplot(subset['max-att'],label = fname)
    plt.legend()
    plt.xlabel("Attention value (log)")
    plt.ylabel("Density")
    plt.tight_layout()
    plt.savefig("figures/max_dist{}.png".format(fname), dpi = 300)
    plt.clf()

## mean dist
for fname in names:
    subset = first_df[first_df['dataset'] == fname]
    sns.distplot(subset['mean-att'],label = fname)
    plt.legend()
    plt.xlabel("Attention value (log)")
    plt.ylabel("Density")
    plt.tight_layout()
    plt.savefig("figures/mean_dist{}.png".format(fname), dpi = 300)
    plt.clf()

## statistical analysis
for fname in names:
    subset = first_df[first_df['dataset'] == fname]
    sns.distplot(subset['min-att'],label = fname)
    plt.legend()
    plt.xlabel("Attention value (log)")
    plt.ylabel("Density")
    plt.tight_layout()
    plt.savefig("figures/min_dist{}.png".format(fname), dpi = 300)
    plt.clf()

    stats.probplot(first_df['max-att'], dist="norm", plot=sns.mpl.pyplot)
    plt.tight_layout()
    plt.savefig("figures/maxqq{}.png".format(fname), dpi = 300)
    plt.clf()

    stats.probplot(first_df['min-att'], dist="norm", plot=sns.mpl.pyplot)
    plt.tight_layout()
    plt.savefig("figures/minqq{}.png".format(fname), dpi = 300)
    plt.clf()

    stats.probplot(first_df['mean-att'], dist="norm", plot=sns.mpl.pyplot)
    plt.tight_layout()
    plt.savefig("figures/meanqq{}.png".format(fname), dpi = 300)
    plt.clf()
