'use strict'; // eslint-disable-line

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const request = require('request');
const xml2js = require('xml2js');
const _ = require('lodash');

const appId = vscode.workspace.getConfiguration().get('wolfram.app_id');

function isEmpty(string) {
  return (!string || !string.length);
}
  
function makeWolframQuery(query) {
  if (isEmpty(appId)) {
    return new Promise((resolve, reject) => {
      reject('App_id is not configured. Add wolfram.app_id to User settings');
    });
  }

  const uri = `http://api.wolframalpha.com/v2/query?input=${encodeURIComponent(query)}&primary=true&appid=${appId}`;
  return new Promise((resolve, reject) => {
    request(uri, { timeout: 5000 }, (error, response, body) => {
      if (error) {
        if (error.code === 'ETIMEDOUT') {
          reject('Request timed out.'); return;
        }
        reject(`Request failed: ${error.code}`); return;
      }

      if (response.statusCode !== 200) {
        reject(`Error: ${response.statusCode}`); return;
      }
      xml2js.parseString(body, (err, result) => {
        if (err) {
          reject('Failed to parse XML.'); return;
        }

        // find the result pod
        const firstResult = _.find(result.queryresult.pod, (pod) => pod.$.id === 'Result');

        if (!firstResult) {
          reject("Didn't find any result"); return;
        }
        const textResponse = _.get(firstResult, 'subpod[0].plaintext[0]');
        if (!textResponse) {
          reject('Failed to parse result.'); return;
        }
        resolve(textResponse);
      });
    });
  });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('extension.wolfram', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return; // No open text editor
    }

    if (editor.selections.length > 1) {
      vscode.window.showInformationMessage('Multi-cursor selection not supported.');
      return;
    }
      
    const selection = editor.selection;
    let text = editor.document.getText(selection);
      
    if (!text.length) {
      text = editor.document.lineAt(selection.start.line).text;
      if (!text.trim().length) {
        vscode.window.showInformationMessage('No text selected.');
        return;
      }
    }

    makeWolframQuery(text)
      .then((result) => {
        editor.edit((textEditor) => {
          textEditor.insert(selection.end, `\n${result}`);
        }).then((didApply) => {
          if (!didApply) {
            vscode.window.showInformationMessage('Failed to insert result.');
            return;
          }
        });
      }).catch(vscode.window.showInformationMessage);
  });
  context.subscriptions.push(disposable);
}

exports.activate = activate;
exports.makeWolframQuery = makeWolframQuery;
