import * as vscode from 'vscode';
import { getHelpieResponse } from './main';

// Helper function to validate response
function isCompleteResponse(response: string): boolean {
    // Check for common indicators of incomplete responses
    const incompleteMarkers = [
        // Code blocks that aren't closed
        response.split('```').length % 2 === 0,
        // Sentences ending abruptly
        response.endsWith('...'),
        // Unclosed parentheses/brackets
        (response.match(/\(/g) || []).length !== (response.match(/\)/g) || []).length,
        (response.match(/\{/g) || []).length !== (response.match(/\}/g) || []).length,
    ];

    return !incompleteMarkers.some(marker => marker);
}

async function typeTextInEditor(editor: vscode.TextEditor, text: string) {
    for (let i = 0; i < text.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 10));
        editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, text[i]);
        });
    }
}

async function handleUserInput() {
    const prompt = await vscode.window.showInputBox({
        prompt: "Please enter your prompt"
    });

    if (prompt === undefined) {
        return;
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const document = editor.document;
    const currentContent = document.getText();
    const loadingMessage = 'Fetching response...';

    // Clear the editor content
    const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(currentContent.length)
    );

    await editor.edit(editBuilder => {
        editBuilder.delete(fullRange);
    });

    editor.edit(editBuilder => {
        editBuilder.insert(new vscode.Position(0, 0), loadingMessage);
    });

    try {
        // Fetch response from helpie
        let response = await getHelpieResponse(`${prompt}\n\nCurrent Content:\n${currentContent}`);
        
        // Add a delay to ensure response is complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Validate response
        if (!isCompleteResponse(response)) {
            // If response seems incomplete, try to fetch again or show error
            vscode.window.showWarningMessage('Response may be incomplete. Please try again.');
            return;
        }

        // Remove loading message
        const loadingMessageLength = loadingMessage.length;
        await editor.edit(editBuilder => {
            editBuilder.delete(
                new vscode.Range(
                    new vscode.Position(0, 0),
                    new vscode.Position(0, loadingMessageLength)
                )
            );
        });

        // Simulate typing effect
        await typeTextInEditor(editor, response);
        vscode.window.showInformationMessage('Response fetched and displayed successfully!');

    } catch (error) {
        vscode.window.showErrorMessage(`Error fetching response: ${error}`);
        // Clean up loading message if there's an error
        editor.edit(editBuilder => {
            editBuilder.delete(
                new vscode.Range(
                    new vscode.Position(0, 0),
                    new vscode.Position(0, loadingMessage.length)
                )
            );
        });
    }
}

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('extension.getAIPoweredResponse', async () => {
        await handleUserInput();
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}