### a set of simple primitives for parsing attention and other outputs

def prepare_files(text_list, model, output_folder = None):

    """
    A core method which takes a trained model and a list of sentences to produce some output in form of attention.
    """
    
    output_text = "\n".join(text_list)
    attention_overall_vectors = []
    tokens_overall = []
    for sentence in text_list:
        attention_values, tokens = model.get_attention(sentence)
        for enx, value in enumerate(ttention_values):
            attention_overall_vectors.append(value)
            tokens_overall.append(tokens[enx])
    output_blocks = "\n".join(tokens_overall)
    output_attention = "\n".join(attention_overall_vectors)

    return output_text, output_blocks, output_attention
        
if __name__ == "__main__":

    ## TBA
        
    pass
