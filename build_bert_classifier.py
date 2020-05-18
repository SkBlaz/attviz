## a simple script for building the bert weight example.
from data_utils import *
from simpletransformers.classification import ClassificationModel
from sklearn import preprocessing
import pandas as pd

def read_dataset(data_folder,task = "bbc"):
    
    data_processor = data_processors[task]()
    folder_name = dataset_folders[task]
    data_name = "{}/{}".format(data_folder, folder_name)

    train_examples = data_processor.get_train_examples(data_name)
    dev_examples = data_processor.get_dev_examples(data_name)
    test_examples = data_processor.get_test_examples(data_name)
    
    train_sequences = train_examples['text_a']
    dev_sequences = dev_examples['text_a']    
    
    ## encode labels first.
    le = preprocessing.LabelEncoder()
    train_targets = train_examples['label']
    dev_targets = dev_examples['label']
    le.fit(train_targets)
    
    train_targets = le.transform(train_targets)
    dev_targets = le.transform(dev_targets)

    return train_sequences, dev_sequences, train_targets, dev_targets
    
def get_bert_base(train_sequences, dev_sequences, train_targets, dev_targets, time_constraint = 1, num_cpu = 1, max_features = 1000, model = "bert-base",weights_dir = "transformers_trained",cuda = False):


    'text' 'labels'
    total_sequences_training = train_sequences.values.tolist() + dev_sequences.values.tolist()
    
    total_labels_training = train_targets.tolist() + dev_targets.tolist()

    train_df = pd.DataFrame()
    train_df['text'] = total_sequences_training
    train_df['labels'] = total_labels_training

    
    # Create a ClassificationModel
    if model == "bert-base":
        model = ClassificationModel('bert', 'bert-base-cased', num_labels=len(set(total_labels_training)), args={'reprocess_input_data': True, 'overwrite_output_dir': True,"output_hidden_states":True}, use_cuda = cuda)
        
    elif model == "roberta-base":
        model = ClassificationModel('roberta', 'roberta-base', num_labels=len(set(total_labels_training)), args={'output_hidden_states':True,'reprocess_input_data': True, 'overwrite_output_dir': True}, use_cuda = cuda)

    model.args['num_train_epochs'] = 1
    model.args['max_sequence_length'] = 256
    model.args['save_eval_checkpoints'] = False
    model.args['save_model_every_epoch'] = False
    model.args['output_dir'] = weights_dir
    model.args['save_steps'] = 400

    # Train the model
    model.train_model(train_df)
    return model

if __name__ == "__main__":

    train_seq, dev_seq, train_tar, dev_tar = read_dataset("data","bbc")
    bert_model = get_bert_base(train_seq, dev_seq, train_tar, dev_tar)

    
    ## do something with the model.
