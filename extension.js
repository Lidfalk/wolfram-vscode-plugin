// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var request = require('request');
var xml2js = require('xml2js');
var _ = require('lodash');

var app_id = vscode.workspace.getConfiguration().get("wolfram.app_id");

function makeWolframQuery(query) {

    if (isEmpty(app_id)) {
        return new Promise((resolve, reject) => {
            reject("App_id is not configured. Add wolfram.app_id to User settings")
        })
    }

    var uri = 'http://api.wolframalpha.com/v2/query?input=' + encodeURIComponent(query) + '&primary=true&appid=' + app_id;
    return new Promise((resolve, reject) => {
        request(uri, { timeout: 5000 }, (error, response, body) => {
            if (error) {
                if (error.code === 'ETIMEDOUT') {
                    return reject('Request timed out.');
                }
                return reject('Request failed: ' + error.code);
            }

            if (response.statusCode !== 200) {
                return reject('Error: ' + response.statusCode );
            }
            xml2js.parseString(body, function (err, result) {
                if (err) {
                    return reject('Failed to parse XML.');
                }

                // find the result pod
                var firstResult = _.find(result.queryresult.pod, function (pod) {
                    return pod.$.id === "Result";
                });

                if (!firstResult) {
                    return reject("Didn't find any result");
                }
                var textResponse = _.get(firstResult, "subpod[0].plaintext[0]");
                if (!textResponse) {
                    return reject('Failed to parse result.');
                }
                resolve(textResponse);
            });
        });
    });
}

function isEmpty(string) {
    return (!string || 0 === string.length);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	var disposable = vscode.commands.registerCommand('extension.wolfram', function () {
		
		var editor = vscode.window.activeTextEditor;
		if (!editor) {
			return; // No open text editor
		}

		var selection = editor.selection;
		var text = editor.document.getText(selection);
        
		if (!text.length) {
            text = editor.document.lineAt(selection.start.line).text
            if (!text.trim().length) {
                return vscode.window.showInformationMessage('No text selected.');
            }
            
		}

		makeWolframQuery(text)
			.then((result) => {
				editor.edit((textEditor) => {
					textEditor.insert(selection.end, "\n" + result);
				}).then((didApply) => {
					if (!didApply) {
						return vscode.window.showInformationMessage('Failed to insert result.');
					}
				});
			}).catch(vscode.window.showInformationMessage);
	});
	context.subscriptions.push(disposable);
}

exports.activate = activate;
exports.makeWolframQuery = makeWolframQuery;
