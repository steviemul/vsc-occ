const vscode = require('vscode');
let dcuTerminal;

function doPush(pArgs) {

  const path = pArgs.path;

  if (path) {
    dcuTerminal.show(true);

    dcuTerminal.sendText(`dcu -m "${path}"`);

    // Display a message box to the user
    vscode.window.showInformationMessage('Pushing code with DCU.');
  }

}

function doGrab() {
  dcuTerminal.show(true);
  dcuTerminal.sendText('dcu -g')

  vscode.window.showInformationMessage('Grabbing code with DCU.');
}

function activate(context) {

  dcuTerminal = vscode.window.createTerminal('DCU Output')

  let pushCommand = vscode.commands.registerCommand('extension.doPush', function (pArgs) {
    // The code you place here will be executed every time your command is executed

    if (pArgs) {
      doPush(pArgs);
    }
  });

  context.subscriptions.push(pushCommand);

  let grabCommand = vscode.commands.registerCommand('extension.doGrab', function () {
    doGrab();
  });

  context.subscriptions.push(grabCommand);
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;