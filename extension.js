const vscode = require('vscode');
const fs = require('fs');

let dcuTerminal, ccwTerminal, pushOnSave = false;

function getNode() {

  const path = vscode.workspace.rootPath + '/.ccc/config.json';
  let node = 'Not Connected';

  try {
    const config = require(path);

    node = config.node;
  }
  catch (e) {
    console.error(e);
  }

  return node;
}

const node = getNode();

function openNode() {
  vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(getNode()));
}

function createStatusBar() {

  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 210);
  status.text = "OCC";
  status.tooltip = "OCC Devtools Active - Connected to " + node;
  status.command = "extension.openNode";
  
  const grab = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 209);
  grab.text = "$(cloud-download)";
  grab.tooltip = "DCU Grab";
  grab.command = "extension.doGrab";
  
  const push = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 208);
  push.text = "$(cloud-upload)";
  push.tooltip = "DCU Push Current File";
  push.command = "extension.doPush";

  const create = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 207);
  create.text = "$(file-code)";;
  create.tooltip = "CCW Create Widget";
  create.command = "extension.createWidget";

  status.show();
  grab.show();
  push.show();
  create.show();
}

function doPush(pArgs) {

  if (!dcuTerminal) {
    dcuTerminal = vscode.window.createTerminal('DCU Output');
  }

  const path = pArgs.path;

  if (path) {
    if (path.indexOf(vscode.workspace.rootPath) > -1){
      dcuTerminal.show(true);
      
      const stats = fs.lstatSync(path);
  
      if (stats.isDirectory()) {
        dcuTerminal.sendText(`dcu -n ${node} -m "${path}"`);
      }
      else if (stats.isFile()) {
        dcuTerminal.sendText(`dcu -n ${node} -t "${path}"`);
      }
  
      // Display a message box to the user
      vscode.window.setStatusBarMessage("Pushing code with DCU.", 3000);
    }
   
  }

}

function doGrab() {

  if (!dcuTerminal) {
    dcuTerminal = vscode.window.createTerminal('DCU Output');
  }

  dcuTerminal.show(true);
  dcuTerminal.sendText(`dcu -n ${node} -g`);

  vscode.window.setStatusBarMessage("Grabbing code with DCU.", 5000);
}

function createWidget() {

  if (!ccwTerminal) {
    ccwTerminal = vscode.window.createTerminal('CCW Output');
  }

  ccwTerminal.show();
  ccwTerminal.sendText(`ccw -n ${node} -w`);
}

function activate(context) {
  
  let pushCommand = vscode.commands.registerCommand('extension.doPush', function (pArgs) {
    if (pArgs) {
      doPush(pArgs);
    }
    else {
      const activeEditor = vscode.window.activeTextEditor;

      if (activeEditor) {
        const activeDoc = activeEditor.document;

        if (activeDoc) {
          doPush({
            path: activeDoc.fileName
          });
        }
      }
      else {
        vscode.window.showWarningMessage("No file selected, please open a file or use this command from the explorer context menu.");
      }
      
    }
  });

  context.subscriptions.push(pushCommand);

  let grabCommand = vscode.commands.registerCommand('extension.doGrab', function () {
    doGrab();
  });

  context.subscriptions.push(grabCommand);

  let createWidgetCommand = vscode.commands.registerCommand('extension.createWidget', function() {
    createWidget();
  });

  context.subscriptions.push(createWidgetCommand);

  let openNodeCommand = vscode.commands.registerCommand('extension.openNode', function() {
    openNode();
  });

  context.subscriptions.push(openNodeCommand);

  createStatusBar();

  pushOnSave = vscode.workspace.getConfiguration("occ").get('pushOnSave');

  vscode.workspace.onDidChangeConfiguration(function() {
    pushOnSave = vscode.workspace.getConfiguration("occ").get('pushOnSave');
  });

  vscode.workspace.onDidSaveTextDocument(function(doc) {
    if (pushOnSave == true) {
      doPush({ path: doc.fileName });
    }
  });
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

exports.deactivate = deactivate;