import { MessageType } from '../MessageType';
import { LinkData, LocationData, MixedScrapData, ScrapData, ScrapDataType, VoiceData } from 'scraperlib';
import { xgboostWASM, loadXGBoost, XGBoost } from 'ml-xgboost';
import { XGBoostModelAPI } from './model';
import { plainToClass } from 'class-transformer';

import { PyodideInterface } from './pyodide/pyodide';

//$%
import { extractTextFeatures } from './featureExtraction/feature-extractor-text';
//$%

declare global {
    var data: MixedScrapData[] | null;
    var installationDone: boolean;
    var loadPyodide: () => Promise<PyodideInterface>;
}

import "./pyodide/pyodide";
import "./pyodide/pyodide.asm.js";
import "./pyodide/pyodide-lock.json";

import {getSpacyFeature} from "./featureExtraction/spacy/getSpacyFeature";

globalThis.loadPyodide().then((pyodide: PyodideInterface) => {
    console.log("Loaded");
    console.log(pyodide);
    pyodide.loadPackage(["https://files.pythonhosted.org/packages/2a/2b/fb867ed1e62954e8b9d9211f9c6ce028d4f630cab779815279adde9e3fdd/micropip-0.5.0-py3-none-any.whl", "https://files.pythonhosted.org/packages/ec/1a/610693ac4ee14fcdf2d9bf3c493370e4f2ef7ae2e19217d7a237ff42367d/packaging-23.2-py3-none-any.whl"]).then(() => {
        console.log("Micropip loaded");
        getSpacyFeature(pyodide).then((feature_fn) => {
            console.log(feature_fn("here"))
        })
    })
})

const typeToClass  = {
    [ScrapDataType.Mixed]: MixedScrapData,
    [ScrapDataType.Link]: LinkData,
    [ScrapDataType.Location]: LocationData,
    [ScrapDataType.Voice]: VoiceData
}

globalThis.data = [];
globalThis.installationDone = true;

var dashboardTab: chrome.tabs.Tab;
var extensionTab: chrome.tabs.Tab;

var maxScrapeTime: Date;

var modelAPI = new XGBoostModelAPI();

chrome.runtime.onInstalled.addListener(function () {
    globalThis.installationDone = false;
    chrome.tabs.create({
        url: chrome.extension.getURL('index.html'),
        active: true
    });
})

chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.create({
        url: chrome.extension.getURL('index.html'),
        selected: true,
    }, (exTab) => {
        extensionTab = exTab;
    });
    dashboardTab = tab;
    chrome.tabs.sendMessage(tab.id!, MessageType.GVA_SCRAPE_DATA);
});


chrome.runtime.onMessage.addListener((message: MixedScrapData[], sender, sendResponse) => {
    globalThis.data = message || null;
    if (globalThis.data != null) {
        for (var i = 0; i < globalThis.data.length; i++) {
            var data = globalThis.data[i];
            var date = new Date(data._datetime);
            globalThis.data[i] = plainToClass(MixedScrapData, data);
            for (var j = 0; j < globalThis.data[i]._data.length; j++){
                var subdata = globalThis.data[i]._data[j];
                
            }
            globalThis.data[i]._datetime = date;

        }

        console.log(globalThis.data);

        for (var i = 0; i < globalThis.data.length; i++){
            globalThis.data[i].runModel(modelAPI);
        }

        console.log(globalThis.data);

        chrome.storage.local.set({ datetime: new Date() }, function () {
            console.log('Page scraped on ' + new Date());
        })
        chrome.storage.local.set({ data: message }, function () {
            console.log('Stored data in the key data');
        });

        chrome.browserAction.setBadgeBackgroundColor({ color: '#F00' }, () => {
            chrome.browserAction.setBadgeText({ text: 'ON' });
        });

        chrome.tabs.create({
            url: chrome.extension.getURL('index.html'),
            selected: true,
        });
    }
});

//$%
const textArray: string[] = [
    "Searched for how to paste without formatting in mc",
    "Visited https://auto.hindustantimes.com/web-stories/2024-mahindra-xuv700-is-here-with-upgrades-to-take-on-the-tata-safari-check-it-out-41705380157708",
    "And this is the third one.",
    "he always fight in the class, he is worse than what i thought"
];
  
async function processTextArray() {
    const result: { [key: string]: number[] }[] = await extractTextFeatures(textArray);
    console.log("hi saras");
    console.log(result);
}

processTextArray();
//$%