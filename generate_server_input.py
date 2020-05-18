## a simple command line tool that outputs jsons based on a trained HuggingFace model.
## Skrlj and Erzen, 2020

import torch
import pandas as pd
import tqdm
from pytorch_transformers import *
import argparse
import json
import numpy as np
from simpletransformers.classification import ClassificationModel


def softmax(x):
    return torch.exp(x)/torch.sum(torch.exp(x), dim=1).view(-1,1)

def get_json_from_weights(model,
                          tokenizer,
                          test_data="test_bbc.tsv",
                          delimiter = "\t",
                          text_field = "text_a",
                          label_field = "label",
                          number_of_attention_heads = 16,
                          label_names = ['business','entertainment','politics','sport'],
                          segment_delimiter = "|||",
                          verbose = True,
                          subsample = True):

    """
    A wrapper method that loads a pretrained model and extract the relevant attention matrics into a single JSON, suitable for AttViz exploration.

    :param model: A pytorch language model
    :param tokenizer: The corresponding tokenizer
    :param test_data: Data where explanations are to be made
    :param delimiter: delimiter between the test columns
    :param text_field: the field with text
    :param label_field: the field with a label
    :param number_of_attention_heads: The first k attention heads to consider
    :param label_names: Names of class labels
    :param segment_delimiter: If more docs per instance, this is relevant for e.g., twitter profiling tasks.
    :param verbose: Verbosity level (1,0)
    :param subsample: Take every tenth instance, for prototyping.

    """

    sentences_df = pd.read_csv(test_data, sep = delimiter)
    sentences = [x.replace("\n","") for x in sentences_df[text_field].values.tolist()]
    labels = sentences_df[label_field].tolist()
    out_object = []
    num_attention_heads = number_of_attention_heads
    names = label_names
    for enx1k, text1 in tqdm.tqdm(enumerate(sentences)):
        if subsample:
            if enx1k %10 == 0:
                pass
            else:
                continue
        for text in text1.split(segment_delimiter):
            correct_label = labels[enx1k]
            encoded_text = tokenizer.encode(text)
            tokens = tokenizer.convert_ids_to_tokens(encoded_text)
            text = " ".join(tokens)
            input_ids = torch.tensor([encoded_text])
            try:
                otpt = softmax(model(input_ids)[0]).detach().numpy()
            except:
                print("No output possible for:\n {}".format(text))
                continue
            if np.argmax(otpt) != correct_label:
                continue
            acts = otpt.tolist()[0]
            acts_zip = list(zip(acts, names))
            all_hidden_states, all_attentions = model(input_ids)[-2:]
            overall_diags = []
            overall_self_attentions = []
            for enx in range(num_attention_heads-1):
                try:
                    attention_matrix = all_attentions[enx]
                    attention_matrix = attention_matrix.detach().numpy()[:,enx,:,:]
                    shx = attention_matrix.shape[1]
                    attention_matrix = attention_matrix.reshape(shx,shx)
                    self_attentions = np.diagonal(attention_matrix).flatten()
                    overall_diags.append(self_attentions)
                    #print("Stored an att vector {}.".format(enx))
                    
                except Exception as es:
                    print("Index  {} out of range.".format(enx))

                sats = [str(x) for x in self_attentions.tolist()[0:len(tokens)]]
                overall_self_attentions.append((enx,sats))
            overall_attentions = [str(x) for x in np.mean(overall_diags, axis= 0).tolist()]
            # targets = [str(x) for x in acts]
            temp_obj = {}
            temp_obj['text'] = text
            temp_obj['sets'] = [{}]
            temp_obj['sets'][0]['attention_vectors'] = [{"name": x[0], "vectors": x[1]} for x in overall_self_attentions] # TODO: add colors.
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
    return out_object
