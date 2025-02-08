import * as vscode from 'vscode';
import { getHelpieResponse } from './main';


async function typeTextInEditor(editor: vscode.TextEditor, text: string) {
    for (let i = 0; i < text.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)); // Adjust the delay as needed
        editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, text[i]);
        });
    }
}


async function handleUserInput() {
    const prompt = await vscode.window.showInputBox({
        prompt: "Please enter your prompt"
    });

    // If user cancels the input
    if (prompt === undefined) {
        return;
    }

    // Get active text editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    // You can add more logic here to handle the input and editor
    // For example, insert the prompt into the active editor
    const loadingMessage = 'Fetching response...';
    const position = editor.selection.active;

    editor.edit(editBuilder => {
        editBuilder.insert(position, loadingMessage);
    });

	// Fetch response from helpie
	const response = await getHelpieResponse(prompt);

	// Remove loading message
	const loadingMessageLength = loadingMessage.length;
	editor.edit(editBuilder => {
		editBuilder.delete(
			new vscode.Range(
				editor.selection.active.translate(0, -loadingMessageLength),
				editor.selection.active
			)
		);
	});

	// simulate typing effect
	await typeTextInEditor(editor, response);

	// display completion
	vscode.window.showInformationMessage('Response fetched and displayed successfully!');
}

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('extension.getAIPoweredResponse', async () => {
		await handleUserInput();
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}