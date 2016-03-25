# wolfram-vscode-plugin
Wolfram|alpha plugin for VSCode


# README
Wolfram|alpha extension for Visual Studio Code. This extension only supports the plaintext reply from the Result pod. And you must have a Wolfram|alpha developer account. 

## Developer setup
* run npm install inside the `wolfram` folder

## Installation
A full guide how to install extentions can be found on the official VS code [site](https://code.visualstudio.com/docs/extensions/install-extension). But the short version is. Install Visual Studio Code. In the command palette ( `Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) select  Install Extension  and choose Wolfram. 

In order for the plugin to work you must sign up for a free Wolfram|Alpha developer account [Here](http://products.wolframalpha.com/api/). The app_id should then be added to the VS Code user settings. `File -> Setting -> User Setting` 
```json
{
	"wolfram.app_id":"XXXXXX-XXXXXXXXXX"
}     
```

## Usage
Select the text representing the query, press F1 and the run command wolfram. The result from the query will be inserted on the next row in the editor. If no text is select the entire line will be used as input.

## License
[MIT](LICENSE)

