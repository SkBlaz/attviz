from typing import Union
from utils_fuji import *

## Note, create by petkovic et al, accessible at https://github.com/Petkomat/fuji-score/edit/master/code/main.py

def compute_similarity(scores1,
                       scores2,
                       similarity_measure: str,
                       eps: float = 0.0,
                       step: Union[str, int] = 1,
                       use_progress_bar=None,
                       negative_importances_handler="raise"):
    """
    Computes (fuzzy) Jaccard similarity between two ranked lists.

    :param scores1: first list/array of scores of features/items/...
    :param scores2: analogue of scores1
    :param similarity_measure: either 'fuzzy_jaccard' or any of the allowed similarity measures
                               (see utils_fuji.ALLOWED_MEASURES)
    :param eps: applicable if similarity_measure is 'fuzzy_jaccard'; in that case,
                the threshold under which the scores are considered to be 0
    :param step: applicable if similarity_measure is 'fuzzy_jaccard'; in that case,
                 the number of items to add before computing the next similarity; possible values are
                 1, 'squared' and 'exp': the corresponding feature subset sizes are
                 - 1: [1, 2, 3, 4,  ...]
                 - 'squared': [1, 4, 9, 16, 25, ...]
                 - 'exp': [1, 2, 4, 8, 16, 32, ...]
                 It is assured that the last size always equals the number of features.
    :param use_progress_bar: if set to True, a progress bar is shown. If set to None, the progress is shown
                             for larger numbers of features
    :param negative_importances_handler: applicable if similarity measure is 'fuzzy_jaccard'; in that case,
           either 'raise' or 'correct'; tells how to handle negative scores:
           if set to 'raise', ValueError is raised when a negative score is encountered,
           otherwise, negative values are set to 0
    :return: A pair, consisting of similarity scores curve and the area under it
    """
    message = "The chosen {} {} is not among the allowed ones: {}"
    if similarity_measure not in ALLOWED_MEASURES:
        raise ValueError(
            message.format("similarity measure", similarity_measure,
                           ALLOWED_MEASURES))
    if step not in ALLOWED_STEPS:
        raise ValueError(message.format("step", step, ALLOWED_STEPS))
    if negative_importances_handler not in ALLOWED_IMPORTANCE_HANDLERS:
        raise ValueError(
            message.format("negative importance handler",
                           negative_importances_handler,
                           ALLOWED_IMPORTANCE_HANDLERS))

    fimp1 = Fimp.create_fimp_from_relevances(scores1)
    fimp2 = Fimp.create_fimp_from_relevances(scores2)
    curve = compute_similarity_helper(fimp1, fimp2, similarity_measure, eps,
                                      step, use_progress_bar,
                                      negative_importances_handler)
    area_under_curve = area_under_the_curve(curve)
    return curve, area_under_curve


if __name__ == "__main__":
    r = [1.0, 0.9, 0.3, 0.14, 0.1]
    s = [0.8, 0.9, 0.3, 0.14, 0.1]
    print(compute_similarity(r, s, "fuzzy_jaccard"))
    print(compute_similarity(r, s, "jaccard"))
    print(compute_similarity(r, s, "cwrel"))
    print(compute_similarity(r, s, "correlation"))
    print(compute_similarity(r, s, "fuzzy_gamma"))
