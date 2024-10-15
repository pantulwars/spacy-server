import spacy
nlp = spacy.load('en_core_web_md')

def sent2vec_features(text):
    text = nlp(text)
    text = text.vector
    return text

newvector = sent2vec_features("This is a test")
print(len(newvector))

