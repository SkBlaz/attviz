## a simple tool to post-process the jsons
import json

def prune_misc_tokens(input_json = None, output_json = None):

    if not input_json or not output_json:
        raise FileNotFoundError
    
    ## construct
    fx = open(input_json,"rt")
    json_file = eval(fx.read())
    fx.close()
    final_aspace = []
    for head in json_file:
        text = head['text']
        sets = head['sets']
#        final_aspace.append(head)
        content = sets[0]
        new_attention_vectors = []
        for attention_vector in content['attention_vectors']:
            ## this is a dict with a name and vectors
            new_vec = attention_vector['vectors'][1:-1]
            new_struct = {"vectors":new_vec}
            new_struct['name'] = attention_vector['name']
            new_attention_vectors.append(new_struct)
        tokenspace = content['tokens'][1:-1]
        final_content = {}
        final_content['attention_vectors'] = new_attention_vectors
        final_content['tokens'] = tokenspace        
        final_struct = {}
        final_struct['text'] = text
        final_struct['sets'] = [final_content]
        final_struct['output_activations'] = head['output_activations']
        final_aspace.append(final_struct)

    fx = open(output_json, "w")
    jdump = json.dumps(final_aspace)
    fx.write(jdump)
    fx.close()
        


if __name__ == "__main__":

    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--input_json",default="negative.json")
    parser.add_argument("--output_json",default="negative_output.json")
    args = parser.parse_args()
    prune_misc_tokens(args.input_json, args.output_json)
