"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFeatures = void 0;
var lexicons_1 = require("./lexicons");
var lexicons_2 = require("./lexicons");
//$% imported following libraries
var axios_1 = require("axios");
var stopwords_eng_1 = require("./stopwords_eng");
var LIWC_dictionary_1 = require("./LIWC_dictionary");
//$%
var Preprocessor = /** @class */ (function () {
    function Preprocessor() {
        this.stopWords = new Set(stopwords_eng_1.eng);
    }
    Preprocessor.prototype.decontracted = function (phrase) {
        phrase = phrase.replace(/won't/g, "will not");
        phrase = phrase.replace(/can't/g, "can not");
        phrase = phrase.replace(/n't/g, " not");
        phrase = phrase.replace(/'re/g, " are");
        phrase = phrase.replace(/'s/g, " is");
        phrase = phrase.replace(/'d/g, " would");
        phrase = phrase.replace(/'ll/g, " will");
        phrase = phrase.replace(/'t/g, " not");
        phrase = phrase.replace(/'ve/g, " have");
        phrase = phrase.replace(/'m/g, " am");
        return phrase;
    };
    Preprocessor.prototype.preprocess = function (text) {
        var _this = this;
        text = this.decontracted(text);
        text = text.toLowerCase().replace(/\s+/g, ' ').trim(); // Replace consecutive whitespace with a single space and trim
        text = text.replace(/\n\r/g, ''); // Remove newline and carriage return
        var words = text.split(/\s+/).filter(function (word) { return word !== ''; }); // Split based on whitespace
        var tokens = words.filter(function (word) { return !_this.stopWords.has(word); });
        return tokens;
    };
    return Preprocessor;
}());
var LiwcTrieNode = /** @class */ (function () {
    function LiwcTrieNode() {
        this.character = '*';
        this.parent = null;
        this.children = {};
        this.categories = new Set();
    }
    return LiwcTrieNode;
}());
var LiwcTrie = /** @class */ (function () {
    function LiwcTrie() {
        this.root = new LiwcTrieNode();
    }
    LiwcTrie.prototype.insertWord = function (word, category) {
        if (word[word.length - 1] !== '*') {
            word = word + '$';
        }
        var t = this.root;
        for (var i = 0; i < word.length; i++) {
            if (!t.children[word[i]]) {
                t.children[word[i]] = new LiwcTrieNode();
                t.children[word[i]].character = word[i];
                t.children[word[i]].parent = t;
            }
            t = t.children[word[i]];
            if (i === word.length - 1) {
                t.categories.add(category);
            }
        }
    };
    LiwcTrie.prototype.getLiwcCategories = function (word) {
        var t = this.root;
        var categories = new Set();
        word = word + '$';
        var i = 0;
        for (i = 0; i < word.length; i++) {
            if (t.children['*']) {
                t.children['*'].categories.forEach(function (cat) { return categories.add(cat); });
            }
            if (t.children[word[i]]) {
                t = t.children[word[i]];
            }
            else {
                break;
            }
        }
        if (i === word.length) {
            t.categories.forEach(function (cat) { return categories.add(cat); });
        }
        return categories;
    };
    LiwcTrie.prototype.printFormattedTrie = function () {
        this.printNodeFormatted(this.root, 0);
    };
    LiwcTrie.prototype.printNodeFormatted = function (node, level) {
        var indent = '  '.repeat(level);
        var categoriesArray = Array.from(node.categories); // Convert set to array
        console.log("".concat(indent).concat(node.character, " (").concat(categoriesArray.length > 0 ? categoriesArray.join(', ') : 'No Categories', ")"));
        for (var childKey in node.children) {
            this.printNodeFormatted(node.children[childKey], level + 1);
        }
    };
    return LiwcTrie;
}());
var TOP_UNIGRAMS_COUNT = 100;
var TOP_BIGRAMS_COUNT = 100;
//$% trigram 
var TOP_TRIGRAMS_COUNT = 100;
//$% trigram
//$% LIWC stuff
// Loading LIWC dictionary from JSON file
var Trie = new LiwcTrie();
Trie = createTrie(LIWC_dictionary_1.liwc_dictionary);
// console.log("LIWC Trie:/n");
// Trie.printFormattedTrie();
// console.log("kia-*", Trie.getLiwcCategories("kia-*"));
// console.log("kia-tiger", Trie.getLiwcCategories("kia-tiger"));
// console.log("kia-sonet", Trie.getLiwcCategories("kia-sonet"));
// console.log("kia-carens", Trie.getLiwcCategories("kia-carens"));
// console.log("/n");
//$% LIWC stuff
function extractTextFeatures(text) {
    return __awaiter(this, void 0, void 0, function () {
        var text_features, result_calculateTopUnigrams, TOP_UNIGRAMS, unigramCounts, TOP_BIGRAMS, TOP_TRIGRAMS, liwcCat, _i, _a, cat, _b, text_1, sentence, text_embedding, lowercaseSentence, vector;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    text_features = [];
                    result_calculateTopUnigrams = calculateTopUnigrams(text, TOP_UNIGRAMS_COUNT);
                    TOP_UNIGRAMS = result_calculateTopUnigrams[0];
                    unigramCounts = result_calculateTopUnigrams[1];
                    TOP_BIGRAMS = calculateTopBigrams(text, TOP_BIGRAMS_COUNT);
                    TOP_TRIGRAMS = calculateTopTrigrams(text, TOP_TRIGRAMS_COUNT);
                    liwcCat = [];
                    // console.log("TOP_UNIGRAMS:", TOP_UNIGRAMS);
                    // console.log("unigram_counts:", unigramCounts);
                    //$% changing following code as this adds only categories related to words of unigrmCounts, but we want all categories
                    // for (const uni of Object.keys(unigramCounts)) {
                    //   for (const cat of Array.from(Trie.getLiwcCategories(uni))) {
                    //     if (!liwcCat.includes(cat)) {
                    //       liwcCat.push(cat);
                    //     }
                    //   }
                    // }
                    // console.log("LIWC Categories:", liwcCat);
                    // console.log(liwcCat.length);
                    //$% changing following code as this adds only categories related to words of unigrmCounts, but we want all categories
                    for (_i = 0, _a = Object.keys(LIWC_dictionary_1.liwc_dictionary); _i < _a.length; _i++) {
                        cat = _a[_i];
                        liwcCat.push(cat);
                    }
                    console.log("LIWC Categories:", liwcCat);
                    console.log(liwcCat.length);
                    _b = 0, text_1 = text;
                    _c.label = 1;
                case 1:
                    if (!(_b < text_1.length)) return [3 /*break*/, 4];
                    sentence = text_1[_b];
                    text_embedding = {};
                    lowercaseSentence = sentence.toLowerCase();
                    text_embedding["SWEAR_WORD_FEAT"] = extractSwearWordFeature(lowercaseSentence);
                    text_embedding["REGRET_WORD_FEAT"] = extractRegretWordFeature(lowercaseSentence);
                    text_embedding["EMOTION_WORD_FEAT"] = extractEmotionWordFeature(lowercaseSentence);
                    text_embedding["TOP_UNIGRAM_FEAT"] = extractTopUnigramFeature(lowercaseSentence, TOP_UNIGRAMS);
                    text_embedding["TOP_BIGRAM_FEAT"] = extractTopBigramFeature(lowercaseSentence, TOP_BIGRAMS);
                    //$% trigram, LIWC, NRC(positive, negative) & MPQA
                    text_embedding["TOP_TRIGRAM_FEAT"] = extractTopTrigramFeature(lowercaseSentence, TOP_TRIGRAMS);
                    text_embedding["LIWC_FEAT"] = extractLiwcFeature(lowercaseSentence, liwcCat, Trie);
                    text_embedding["SENTIMENT_FEAT"] = extractSentimentFeature(lowercaseSentence);
                    return [4 /*yield*/, getVectorFromApi(lowercaseSentence)];
                case 2:
                    vector = _c.sent();
                    if (vector) {
                        text_embedding["SENT_2_VEC_FEAT"] = vector;
                        // console.log("Sent2Vec vector:", vector);
                    }
                    else {
                        console.log("Error in getting sent2vec vector from API");
                    }
                    //$% trigram, LIWC, NRC(positive, negative) & MPQA
                    text_features.push(text_embedding);
                    _c.label = 3;
                case 3:
                    _b++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, text_features];
            }
        });
    });
}
exports.extractTextFeatures = extractTextFeatures;
function getVectorFromApi(text) {
    return __awaiter(this, void 0, void 0, function () {
        var apiUrl, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    apiUrl = 'http://127.0.0.1:8000/get_vector';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.post(apiUrl, { text: text })];
                case 2:
                    response = _a.sent();
                    if (response.status === 200) {
                        return [2 /*return*/, response.data.vector];
                    }
                    else {
                        console.error("Error: ".concat(response.status));
                        return [2 /*return*/, null];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    if (axios_1.default.isAxiosError(error_1)) {
                        console.error('Failed to retrieve vector:', error_1.message);
                    }
                    else {
                        console.error('Unexpected error:', error_1);
                    }
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
//$% spacy
//$% NRC(positive, negative) & MPQA
function extractSentimentFeature(text) {
    var sentimentFeature = [];
    var positiveWordCount = 0;
    var negativeWordCount = 0;
    var sentimentalWordCount = 0;
    var subjectiveWordCount = 0;
    for (var _i = 0, NRC_SENTIMENT_WORDS_POSITIVE_1 = lexicons_2.NRC_SENTIMENT_WORDS_POSITIVE; _i < NRC_SENTIMENT_WORDS_POSITIVE_1.length; _i++) {
        var positiveWord = NRC_SENTIMENT_WORDS_POSITIVE_1[_i];
        var cnt = countOccurrences(text, positiveWord);
        positiveWordCount += cnt;
    }
    for (var _a = 0, NRC_SENTIMENT_WORDS_NEGATIVE_1 = lexicons_2.NRC_SENTIMENT_WORDS_NEGATIVE; _a < NRC_SENTIMENT_WORDS_NEGATIVE_1.length; _a++) {
        var negativeWord = NRC_SENTIMENT_WORDS_NEGATIVE_1[_a];
        var cnt = countOccurrences(text, negativeWord);
        negativeWordCount += cnt;
    }
    for (var _b = 0, MPQA_WORDS_SENTIMENTAL_1 = lexicons_2.MPQA_WORDS_SENTIMENTAL; _b < MPQA_WORDS_SENTIMENTAL_1.length; _b++) {
        var positiveWord = MPQA_WORDS_SENTIMENTAL_1[_b];
        var cnt = countOccurrences(text, positiveWord);
        sentimentalWordCount += cnt;
    }
    for (var _c = 0, MPQA_WORDS_SUBJECTIVE_1 = lexicons_2.MPQA_WORDS_SUBJECTIVE; _c < MPQA_WORDS_SUBJECTIVE_1.length; _c++) {
        var negativeWord = MPQA_WORDS_SUBJECTIVE_1[_c];
        var cnt = countOccurrences(text, negativeWord);
        subjectiveWordCount += cnt;
    }
    sentimentFeature.push(positiveWordCount);
    sentimentFeature.push(negativeWordCount);
    sentimentFeature.push(sentimentalWordCount);
    sentimentFeature.push(subjectiveWordCount);
    return sentimentFeature;
}
//$% NRC(positive, negative) & MPQA
function extractEmotionWordFeature(text) {
    var emotionWordFeature = [];
    var emotionWordCount = 0;
    // EMOTION_WORDS_ANGER
    for (var _i = 0, EMOTION_WORDS_ANGER_1 = lexicons_2.EMOTION_WORDS_ANGER; _i < EMOTION_WORDS_ANGER_1.length; _i++) {
        var emotionWord = EMOTION_WORDS_ANGER_1[_i];
        var cnt = countOccurrences(text, emotionWord);
        emotionWordCount += cnt;
    }
    emotionWordFeature.push(emotionWordCount);
    // EMOTION_WORDS_ANTICIPATION
    emotionWordCount = 0;
    for (var _a = 0, EMOTION_WORDS_ANTICIPATION_1 = lexicons_2.EMOTION_WORDS_ANTICIPATION; _a < EMOTION_WORDS_ANTICIPATION_1.length; _a++) {
        var emotionWord = EMOTION_WORDS_ANTICIPATION_1[_a];
        var cnt = countOccurrences(text, emotionWord);
        emotionWordCount += cnt;
    }
    emotionWordFeature.push(emotionWordCount);
    // EMOTION_WORDS_DISGUST
    emotionWordCount = 0;
    for (var _b = 0, EMOTION_WORDS_DISGUST_1 = lexicons_2.EMOTION_WORDS_DISGUST; _b < EMOTION_WORDS_DISGUST_1.length; _b++) {
        var emotionWord = EMOTION_WORDS_DISGUST_1[_b];
        var cnt = countOccurrences(text, emotionWord);
        emotionWordCount += cnt;
    }
    emotionWordFeature.push(emotionWordCount);
    // EMOTION_WORDS_FEAR
    emotionWordCount = 0;
    for (var _c = 0, EMOTION_WORDS_FEAR_1 = lexicons_2.EMOTION_WORDS_FEAR; _c < EMOTION_WORDS_FEAR_1.length; _c++) {
        var emotionWord = EMOTION_WORDS_FEAR_1[_c];
        var cnt = countOccurrences(text, emotionWord);
        emotionWordCount += cnt;
    }
    emotionWordFeature.push(emotionWordCount);
    // EMOTION_WORDS_JOY
    emotionWordCount = 0;
    for (var _d = 0, EMOTION_WORDS_JOY_1 = lexicons_2.EMOTION_WORDS_JOY; _d < EMOTION_WORDS_JOY_1.length; _d++) {
        var emotionWord = EMOTION_WORDS_JOY_1[_d];
        var cnt = countOccurrences(text, emotionWord);
        emotionWordCount += cnt;
    }
    emotionWordFeature.push(emotionWordCount);
    // EMOTION_WORDS_SADNESS
    emotionWordCount = 0;
    for (var _e = 0, EMOTION_WORDS_SADNESS_1 = lexicons_2.EMOTION_WORDS_SADNESS; _e < EMOTION_WORDS_SADNESS_1.length; _e++) {
        var emotionWord = EMOTION_WORDS_SADNESS_1[_e];
        var cnt = countOccurrences(text, emotionWord);
        emotionWordCount += cnt;
    }
    emotionWordFeature.push(emotionWordCount);
    // EMOTION_WORDS_SURPRISE
    emotionWordCount = 0;
    for (var _f = 0, EMOTION_WORDS_SURPRISE_1 = lexicons_2.EMOTION_WORDS_SURPRISE; _f < EMOTION_WORDS_SURPRISE_1.length; _f++) {
        var emotionWord = EMOTION_WORDS_SURPRISE_1[_f];
        var cnt = countOccurrences(text, emotionWord);
        emotionWordCount += cnt;
    }
    emotionWordFeature.push(emotionWordCount);
    // EMOTION_WORDS_TRUST
    emotionWordCount = 0;
    for (var _g = 0, EMOTION_WORDS_TRUST_1 = lexicons_2.EMOTION_WORDS_TRUST; _g < EMOTION_WORDS_TRUST_1.length; _g++) {
        var emotionWord = EMOTION_WORDS_TRUST_1[_g];
        var cnt = countOccurrences(text, emotionWord);
        emotionWordCount += cnt;
    }
    emotionWordFeature.push(emotionWordCount);
    return emotionWordFeature;
}
function extractRegretWordFeature(text) {
    var regretWordFeature = [];
    var regretWordCount = 0;
    // REGRET_WORDS_CURSING
    for (var _i = 0, REGRET_WORDS_CURSING_1 = lexicons_2.REGRET_WORDS_CURSING; _i < REGRET_WORDS_CURSING_1.length; _i++) {
        var regretWord = REGRET_WORDS_CURSING_1[_i];
        var cnt = countOccurrences(text, regretWord);
        regretWordCount += cnt;
    }
    regretWordFeature.push(regretWordCount);
    // REGRET_WORDS_DRUG
    regretWordCount = 0;
    for (var _a = 0, REGRET_WORDS_DRUG_1 = lexicons_2.REGRET_WORDS_DRUG; _a < REGRET_WORDS_DRUG_1.length; _a++) {
        var regretWord = REGRET_WORDS_DRUG_1[_a];
        var cnt = countOccurrences(text, regretWord);
        regretWordCount += cnt;
    }
    regretWordFeature.push(regretWordCount);
    // REGRET_WORDS_HEALTH
    regretWordCount = 0;
    for (var _b = 0, REGRET_WORDS_HEALTH_1 = lexicons_2.REGRET_WORDS_HEALTH; _b < REGRET_WORDS_HEALTH_1.length; _b++) {
        var regretWord = REGRET_WORDS_HEALTH_1[_b];
        var cnt = countOccurrences(text, regretWord);
        regretWordCount += cnt;
    }
    regretWordFeature.push(regretWordCount);
    // REGRET_WORDS_RACE_RELIGION
    regretWordCount = 0;
    for (var _c = 0, REGRET_WORDS_RACE_RELIGION_1 = lexicons_2.REGRET_WORDS_RACE_RELIGION; _c < REGRET_WORDS_RACE_RELIGION_1.length; _c++) {
        var regretWord = REGRET_WORDS_RACE_RELIGION_1[_c];
        var cnt = countOccurrences(text, regretWord);
        regretWordCount += cnt;
    }
    regretWordFeature.push(regretWordCount);
    // REGRET_WORDS_RELATIONSHIP
    regretWordCount = 0;
    for (var _d = 0, REGRET_WORDS_RELATIONSHIP_1 = lexicons_2.REGRET_WORDS_RELATIONSHIP; _d < REGRET_WORDS_RELATIONSHIP_1.length; _d++) {
        var regretWord = REGRET_WORDS_RELATIONSHIP_1[_d];
        var cnt = countOccurrences(text, regretWord);
        regretWordCount += cnt;
    }
    regretWordFeature.push(regretWordCount);
    // REGRET_WORDS_SEX
    regretWordCount = 0;
    for (var _e = 0, REGRET_WORDS_SEX_1 = lexicons_2.REGRET_WORDS_SEX; _e < REGRET_WORDS_SEX_1.length; _e++) {
        var regretWord = REGRET_WORDS_SEX_1[_e];
        var cnt = countOccurrences(text, regretWord);
        regretWordCount += cnt;
    }
    regretWordFeature.push(regretWordCount);
    // REGRET_WORDS_VIOLENCE
    regretWordCount = 0;
    for (var _f = 0, REGRET_WORDS_VIOLENCE_1 = lexicons_2.REGRET_WORDS_VIOLENCE; _f < REGRET_WORDS_VIOLENCE_1.length; _f++) {
        var regretWord = REGRET_WORDS_VIOLENCE_1[_f];
        var cnt = countOccurrences(text, regretWord);
        regretWordCount += cnt;
    }
    regretWordFeature.push(regretWordCount);
    // REGRET_WORDS_WORK
    regretWordCount = 0;
    for (var _g = 0, REGRET_WORDS_WORK_1 = lexicons_2.REGRET_WORDS_WORK; _g < REGRET_WORDS_WORK_1.length; _g++) {
        var regretWord = REGRET_WORDS_WORK_1[_g];
        var cnt = countOccurrences(text, regretWord);
        regretWordCount += cnt;
    }
    regretWordFeature.push(regretWordCount);
    return regretWordFeature;
}
function extractSwearWordFeature(text) {
    var swearWordFeature = [];
    var swearWordCount = 0;
    for (var _i = 0, SWEAR_WORDS_1 = lexicons_1.SWEAR_WORDS; _i < SWEAR_WORDS_1.length; _i++) {
        var swearWord = SWEAR_WORDS_1[_i];
        var cnt = countOccurrences(text, swearWord);
        if (cnt) {
            swearWordFeature.push(1);
            swearWordCount += cnt;
        }
        else {
            swearWordFeature.push(0);
        }
    }
    swearWordFeature.push(swearWordCount);
    return swearWordFeature;
}
function extractTopUnigramFeature(text, topUnigrams) {
    var topUnigramFeature = [];
    for (var _i = 0, topUnigrams_1 = topUnigrams; _i < topUnigrams_1.length; _i++) {
        var unigram = topUnigrams_1[_i];
        var cnt = countOccurrences(text, unigram);
        topUnigramFeature.push(cnt);
    }
    return topUnigramFeature;
}
function extractTopBigramFeature(text, topBigrams) {
    var topBigramFeature = [];
    var bigrams = [];
    var tokens = text.split(/\s+/); //.map((token) => token.replace(/[.,!?;'"-]/g, ''));
    for (var i = 0; i < tokens.length - 1; i++) {
        var bigram = tokens[i] + ' ' + tokens[i + 1];
        bigrams.push(bigram);
    }
    var _loop_1 = function (topBigram) {
        var cnt = bigrams.filter(function (bigram) { return bigram === topBigram; }).length;
        topBigramFeature.push(cnt);
    };
    for (var _i = 0, topBigrams_1 = topBigrams; _i < topBigrams_1.length; _i++) {
        var topBigram = topBigrams_1[_i];
        _loop_1(topBigram);
    }
    return topBigramFeature;
}
//$% trigram
function extractTopTrigramFeature(text, topTrigrams) {
    var topTrigramFeature = [];
    var trigrams = [];
    var tokens = text.split(/\s+/);
    for (var i = 0; i < tokens.length - 2; i++) {
        var trigram = tokens[i] + ' ' + tokens[i + 1] + ' ' + tokens[i + 2];
        trigrams.push(trigram);
    }
    var _loop_2 = function (topTrigram) {
        var cnt = trigrams.filter(function (trigram) { return trigram === topTrigram; }).length;
        topTrigramFeature.push(cnt);
    };
    for (var _i = 0, topTrigrams_1 = topTrigrams; _i < topTrigrams_1.length; _i++) {
        var topTrigram = topTrigrams_1[_i];
        _loop_2(topTrigram);
    }
    return topTrigramFeature;
}
//$% trigram
function countOccurrences(sentence, wordToCount) {
    return sentence.split(/\s+/).filter(function (word) { return word === wordToCount; }).length;
}
function calculateTopUnigrams(corpus, topN) {
    var text = corpus.join(" ").toLowerCase();
    var tokens = text.split(/\s+/); //.map((token) => token.replace(/[.,!?;'"-]/g, ''));
    var unigramCounts = {};
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        if (token) {
            unigramCounts[token] = (unigramCounts[token] || 0) + 1;
        }
    }
    var sortedUnigrams = Object.keys(unigramCounts).sort(function (a, b) { return unigramCounts[b] - unigramCounts[a]; });
    var topUnigrams = sortedUnigrams.slice(0, topN);
    //$% now calculateTopUnigrams returns two values [string[], Record<string, number>], earlier it was only string[]
    return [topUnigrams, unigramCounts];
    //$%
}
function calculateTopBigrams(corpus, topN) {
    var text = corpus.join(" ").toLowerCase();
    var tokens = text.split(/\s+/); //.map((token) => token.replace(/[.,!?;'"-]/g, ''));
    var bigramCounts = {};
    for (var i = 0; i < tokens.length - 1; i++) {
        var bigram = tokens[i] + ' ' + tokens[i + 1];
        bigramCounts[bigram] = (bigramCounts[bigram] || 0) + 1;
    }
    var sortedBigrams = Object.keys(bigramCounts).sort(function (a, b) { return bigramCounts[b] - bigramCounts[a]; });
    var topBigrams = sortedBigrams.slice(0, topN);
    return topBigrams;
}
//$% trigram
function calculateTopTrigrams(corpus, topN) {
    var text = corpus.join(" ").toLowerCase();
    var tokens = text.split(/\s+/);
    var trigramCounts = {};
    for (var i = 0; i < tokens.length - 2; i++) {
        var trigram = tokens[i] + ' ' + tokens[i + 1] + ' ' + tokens[i + 2];
        trigramCounts[trigram] = (trigramCounts[trigram] || 0) + 1;
    }
    var sortedTrigrams = Object.keys(trigramCounts).sort(function (a, b) { return trigramCounts[b] - trigramCounts[a]; });
    var topTrigrams = sortedTrigrams.slice(0, topN);
    return topTrigrams;
}
//$% trigram
// const lexicon: { [key: string]: LexiconEntry } = {};
// const lexiconCsv: string = fs.readFileSync('./MPQA/lexicon_easy.csv', 'utf8');
// const lexiconData: (string | number)[][] = lexiconCsv.split('\n').map(row => row.split(','));
// for (const row of lexiconData) {
//     row[1] = parseInt(row[1] as string);
//     row[2] = parseInt(row[2] as string);
//     lexicon[row[0] as string] = {
//         subj: row[1] as number,
//         sent: row[2] as number,
//     };
// }
//%$ LIWC related classes and functions
function counter(inputList) {
    var counts = {};
    for (var _i = 0, inputList_1 = inputList; _i < inputList_1.length; _i++) {
        var item = inputList_1[_i];
        counts[item] = (counts[item] || 0) + 1;
    }
    return counts;
}
function createTrie(liwcDict) {
    var myTrie = new LiwcTrie();
    for (var _i = 0, _a = Object.entries(liwcDict); _i < _a.length; _i++) {
        var _b = _a[_i], category = _b[0], words = _b[1];
        for (var _c = 0, words_1 = words; _c < words_1.length; _c++) {
            var word = words_1[_c];
            myTrie.insertWord(word, category);
        }
    }
    return myTrie;
}
function extractLiwcFeature(text, liwcCat, Trie) {
    var f = [];
    var preprocessor = new Preprocessor();
    var processed_text = preprocessor.preprocess(text);
    var k = counter(processed_text);
    // console.log("k:", k);
    for (var _i = 0, liwcCat_1 = liwcCat; _i < liwcCat_1.length; _i++) {
        var cat = liwcCat_1[_i];
        var cat1 = 0;
        for (var _a = 0, _b = Object.keys(k); _a < _b.length; _a++) {
            var key = _b[_a];
            if (Trie.getLiwcCategories(key).has(cat)) {
                cat1 += 1;
            }
        }
        f.push(cat1);
    }
    // console.log("LIWC Features:", f);
    return f;
}
//$% LIWC
//$%
var textArray = [
    "Searched for how to paste without formatting in mc",
    "Visited https://auto.hindustantimes.com/web-stories/2024-mahindra-xuv700-is-here-with-upgrades-to-take-on-the-tata-safari-check-it-out-41705380157708",
    "And this is the third one.",
    "he always fight in the class, he is worse than what i thought"
];
function processTextArray() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, extractTextFeatures(textArray)];
                case 1:
                    result = _a.sent();
                    console.log("hi saras");
                    console.log(result);
                    return [2 /*return*/];
            }
        });
    });
}
processTextArray();
//$%
