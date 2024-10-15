import { PyodideInterface } from "../pyodide/pyodide";

export function preprocess(pyodide: PyodideInterface){
    const funcDecontracted = pyodide.runPython(`
        import re
        from pyodide.ffi import to_js

        def funcDecontracted(phrase):
            phrase = re.sub(r"won\'t", "will not", phrase)
            phrase = re.sub(r"can\'t", "can not", phrase)

            phrase = re.sub(r"n\'t", " not", phrase)
            phrase = re.sub(r"\'re", " are", phrase)
            phrase = re.sub(r"\'s", " is", phrase)
            phrase = re.sub(r"\'d", " would", phrase)
            phrase = re.sub(r"\'ll", " will", phrase)
            phrase = re.sub(r"\'t", " not", phrase)
            phrase = re.sub(r"\'ve", " have", phrase)
            phrase = re.sub(r"\'m", " am", phrase)
            return to_js(phrase)
        
        funcDecontracted
    `)
    return funcDecontracted
}
