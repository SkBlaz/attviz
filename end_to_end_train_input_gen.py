## first build a model, then generate server input.
from generate_server_input import *
from build_bert_classifier import *

##  STEP 1: A vanilla BERT-base on BBC data set.
train_seq, dev_seq, train_tar, dev_tar = read_dataset("data","bbc")

bert_model = get_bert_base(train_seq, dev_seq, train_tar, dev_tar, weights_dir = "transformer_weights", cuda = False) ## for cuda, you might need the apex library

##  STEP 2: Predict, attend to and generate final json.
weights = "transformer_weights" ## Any HuggingFace model dump can be used!
test_data = "data/bbc/test.tsv"
delimiter = "\t"
text_field = "text_a"
label_field = "label"
number_of_attention_heads = 12
label_names = ['business','entertainment','politics','sport']
segment_delimiter = "|||"

## Obtain the attention information and create the output object.
## Subsample = True takes each 10th sample, useful for prototyping.

model = BertForSequenceClassification.from_pretrained(weights,
                                                          num_labels = len(label_names),
                                                          output_hidden_states=True,
                                                          output_attentions=True)

tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
out_obj = get_json_from_weights(model,
                                tokenizer,
                                test_data = test_data,
                                delimiter = delimiter,
                                text_field = text_field,
                                label_field = label_field,
                                number_of_attention_heads = number_of_attention_heads,
                                label_names = label_names,
                                segment_delimiter = segment_delimiter,
                                subsample = True)

## Output the extracted information to AttViz-suitable json.
with open('generated_json_inputs/example_bbc_explanations.json', 'w') as fp:
    json.dump(out_obj, fp)
    
That's it! Simply upload this json to the attvis.ijs.si and explore!
