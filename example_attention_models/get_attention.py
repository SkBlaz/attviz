import torch
import pandas as pd
import tqdm
from pytorch_transformers import *
import argparse
import json
import numpy as np
parser = argparse.ArgumentParser()
parser.add_argument("--input_sentence",default="NA")
args = parser.parse_args()

weights = "/home/blazs/GPU_CLUSTER_FIRST/autubow/transformers/tmp/bert-base-uncased/bbc_3.0_512"

#weights = "/home/blazs/GPU_CLUSTER_FIRST/autubow/transformers/tmp/bert-large-uncased/hatespeech_3.0_512"

#weights = "/home/blazs/GPU_CLUSTER_FIRST/autubow/transformers/tmp/bert-large-uncased/insults_3.0_512"

## "bert-base-uncased"
model = BertForSequenceClassification.from_pretrained(weights,
                                                      output_hidden_states=True,
                                                      output_attentions=True)

tokenizer = BertTokenizer.from_pretrained("bert-large-uncased")
sentences_df = pd.read_csv("test_bbc.tsv", sep = "\t")#.iloc[0:50,:]
sentences = [x.replace("\n","") for x in sentences_df['text_a'].values.tolist()]
labels = sentences_df.label.tolist()

print("Model loaded successfully!")
def softmax(x):
    return torch.exp(x)/torch.sum(torch.exp(x), dim=1).view(-1,1)

out_object = []
num_attention_heads = 16
names = ['business','entertainment','politics','sport','tech']

for enx1k, text1 in tqdm.tqdm(enumerate(sentences)):

    if enx1k > 100:
        break
    for text in text1.split("|||"):
        correct_label = labels[enx1k]
        encoded_text = tokenizer.encode(text)
        tokens = tokenizer.convert_ids_to_tokens(encoded_text)
        text = " ".join(tokens)
        input_ids = torch.tensor([encoded_text])
        otpt = softmax(model(input_ids)[0]).detach().numpy()

        ## only show correctly classified ones in this example
        if np.argmax(otpt) != correct_label:
            continue

        acts = otpt.tolist()[0]
        acts_zip = list(zip(acts, names))
        all_hidden_states, all_attentions = model(input_ids)[-2:]
        overall_diags = []
        overall_self_attentions = []

        for enx in range(num_attention_heads):
            try:
                attention_matrix = all_attentions[enx]
                attention_matrix = attention_matrix.detach().numpy()[:,enx,:,:]
                shx = attention_matrix.shape[1]
                attention_matrix = attention_matrix.reshape(shx,shx)
                self_attentions = np.diagonal(attention_matrix).flatten()
                overall_diags.append(self_attentions)

            except Exception as es:
                pass

            sats = [str(x) for x in self_attentions.tolist()[0:len(tokens)]]
            overall_self_attentions.append((enx,sats))
        overall_attentions = [str(x) for x in np.mean(overall_diags, axis= 0).tolist()]
        targets = [str(x) for x in acts]

        temp_obj = {}
        temp_obj['text'] = text
        temp_obj['sets'] = [{}]
        temp_obj['sets'][0]['attention_vectors'] = [{"name": x[0], "vectors": x[1]} for x in overall_self_attentions] # tukaj lahko dodaš še npr. color
        temp_obj['sets'][0]['tokens'] = tokens
        temp_obj['output_activations'] = [{"value": str(x),"name":y} for x, y in acts_zip]

        out_object.append(temp_obj)

to_remove = []

for el in range(len(out_object)):
    if len(out_object[el]) == 0:
        to_remove.append(el)

to_remove = sorted(to_remove, reverse=True)

for tr in to_remove:
    del out_object[tr]

with open('generated_outputs/example2.json', 'w') as fp:
    json.dump(out_object, fp)
