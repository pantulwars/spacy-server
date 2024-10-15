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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var MessageType_1 = require("../MessageType");
var scraperlib_1 = require("scraperlib");
var model_1 = require("./model");
var class_transformer_1 = require("class-transformer");
//$%
var feature_extractor_text_1 = require("./featureExtraction/feature-extractor-text");
require("./pyodide/pyodide");
require("./pyodide/pyodide.asm.js");
require("./pyodide/pyodide-lock.json");
var getSpacyFeature_1 = require("./featureExtraction/spacy/getSpacyFeature");
globalThis.loadPyodide().then(function (pyodide) {
    console.log("Loaded");
    console.log(pyodide);
    pyodide.loadPackage(["https://files.pythonhosted.org/packages/2a/2b/fb867ed1e62954e8b9d9211f9c6ce028d4f630cab779815279adde9e3fdd/micropip-0.5.0-py3-none-any.whl", "https://files.pythonhosted.org/packages/ec/1a/610693ac4ee14fcdf2d9bf3c493370e4f2ef7ae2e19217d7a237ff42367d/packaging-23.2-py3-none-any.whl"]).then(function () {
        console.log("Micropip loaded");
        (0, getSpacyFeature_1.getSpacyFeature)(pyodide).then(function (feature_fn) {
            console.log(feature_fn("here"));
        });
    });
});
var typeToClass = (_a = {},
    _a[scraperlib_1.ScrapDataType.Mixed] = scraperlib_1.MixedScrapData,
    _a[scraperlib_1.ScrapDataType.Link] = scraperlib_1.LinkData,
    _a[scraperlib_1.ScrapDataType.Location] = scraperlib_1.LocationData,
    _a[scraperlib_1.ScrapDataType.Voice] = scraperlib_1.VoiceData,
    _a);
globalThis.data = [];
globalThis.installationDone = true;
var dashboardTab;
var extensionTab;
var maxScrapeTime;
var modelAPI = new model_1.XGBoostModelAPI();
chrome.runtime.onInstalled.addListener(function () {
    globalThis.installationDone = false;
    chrome.tabs.create({
        url: chrome.extension.getURL('index.html'),
        active: true
    });
});
chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.create({
        url: chrome.extension.getURL('index.html'),
        selected: true,
    }, function (exTab) {
        extensionTab = exTab;
    });
    dashboardTab = tab;
    chrome.tabs.sendMessage(tab.id, MessageType_1.MessageType.GVA_SCRAPE_DATA);
});
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    globalThis.data = message || null;
    if (globalThis.data != null) {
        for (var i = 0; i < globalThis.data.length; i++) {
            var data = globalThis.data[i];
            var date = new Date(data._datetime);
            globalThis.data[i] = (0, class_transformer_1.plainToClass)(scraperlib_1.MixedScrapData, data);
            for (var j = 0; j < globalThis.data[i]._data.length; j++) {
                var subdata = globalThis.data[i]._data[j];
            }
            globalThis.data[i]._datetime = date;
        }
        console.log(globalThis.data);
        for (var i = 0; i < globalThis.data.length; i++) {
            globalThis.data[i].runModel(modelAPI);
        }
        console.log(globalThis.data);
        chrome.storage.local.set({ datetime: new Date() }, function () {
            console.log('Page scraped on ' + new Date());
        });
        chrome.storage.local.set({ data: message }, function () {
            console.log('Stored data in the key data');
        });
        chrome.browserAction.setBadgeBackgroundColor({ color: '#F00' }, function () {
            chrome.browserAction.setBadgeText({ text: 'ON' });
        });
        chrome.tabs.create({
            url: chrome.extension.getURL('index.html'),
            selected: true,
        });
    }
});
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
                case 0: return [4 /*yield*/, (0, feature_extractor_text_1.extractTextFeatures)(textArray)];
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
