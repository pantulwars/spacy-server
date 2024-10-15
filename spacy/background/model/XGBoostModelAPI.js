"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XGBoostModelAPI = void 0;
var ml_xgboost_1 = require("ml-xgboost");
var XGBoostModelAPI = /** @class */ (function () {
    function XGBoostModelAPI() {
        this.model = null;
        this.loadModel();
    }
    XGBoostModelAPI.prototype.loadModel = function () {
        var _this = this;
        fetch(chrome.runtime.getURL('model.json'))
            .then(function (r) { return r.arrayBuffer(); })
            .then(function (t) {
            ml_xgboost_1.xgboostWASM.isReady.then(function (l) { return (0, ml_xgboost_1.loadXGBoost)(l); }).then((function (XGBoost) {
                console.log(t);
                _this.model = XGBoost.loadFromBuffer(t, {});
                console.log(_this.model);
            }));
        });
    };
    XGBoostModelAPI.prototype.predict = function () { };
    return XGBoostModelAPI;
}());
exports.XGBoostModelAPI = XGBoostModelAPI;
