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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var dotenv = require("dotenv");
dotenv.config({ path: '.env.local' });
var supabase_js_1 = require("@supabase/supabase-js");
var sync_1 = require("csv-parse/sync");
var fs = require("fs");
var path = require("path");
// Initialize Supabase client
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
var supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
function migrateData() {
    return __awaiter(this, void 0, void 0, function () {
        var packagesData, bottlesData, questionsData, packageMap, _i, packagesData_1, pkg, _a, packageData, packageError, bottleMap, _b, bottlesData_1, bottle, package_id, _c, bottleData, bottleError, questionSet, insertedCount, _d, questionsData_1, question, bottleName, bottle_id, uniqueKey, questionError, error_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 16, , 17]);
                    // Clear existing data to prevent duplicates
                    return [4 /*yield*/, supabase.from('questions').delete().neq('id', '')];
                case 1:
                    // Clear existing data to prevent duplicates
                    _e.sent();
                    return [4 /*yield*/, supabase.from('bottles').delete().neq('id', '')];
                case 2:
                    _e.sent();
                    return [4 /*yield*/, supabase.from('packages').delete().neq('id', '')];
                case 3:
                    _e.sent();
                    packagesData = (0, sync_1.parse)(fs.readFileSync(path.join(process.cwd(), 'data', 'packages.csv')), { columns: true });
                    bottlesData = (0, sync_1.parse)(fs.readFileSync(path.join(process.cwd(), 'data', 'bottles.csv')), { columns: true });
                    questionsData = (0, sync_1.parse)(fs.readFileSync(path.join(process.cwd(), 'data', 'questions.csv')), { columns: true });
                    packageMap = new Map();
                    _i = 0, packagesData_1 = packagesData;
                    _e.label = 4;
                case 4:
                    if (!(_i < packagesData_1.length)) return [3 /*break*/, 7];
                    pkg = packagesData_1[_i];
                    if (!pkg.name || packageMap.has(pkg.name))
                        return [3 /*break*/, 6];
                    return [4 /*yield*/, supabase
                            .from('packages')
                            .insert({
                            name: pkg.name,
                            description: pkg.description
                        })
                            .select()
                            .single()];
                case 5:
                    _a = _e.sent(), packageData = _a.data, packageError = _a.error;
                    if (packageError)
                        throw packageError;
                    packageMap.set(pkg.name, packageData.id);
                    _e.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    bottleMap = new Map();
                    _b = 0, bottlesData_1 = bottlesData;
                    _e.label = 8;
                case 8:
                    if (!(_b < bottlesData_1.length)) return [3 /*break*/, 11];
                    bottle = bottlesData_1[_b];
                    if (!bottle.name || bottleMap.has(bottle.name))
                        return [3 /*break*/, 10];
                    package_id = null;
                    if (bottle.package_id && packageMap.has(bottle.package_id)) {
                        package_id = packageMap.get(bottle.package_id);
                    }
                    else if (bottle.package_name && packageMap.has(bottle.package_name)) {
                        package_id = packageMap.get(bottle.package_name);
                    }
                    else if (packageMap.size === 1) {
                        package_id = Array.from(packageMap.values())[0];
                    }
                    return [4 /*yield*/, supabase
                            .from('bottles')
                            .insert({
                            package_id: package_id,
                            name: bottle.name,
                            description: bottle.description
                        })
                            .select()
                            .single()];
                case 9:
                    _c = _e.sent(), bottleData = _c.data, bottleError = _c.error;
                    if (bottleError)
                        throw bottleError;
                    bottleMap.set(bottle.name, bottleData.id);
                    _e.label = 10;
                case 10:
                    _b++;
                    return [3 /*break*/, 8];
                case 11:
                    // Log all bottleMap keys
                    console.log('BottleMap keys:', Array.from(bottleMap.keys()));
                    questionSet = new Set();
                    insertedCount = 0;
                    _d = 0, questionsData_1 = questionsData;
                    _e.label = 12;
                case 12:
                    if (!(_d < questionsData_1.length)) return [3 /*break*/, 15];
                    question = questionsData_1[_d];
                    bottleName = question.bottle_name;
                    console.log("[PROCESS] Question for bottle_name: \"".concat(bottleName, "\" | question: \"").concat(question.question_text, "\""));
                    if (!bottleName || !bottleMap.has(bottleName)) {
                        console.log("[SKIP] No matching bottle for question: \"".concat(question.question_text, "\" (bottle_name: \"").concat(bottleName, "\")"));
                        return [3 /*break*/, 14];
                    }
                    bottle_id = bottleMap.get(bottleName);
                    uniqueKey = "".concat(bottle_id, "|").concat(question.question_text);
                    if (!question.question_text || questionSet.has(uniqueKey)) {
                        console.log("[SKIP] Duplicate or empty question: \"".concat(question.question_text, "\" for bottle: \"").concat(bottleName, "\""));
                        return [3 /*break*/, 14];
                    }
                    console.log("[INSERT] Question for bottle: \"".concat(bottleName, "\" | question: \"").concat(question.question_text, "\""));
                    return [4 /*yield*/, supabase
                            .from('questions')
                            .insert({
                            bottle_id: bottle_id,
                            question_text: question.question_text,
                            question_type: question.question_type,
                            options: question.choices ? question.choices.split(',').map(function (c) { return c.trim(); }) : null
                        })];
                case 13:
                    questionError = (_e.sent()).error;
                    if (questionError)
                        throw questionError;
                    questionSet.add(uniqueKey);
                    insertedCount++;
                    _e.label = 14;
                case 14:
                    _d++;
                    return [3 /*break*/, 12];
                case 15:
                    console.log("Migration completed successfully! Inserted ".concat(insertedCount, " questions."));
                    return [3 /*break*/, 17];
                case 16:
                    error_1 = _e.sent();
                    console.error('Migration failed:', error_1);
                    return [3 /*break*/, 17];
                case 17: return [2 /*return*/];
            }
        });
    });
}
migrateData();
