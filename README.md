# AttViz - Self attention made simple

Neural language models are the state-of-the-art for most language-related tasks. One of the ways to explore their behavior, however, is via _visualization_. We present AttViz, a simple webserver suitable for *exploration* of instance-level attention, online.
The server is live at [AttViz](http://attviz.ijs.si).

Current preprint:
```
@misc{krlj2020attviz,
    title={AttViz: Online exploration of self-attention for transparent neural language modeling},
    author={Blaž Škrlj and Nika Eržen and Shane Sheehan and Saturnino Luz and Marko Robnik-Šikonja and Senja Pollak},
    year={2020},
    eprint={2005.05716},
    archivePrefix={arXiv},
    primaryClass={cs.LG}
}
```

# How to prepare inputs?
AttViz accepts attention space, encoded in the form of JSON objects, that can be constructed by using the provided scripts. An end-to-end example, which first trains a BERT-based model on a multiclass classification task, and next uses it to obtain attention data
is given next.

```python

## first build a model, then generate server input.
from generate_server_input import *
from build_bert_classifier import *

##  STEP 1: A vanilla BERT-base on BBC data set.
train_seq, dev_seq, train_tar, dev_tar = read_dataset("data","bbc")
bert_model = get_bert_base(train_seq, dev_seq, train_tar, dev_tar, weights_dir = "transformer_weights", cuda = False)

##  STEP 2: Predict, attend to and generate final json.
weights = "models/bbc_bert_base_weights"
test_data = "test_bbc.tsv"
delimiter = "\t"
text_field = "text_a"
label_field = "label"
number_of_attention_heads = 16
label_names = ['business','entertainment','politics','sport','tech']
segment_delimiter = "|||"
output_obj = get_json_from_weights(weights,
                                   test_data = test_data,
                                   delimiter = delimiter,
                                   text_field = text_field,
                                   label_field = label_field,
                                   number_of_attention_heads = number_of_attention_heads,
                                   label_names = label_names,
                                   segment_delimiter = segment_delimiter)
with open('generated_outputs/example_bbc_explanations.json', 'w') as fp:
    json.dump(out_object, fp)
    
## That's it! Simply upload this json to the attvis.ijs.si and explore!
```

The server also comes with some pre-loaded examples, check these also!