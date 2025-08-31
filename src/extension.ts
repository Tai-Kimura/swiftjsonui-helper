import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const commonAttributes = [
	'id', 'type', 'include', 'style', 'propertyName', 'binding', 'binding_id', 'binding_group', 'tag',
	'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight', 'widthWeight', 'heightWeight',
	'aspectWidth', 'aspectHeight', 'weight', 'rect', 'frame',
	'margins', 'leftMargin', 'rightMargin', 'topMargin', 'bottomMargin',
	'minLeftMargin', 'minRightMargin', 'minTopMargin', 'minBottomMargin',
	'maxLeftMargin', 'maxRightMargin', 'maxTopMargin', 'maxBottomMargin',
	'paddings', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
	'leftPadding', 'rightPadding', 'padding',
	'centerInParent', 'centerVertical', 'centerHorizontal',
	'alignTop', 'alignBottom', 'alignLeft', 'alignRight',
	'alignTopOfView', 'alignBottomOfView', 'alignLeftOfView', 'alignRightOfView',
	'alignTopView', 'alignBottomView', 'alignLeftView', 'alignRightView',
	'alignCenterVerticalView', 'alignCenterHorizontalView',
	'background', 'tapBackground', 'cornerRadius', 'borderColor', 'borderWidth',
	'alpha', 'opacity', 'shadow', 'clipToBounds',
	'visibility', 'hidden', 'userInteractionEnabled', 'onclick', 'onClick',
	'onLongPress', 'onPinch', 'onPan', 'canTap',
	'compressHorizontal', 'compressVertical', 'hugHorizontal', 'hugVertical',
	'indexBelow', 'indexAbove'
];

const componentProperties: { [key: string]: string[] } = {
	'View': [...commonAttributes, 'child', 'orientation', 'direction', 'data', 'variables', 'shared_data',
		'bindingScript', 'gravity', 'alignment', 'distribution', 'spacing', 'highlightBackground',
		'highlighted', 'events', 'touchDisabledState', 'touchEnabledViewIds'],
	'SafeAreaView': [...commonAttributes, 'child', 'orientation', 'direction', 'data', 'variables', 'shared_data',
		'bindingScript', 'gravity', 'alignment', 'distribution', 'spacing', 'highlightBackground',
		'highlighted', 'events', 'touchDisabledState', 'touchEnabledViewIds', 'safeAreaInsetPositions'],
	'Button': [...commonAttributes, 'text', 'font', 'fontSize', 'fontColor', 'hilightColor',
		'disabledFontColor', 'disabledBackground', 'enabled', 'image', 'config'],
	'Label': [...commonAttributes, 'text', 'font', 'fontSize', 'fontColor', 'edgeInset', 'lines',
		'lineBreakMode', 'textAlign', 'underline', 'strikethrough', 'lineHeightMultiple',
		'textShadow', 'partialAttributes', 'highlightAttributes', 'highlightColor',
		'hintAttributes', 'hintColor', 'autoShrink', 'minimumScaleFactor', 'linkable', 'hint'],
	'TextField': [...commonAttributes, 'text', 'font', 'fontSize', 'fontColor', 'hint', 'hintFont',
		'hintFontSize', 'hintColor', 'fieldPadding', 'textAlign', 'borderStyle', 'input',
		'returnKeyType', 'onTextChange', 'secure', 'accessoryBackground', 'accessoryTextColor', 'doneText'],
	'TextView': [...commonAttributes, 'text', 'font', 'fontSize', 'fontColor', 'hint', 'hintFont',
		'hintColor', 'hideOnFocused', 'flexible', 'containerInset', 'returnKeyType'],
	'Image': [...commonAttributes, 'src', 'srcName', 'highlightSrc', 'contentMode'],
	'NetworkImage': [...commonAttributes, 'src', 'url', 'defaultImage', 'errorImage', 'loadingImage', 'contentMode'],
	'CircleImage': [...commonAttributes, 'src', 'url', 'defaultImage', 'errorImage', 'loadingImage', 'contentMode'],
	'Scroll': [...commonAttributes, 'child', 'showsHorizontalScrollIndicator', 'showsVerticalScrollIndicator',
		'maxZoom', 'minZoom', 'paging', 'bounces', 'scrollEnabled', 'contentInsetAdjustmentBehavior'],
	'ScrollView': [...commonAttributes, 'child', 'showsHorizontalScrollIndicator', 'showsVerticalScrollIndicator',
		'maxZoom', 'minZoom', 'paging', 'bounces', 'scrollEnabled', 'contentInsetAdjustmentBehavior'],
	'Table': [...commonAttributes, 'child', 'background', 'showsHorizontalScrollIndicator', 
		'showsVerticalScrollIndicator', 'maxZoom', 'minZoom', 'paging', 'bounces', 'scrollEnabled',
		'contentInsetAdjustmentBehavior'],
	'Collection': [...commonAttributes, 'child', 'showsHorizontalScrollIndicator', 'showsVerticalScrollIndicator',
		'paging', 'horizontalScroll', 'insets', 'insetHorizontal', 'insetVertical', 'columnSpacing',
		'lineSpacing', 'contentInsetAdjustmentBehavior', 'contentInsets', 'itemWeight', 'layout',
		'cellClasses', 'headerClasses', 'footerClasses', 'setTargetAsDelegate', 'setTargetAsDataSource'],
	'Switch': [...commonAttributes, 'tint', 'onValueChange', 'checked'],
	'Slider': [...commonAttributes, 'tintColor', 'value', 'minimum', 'maximum'],
	'Progress': [...commonAttributes, 'tintColor', 'progress'],
	'Indicator': [...commonAttributes, 'indicatorStyle', 'color', 'hidesWhenStopped'],
	'Check': [...commonAttributes, 'label', 'src', 'onSrc', 'checked'],
	'Radio': [...commonAttributes, 'text', 'font', 'fontSize', 'fontColor', 'icon', 'selected_icon', 'group', 'checked'],
	'Segment': [...commonAttributes, 'items', 'enabled', 'tintColor', 'normalColor', 'selectedColor',
		'valueChange', 'selectedIndex'],
	'SelectBox': [...commonAttributes, 'items', 'caretAttributes', 'dividerAttributes', 'labelAttributes',
		'selectItemType', 'datePickerMode', 'canBack', 'prompt', 'includePromptWhenDataBinding',
		'dateStringFormat', 'selectedDate', 'maximumDate', 'minimumDate', 'selectedIndex',
		'datePickerStyle', 'minuteInterval'],
	'IconLabel': [...commonAttributes, 'text', 'font', 'fontSize', 'fontColor', 'textShadow',
		'selectedFontColor', 'icon_on', 'icon_off', 'iconPosition', 'iconMargin'],
	'GradientView': [...commonAttributes, 'child', 'gradient', 'gradientDirection', 'locations'],
	'Blur': [...commonAttributes, 'child', 'effectStyle'],
	'CircleView': [...commonAttributes, 'child'],
	'Web': [...commonAttributes, 'url', 'html', 'allowsBackForwardNavigationGestures', 'allowsLinkPreview']
};

const templates = {
	view: {
		"type": "View",
		"id": "container_view",
		"width": "matchParent",
		"height": "wrapContent",
		"paddings": 16,
		"background": "#FFFFFF",
		"child": []
	},
	label: {
		"type": "Label",
		"id": "text_label",
		"text": "Hello SwiftJsonUI",
		"fontSize": 18,
		"fontColor": "#000000",
		"textAlign": "Center",
		"width": "wrapContent",
		"height": "wrapContent"
	},
	button: {
		"type": "Button",
		"id": "action_button",
		"text": "Click Me",
		"onClick": "@{buttonAction}",
		"background": "#007AFF",
		"fontColor": "#FFFFFF",
		"cornerRadius": 8,
		"width": "matchParent",
		"height": 44
	},
	textField: {
		"type": "TextField",
		"id": "input_field",
		"hint": "Enter text here",
		"text": "@{inputText}",
		"fontSize": 16,
		"fontColor": "#000000",
		"width": "matchParent",
		"height": 44
	},
	image: {
		"type": "Image",
		"id": "image_view",
		"src": "image_name",
		"contentMode": "AspectFit",
		"width": "matchParent",
		"height": 200
	},
	scrollView: {
		"type": "ScrollView",
		"id": "scroll_container",
		"width": "matchParent",
		"height": "matchParent",
		"showsVerticalScrollIndicator": true,
		"child": []
	},
	safeAreaView: {
		"type": "SafeAreaView",
		"id": "safe_container",
		"width": "matchParent",
		"height": "matchParent",
		"background": "#FFFFFF",
		"child": []
	},
	safeAreaScrollView: {
		"type": "SafeAreaView",
		"id": "safe_container",
		"width": "matchParent",
		"height": "matchParent",
		"background": "#FFFFFF",
		"child": [
			{
				"type": "Scroll",
				"id": "scroll_container",
				"width": "matchParent",
				"height": "matchParent",
				"child": [
					{
						"type": "View",
						"id": "content_view",
						"orientation": "vertical",
						"width": "matchParent",
						"height": "wrapContent",
						"child": []
					}
				]
			}
		]
	},
	switch: {
		"type": "Switch",
		"id": "toggle_switch",
		"checked": "@{isEnabled}",
		"onValueChange": "@{onSwitchChange}",
		"width": "wrapContent",
		"height": "wrapContent"
	},
	collection: {
		"type": "Collection",
		"id": "collection_view",
		"width": "matchParent",
		"height": "matchParent",
		"columnSpacing": 10,
		"lineSpacing": 10,
		"cellClasses": [],
		"headerClasses": [],
		"footerClasses": [],
		"sections": "@{}",
		"child": []
	}
};

/**
 * Collects JSON file names from the same directory
 * @param documentUri The URI of the current document
 * @returns Array of JSON file names without extension
 */
function collectJsonFiles(documentUri: vscode.Uri): string[] {
	const fileNames: string[] = [];
	
	try {
		const dirPath = path.dirname(documentUri.fsPath);
		console.log('[collectJsonFiles] Looking for JSON files in:', dirPath);
		
		const files = fs.readdirSync(dirPath);
		
		for (const file of files) {
			if (file.endsWith('.json') || file.endsWith('.swiftjsonui.json')) {
				// Remove extension(s)
				const nameWithoutExt = file.replace(/\.swiftjsonui\.json$|\.json$/, '');
				// Don't include the current file
				const currentFileName = path.basename(documentUri.fsPath).replace(/\.swiftjsonui\.json$|\.json$/, '');
				if (nameWithoutExt !== currentFileName) {
					fileNames.push(nameWithoutExt);
					console.log('[collectJsonFiles] Found JSON file:', nameWithoutExt);
				}
			}
		}
	} catch (error) {
		console.error('Error collecting JSON files:', error);
	}
	
	console.log('[collectJsonFiles] Returning file names:', fileNames);
	return fileNames;
}

/**
 * Loads the string.json file from Layouts/Resources directory
 * @param documentUri The URI of the current document
 * @returns The parsed string.json content or null if not found
 */
function loadStringJson(documentUri: vscode.Uri): any | null {
	try {
		const filePath = documentUri.fsPath;
		
		// Find the Layouts directory
		let currentDir = path.dirname(filePath);
		let layoutsDir = null;
		
		// Search up the directory tree for Layouts folder
		while (currentDir && currentDir !== path.dirname(currentDir)) {
			if (path.basename(currentDir) === 'Layouts') {
				layoutsDir = currentDir;
				break;
			}
			// Check if Layouts exists as a subdirectory
			const layoutsPath = path.join(currentDir, 'Layouts');
			if (fs.existsSync(layoutsPath) && fs.statSync(layoutsPath).isDirectory()) {
				layoutsDir = layoutsPath;
				break;
			}
			currentDir = path.dirname(currentDir);
		}
		
		if (!layoutsDir) {
			console.log('[loadStringJson] Layouts directory not found');
			return null;
		}
		
		const stringJsonPath = path.join(layoutsDir, 'Resources', 'string.json');
		console.log('[loadStringJson] Looking for string.json at:', stringJsonPath);
		
		if (fs.existsSync(stringJsonPath)) {
			const content = fs.readFileSync(stringJsonPath, 'utf8');
			return JSON.parse(content);
		}
	} catch (error) {
		console.error('Error loading string.json:', error);
	}
	
	return null;
}

/**
 * Loads color files from Layouts/Resources directory
 * @param documentUri The URI of the current document
 * @returns Object containing colors from both colors.json and defined_colors.json
 */
function loadColorFiles(documentUri: vscode.Uri): { colors: any | null, definedColors: any | null } {
	const result = { colors: null, definedColors: null };
	
	try {
		const filePath = documentUri.fsPath;
		
		// Find the Layouts directory
		let currentDir = path.dirname(filePath);
		let layoutsDir = null;
		
		// Search up the directory tree for Layouts folder
		while (currentDir && currentDir !== path.dirname(currentDir)) {
			if (path.basename(currentDir) === 'Layouts') {
				layoutsDir = currentDir;
				break;
			}
			// Check if Layouts exists as a subdirectory
			const layoutsPath = path.join(currentDir, 'Layouts');
			if (fs.existsSync(layoutsPath) && fs.statSync(layoutsPath).isDirectory()) {
				layoutsDir = layoutsPath;
				break;
			}
			currentDir = path.dirname(currentDir);
		}
		
		if (!layoutsDir) {
			console.log('[loadColorFiles] Layouts directory not found');
			return result;
		}
		
		// Load colors.json
		const colorsPath = path.join(layoutsDir, 'Resources', 'colors.json');
		if (fs.existsSync(colorsPath)) {
			const content = fs.readFileSync(colorsPath, 'utf8');
			result.colors = JSON.parse(content);
			console.log('[loadColorFiles] Loaded colors.json');
		}
		
		// Load defined_colors.json
		const definedColorsPath = path.join(layoutsDir, 'Resources', 'defined_colors.json');
		if (fs.existsSync(definedColorsPath)) {
			const content = fs.readFileSync(definedColorsPath, 'utf8');
			result.definedColors = JSON.parse(content);
			console.log('[loadColorFiles] Loaded defined_colors.json');
		}
	} catch (error) {
		console.error('Error loading color files:', error);
	}
	
	return result;
}

/**
 * Gets the relative path from Layouts directory to determine context
 * @param documentUri The URI of the current document
 * @returns The relative path parts (e.g., ['main'] or ['screens', 'home'])
 */
function getLayoutContext(documentUri: vscode.Uri): string[] {
	try {
		const filePath = documentUri.fsPath;
		const fileName = path.basename(filePath).replace(/\.swiftjsonui\.json$|\.json$/, '');
		
		// Find the Layouts directory
		let currentDir = path.dirname(filePath);
		let layoutsDir = null;
		let relativePath = [];
		
		// Build relative path while searching for Layouts
		while (currentDir && currentDir !== path.dirname(currentDir)) {
			const dirName = path.basename(currentDir);
			
			if (dirName === 'Layouts') {
				layoutsDir = currentDir;
				break;
			}
			
			relativePath.unshift(dirName);
			currentDir = path.dirname(currentDir);
		}
		
		if (layoutsDir) {
			// Add the file name at the end
			relativePath.push(fileName);
			
			// If file is directly in Layouts, return just the filename
			if (relativePath.length === 1) {
				return [fileName];
			}
			
			// Otherwise return the subdirectory path
			return relativePath;
		}
	} catch (error) {
		console.error('Error getting layout context:', error);
	}
	
	return [];
}

/**
 * Collects all sibling IDs from the same hierarchy level
 * @param text The full document text
 * @param currentPos The current cursor position in the document
 * @returns Array of IDs from sibling components
 */
function collectSiblingIds(text: string, currentPos: number): string[] {
	const ids: string[] = [];
	
	console.log('[collectSiblingIds] Starting search from position:', currentPos);
	
	try {
		// More flexible approach: find the nearest "child": [ structure
		let childArrayStart = -1;
		let childArrayEnd = -1;
		
		// Search backwards for "child" array that contains our position
		for (let i = currentPos; i >= 0; i--) {
			if (i >= 7) {
				const substr = text.substring(i - 7, i);
				if (substr === '"child"') {
					// Found "child", now find the array start
					let j = i;
					while (j < text.length && text[j] !== '[') {
						j++;
						if (j - i > 20) break; // Safety limit
					}
					if (text[j] === '[') {
						// Check if our position is inside this array
						let depth = 1;
						let k = j + 1;
						while (k < text.length && depth > 0) {
							if (text[k] === '[') depth++;
							else if (text[k] === ']') depth--;
							k++;
						}
						
						if (k > currentPos) {
							// We're inside this child array
							childArrayStart = j;
							childArrayEnd = k - 1;
							console.log('[collectSiblingIds] Found child array:', childArrayStart, '-', childArrayEnd);
							break;
						}
					}
				}
			}
		}
		
		if (childArrayStart === -1) {
			console.log('[collectSiblingIds] No parent child array found');
			return ids;
		}
		
		// Extract the array content
		const arrayContent = text.substring(childArrayStart, childArrayEnd + 1);
		console.log('[collectSiblingIds] Processing array of length:', arrayContent.length);
		
		// Parse the array to find direct child objects only
		let pos = 0;
		let depth = 0;
		let inString = false;
		let escapeNext = false;
		
		while (pos < arrayContent.length) {
			const char = arrayContent[pos];
			
			if (escapeNext) {
				escapeNext = false;
				pos++;
				continue;
			}
			
			if (char === '\\') {
				escapeNext = true;
				pos++;
				continue;
			}
			
			if (char === '"' && !escapeNext) {
				inString = !inString;
				pos++;
				continue;
			}
			
			if (!inString) {
				if (char === '[') {
					depth++;
				} else if (char === ']') {
					depth--;
				} else if (char === '{' && depth === 1) {
					// Found a direct child object at the top level of our array
					let objStart = pos;
					let objDepth = 1;
					let objPos = pos + 1;
					
					// Find the end of this object
					while (objPos < arrayContent.length && objDepth > 0) {
						const objChar = arrayContent[objPos];
						
						if (objChar === '"' && !escapeNext) {
							inString = !inString;
						} else if (!inString) {
							if (objChar === '{') objDepth++;
							else if (objChar === '}') objDepth--;
						}
						
						if (objChar === '\\') escapeNext = true;
						else escapeNext = false;
						
						objPos++;
					}
					
					// Extract just this object
					const objContent = arrayContent.substring(objStart, objPos);
					
					// Find only the direct ID of this object (not nested IDs)
					// Look for the first "id" property that's not inside a nested object/array
					const lines = objContent.split('\n');
					for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
						const line = lines[lineIdx];
						// Check if this line contains an ID property at the root level
						const idMatch = line.match(/^\s*"id"\s*:\s*"([^"]+)"/);
						if (idMatch) {
							// Make sure we're not inside a nested structure
							// Count braces/brackets before this line
							const beforeLines = lines.slice(0, lineIdx).join('\n');
							let nestLevel = 0;
							for (const ch of beforeLines) {
								if (ch === '{' || ch === '[') nestLevel++;
								else if (ch === '}' || ch === ']') nestLevel--;
							}
							
							// Only add if at root level of this object (nestLevel === 1 for the object itself)
							if (nestLevel === 1) {
								ids.push(idMatch[1]);
								console.log('[collectSiblingIds] Found sibling ID:', idMatch[1]);
								break; // Only take the first ID
							}
						}
					}
					
					pos = objPos - 1; // Continue after this object
				}
			}
			
			pos++;
		}
		
	} catch (error) {
		console.error('Error collecting sibling IDs:', error);
	}
	
	console.log('[collectSiblingIds] Returning IDs:', ids);
	return ids;
}

export function activate(context: vscode.ExtensionContext) {
	console.log('========================================');
	console.log('SwiftJsonUI Helper v1.7.0 is now active!');
	console.log('Extension loaded at:', new Date().toLocaleTimeString());
	console.log('========================================');
	
	// Show information message when extension activates
	vscode.window.showInformationMessage('SwiftJsonUI Helper v1.7.0 is now active!');

	const jsonCompletionProvider = vscode.languages.registerCompletionItemProvider(
		[
			{ scheme: 'file', pattern: '**/*.json' },
			{ scheme: 'file', pattern: '**/*.swiftjsonui.json' }
		],
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				// Show immediate feedback that autocomplete is triggered
				vscode.window.showInformationMessage(`Autocomplete triggered at line ${position.line + 1}`);
				
				console.log('[Autocomplete] Triggered for:', document.fileName);
				const linePrefix = document.lineAt(position).text.substring(0, position.character);
				console.log('[Autocomplete] Line prefix:', linePrefix);
				
				// Define color-related attributes
				const colorAttributes = [
					'fontColor', 'background', 'borderColor', 'tapBackground', 'tint', 'tintColor', 
					'color', 'highlightColor', 'hintColor', 'hilightColor', 'disabledFontColor', 
					'disabledBackground', 'normalColor', 'selectedColor', 'selectedFontColor', 
					'accessoryBackground', 'accessoryTextColor', 'highlightBackground'
				];
				
				// Check if we're typing a value for color attributes
				const colorMatch = linePrefix.match(new RegExp(`"(${colorAttributes.join('|')})"\\s*:\\s*"([^"@#]*)$`));
				if (colorMatch) {
					const attributeName = colorMatch[1];
					const partialValue = colorMatch[2] || '';
					
					console.log('[Color Autocomplete] Attribute:', attributeName, 'Partial:', partialValue);
					
					// Load color files
					const { colors, definedColors } = loadColorFiles(document.uri);
					const suggestions: vscode.CompletionItem[] = [];
					
					// Add suggestions from colors.json
					if (colors) {
						for (const key in colors) {
							if (key.toLowerCase().startsWith(partialValue.toLowerCase())) {
								const value = colors[key];
								const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Color);
								item.detail = `${value} (from colors.json)`;
								item.insertText = key;
								item.sortText = `0_${key}`;
								item.range = new vscode.Range(
									new vscode.Position(position.line, position.character - partialValue.length),
									position
								);
								suggestions.push(item);
							}
						}
					}
					
					// Add suggestions from defined_colors.json
					if (definedColors) {
						for (const key in definedColors) {
							if (key.toLowerCase().startsWith(partialValue.toLowerCase())) {
								const value = definedColors[key];
								if (value !== null) {
									const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Color);
									item.detail = `${value} (from defined_colors.json)`;
									item.insertText = key;
									item.sortText = `1_${key}`;
									item.range = new vscode.Range(
										new vscode.Position(position.line, position.character - partialValue.length),
										position
									);
									suggestions.push(item);
								}
							}
						}
					}
					
					if (suggestions.length > 0) {
						return suggestions;
					}
				}
				
				// Check if we're typing a value for text/hint/range attributes
				const textHintRangeMatch = linePrefix.match(/"(text|hint|range)"\s*:\s*"([^"@]*)$/);
				if (textHintRangeMatch) {
					const attributeName = textHintRangeMatch[1];
					const partialValue = textHintRangeMatch[2] || '';
					
					console.log('[String Autocomplete] Attribute:', attributeName, 'Partial:', partialValue);
					
					// Load string.json
					const stringJson = loadStringJson(document.uri);
					if (!stringJson) {
						console.log('[String Autocomplete] No string.json found');
						return undefined;
					}
					
					// Get the context path
					const context = getLayoutContext(document.uri);
					console.log('[String Autocomplete] Context:', context);
					
					const suggestions: vscode.CompletionItem[] = [];
					
					// Parse the current partial value to determine where we are in the navigation
					// Use underscore as separator
					const parts = partialValue.split('_');
					const currentPart = parts[parts.length - 1];
					const completedParts = parts.slice(0, -1);
					
					console.log('[String Autocomplete] Parts:', parts, 'Current:', currentPart, 'Completed:', completedParts);
					
					// Navigate through the string.json structure
					let currentObject = stringJson;
					let isValidPath = true;
					
					for (const part of completedParts) {
						if (currentObject && typeof currentObject === 'object' && part in currentObject) {
							currentObject = currentObject[part];
						} else {
							isValidPath = false;
							break;
						}
					}
					
					if (!isValidPath) {
						return undefined;
					}
					
					// Get suggestions based on current position
					if (completedParts.length === 0) {
						// At the beginning or while typing the first part
						// Show all possible complete paths that match current input
						const addFlattenedSuggestions = (obj: any, prefix: string = '') => {
							for (const key in obj) {
								const value = obj[key];
								const currentPath = prefix ? `${prefix}_${key}` : key;
								
								// Filter by current partial input
								if (!currentPath.toLowerCase().startsWith(partialValue.toLowerCase())) {
									continue;
								}
								
								if (typeof value === 'string') {
									// This is a final value
									const item = new vscode.CompletionItem(currentPath, vscode.CompletionItemKind.Value);
									item.detail = `"${value}"`;
									item.insertText = currentPath;
									item.sortText = currentPath;
									item.range = new vscode.Range(
										new vscode.Position(position.line, position.character - partialValue.length),
										position
									);
									suggestions.push(item);
								} else if (typeof value === 'object' && !Array.isArray(value)) {
									// This is a nested object, recurse
									addFlattenedSuggestions(value, currentPath);
								}
							}
						};
						
						// Add all paths from string.json
						for (const key in stringJson) {
							const value = stringJson[key];
							if (typeof value === 'object' && !Array.isArray(value)) {
								addFlattenedSuggestions(value, key);
							} else if (typeof value === 'string' && key.toLowerCase().startsWith(partialValue.toLowerCase())) {
								// Top-level string value
								const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Value);
								item.detail = `"${value}"`;
								item.insertText = key;
								item.range = new vscode.Range(
									new vscode.Position(position.line, position.character - partialValue.length),
									position
								);
								suggestions.push(item);
							}
						}
					} else if (completedParts.length > 0 && currentPart === '' && currentObject && typeof currentObject === 'object') {
						// After any completed part with underscore (e.g., "main_", "screens_", etc.)
						// Suggest keys from the current object level
						for (const key in currentObject) {
							const value = currentObject[key];
							const item = new vscode.CompletionItem(key, 
								typeof value === 'object' ? vscode.CompletionItemKind.Module : vscode.CompletionItemKind.Value
							);
							
							if (typeof value === 'string') {
								item.detail = `"${value}"`;
							} else if (typeof value === 'object' && !Array.isArray(value)) {
								item.detail = 'String resource group';
							}
							
							// Build the complete path
							const fullPath = completedParts.join('_') + '_' + key;
							
							if (typeof value === 'object' && !Array.isArray(value)) {
								item.insertText = fullPath + '_';
							} else {
								item.insertText = fullPath;
							}
							
							item.filterText = key;
							item.range = new vscode.Range(
								new vscode.Position(position.line, position.character - partialValue.length),
								position
							);
							
							suggestions.push(item);
						}
					} else if (currentObject && typeof currentObject === 'object') {
						// Suggest keys from current object level
						for (const key in currentObject) {
							if (key.toLowerCase().startsWith(currentPart.toLowerCase())) {
								const value = currentObject[key];
								const item = new vscode.CompletionItem(key, 
									typeof value === 'object' ? vscode.CompletionItemKind.Module : vscode.CompletionItemKind.Value
								);
								
								if (typeof value === 'string') {
									item.detail = `"${value}"`;
								} else if (typeof value === 'object' && !Array.isArray(value)) {
									item.detail = 'String resource group';
								}
								
								// Build the complete path
								const fullPath = completedParts.length > 0 
									? completedParts.join('_') + '_' + key
									: key;
								
								if (typeof value === 'object' && !Array.isArray(value)) {
									item.insertText = fullPath + '_';
								} else {
									item.insertText = fullPath;
								}
								
								item.filterText = key;
								item.range = new vscode.Range(
									new vscode.Position(position.line, position.character - partialValue.length),
									position
								);
								
								suggestions.push(item);
							}
						}
					}
					
					return suggestions;
				}
				
				// PRIORITY 1: Check if we're inside @{} for data binding suggestions
				const insideBindingMatch = linePrefix.match(/"[^"]*@\{([^}]*)$/);
				if (insideBindingMatch) {
					const partialName = insideBindingMatch[1];
					const text = document.getText();
					
					// Find all data names in the current JSON
					const dataNames: string[] = [];
					
					// Look for data arrays and extract names
					const dataBlockRegex = /"data"\s*:\s*\[([\s\S]*?)\](?=\s*[,}])/g;
					let dataMatch;
					
					while ((dataMatch = dataBlockRegex.exec(text)) !== null) {
						const dataContent = dataMatch[1];
						// Extract name values from the data array
						const nameRegex = /"name"\s*:\s*"([^"]+)"/g;
						let nameMatch;
						
						while ((nameMatch = nameRegex.exec(dataContent)) !== null) {
							const name = nameMatch[1];
							if (!dataNames.includes(name)) {
								dataNames.push(name);
							}
						}
					}
					
					// Also look for include files and their data
					const includeRegex = /"include"\s*:\s*"([^"]+)"/g;
					const hasIncludes = includeRegex.test(text);
					if (hasIncludes) {
						// For now, just add common variable names from includes
						if (!dataNames.includes('data')) dataNames.push('data');
						if (!dataNames.includes('items')) dataNames.push('items');
						if (!dataNames.includes('sections')) dataNames.push('sections');
					}
					
					// Return filtered suggestions based on partial input
					const filteredNames = dataNames
						.filter(name => name.toLowerCase().startsWith(partialName.toLowerCase()));
					
					return filteredNames.map(name => {
						const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Variable);
						item.detail = `Data binding variable`;
						// Simply insert the full name, let VSCode handle the rest
						item.insertText = name;
						item.filterText = name;
						return item;
					});
				}
				
				// PRIORITY 2: Check if we're typing @ inside a string value for data binding
				const bindingMatch = linePrefix.match(/"[^"]*@$/);
				if (bindingMatch) {
					const item = new vscode.CompletionItem('{', vscode.CompletionItemKind.Snippet);
					item.detail = 'SwiftJsonUI data binding';
					item.insertText = new vscode.SnippetString('{\${1:variableName}}');
					return [item];
				}
				
				// Check if we're editing/deleting a property name
				// Also match after { like {"i
				const propertyEditMatch = linePrefix.match(/(?:^\s*|{\s*)"(\w*)$/);
				if (propertyEditMatch) {
					const partialProp = propertyEditMatch[1];
					const text = document.getText();
					const currentPos = document.offsetAt(position);
					const beforeText = text.substring(0, currentPos);
					
					// Try to find the current component type
					const typeMatch = beforeText.match(/"type"\s*:\s*"(\w+)"/);
					if (typeMatch) {
						const componentType = typeMatch[1];
						const properties = componentProperties[componentType] || commonAttributes;
						
						// Filter properties that start with the partial text
						return properties
							.filter(prop => prop.toLowerCase().startsWith(partialProp.toLowerCase()))
							.map(prop => {
								const item = new vscode.CompletionItem(prop, vscode.CompletionItemKind.Property);
								item.detail = `SwiftJsonUI property`;
								
								// Check if this is an alignment property that references view IDs
								const alignmentProps = [
									'alignTopOfView', 'alignBottomOfView', 'alignLeftOfView', 'alignRightOfView',
									'alignTopView', 'alignBottomView', 'alignLeftView', 'alignRightView',
									'alignCenterVerticalView', 'alignCenterHorizontalView'
								];
								
								if (alignmentProps.includes(prop)) {
									// For alignment properties, create a snippet that includes quotes and ID selection
									const ids = collectSiblingIds(text, currentPos);
									console.log('[Alignment Property] Processing:', prop, 'Found IDs:', ids);
									
									item.kind = vscode.CompletionItemKind.Snippet;
									item.detail = 'SwiftJsonUI alignment property (inserts ID selection)';
									
									// Check if VS Code will auto-close the quote
									// We need to handle the closing quote that VS Code automatically adds
									let snippetText = `${prop}": `;
									if (ids.length > 0) {
										// Create a choice snippet with available IDs
										snippetText += `"\${1|${ids.join(',')}|}`;
									} else {
										// Just empty quotes with cursor inside
										snippetText += `"\${1:}`;
									}
									
									item.insertText = new vscode.SnippetString(snippetText);
								} else if (prop === 'include') {
									// For include property, create a snippet with JSON file selection
									const jsonFiles = collectJsonFiles(document.uri);
									console.log('[Include Property] Processing, found JSON files:', jsonFiles);
									
									item.kind = vscode.CompletionItemKind.Snippet;
									item.detail = 'Include another JSON file';
									
									let snippetText = `${prop}": `;
									if (jsonFiles.length > 0) {
										// Create a choice snippet with available JSON files
										snippetText += `"\${1|${jsonFiles.join(',')}|}`;
									} else {
										// Just empty quotes with cursor inside
										snippetText += `"\${1:}`;
									}
									
									item.insertText = new vscode.SnippetString(snippetText);
								} else {
									// Regular property - just insert the name
									item.insertText = prop;
								}
								
								item.range = new vscode.Range(
									new vscode.Position(position.line, position.character - partialProp.length),
									position
								);
								return item;
							});
					}
				}
				
				// Check if we're completing a type value
				// Match "type": with optional spaces and optional opening quote
				const typeMatch = linePrefix.match(/"type"\s*:\s*("?)$/);
				if (typeMatch) {
					const hasOpenQuote = typeMatch[1] === '"';
					return Object.keys(componentProperties).map(type => {
						const item = new vscode.CompletionItem(type, vscode.CompletionItemKind.Snippet);
						item.detail = `SwiftJsonUI ${type} component`;
						
						// Create snippet with type, width, and height
						let snippetText = '';
						// Use wrapContent as default for Label
						const defaultWidth = type === 'Label' ? 'wrapContent' : 'matchParent';
						const defaultHeight = type === 'Label' ? 'wrapContent' : 'matchParent';
						
						// Add template-specific properties
						let additionalProps = '';
						switch(type) {
							case 'Collection':
								additionalProps = ',\n\t"cellClasses": [],\n\t"headerClasses": [],\n\t"footerClasses": [],\n\t"sections": "@{}"';
								break;
							case 'ScrollView':
							case 'Scroll':
								additionalProps = ',\n\t"showsVerticalScrollIndicator": true';
								break;
							case 'SafeAreaView':
								additionalProps = ',\n\t"background": "#FFFFFF"';
								break;
							case 'Label':
								additionalProps = ',\n\t"text": "\${3:Hello}",\n\t"fontSize": \${4:16},\n\t"fontColor": "\${5:#000000}"';
								break;
							case 'Button':
								additionalProps = ',\n\t"text": "\${3:Click Me}",\n\t"onClick": "@{\${4:buttonAction}}"';
								break;
							case 'TextField':
								additionalProps = ',\n\t"hint": "\${3:Enter text}",\n\t"text": "@{\${4:inputText}}"';
								break;
							case 'Image':
								additionalProps = ',\n\t"src": "\${3:image_name}",\n\t"contentMode": "\${4|AspectFit,AspectFill,Center|}"';
								break;
							case 'NetworkImage':
							case 'CircleImage':
								additionalProps = ',\n\t"url": "\${3:https://}",\n\t"contentMode": "\${4|AspectFit,AspectFill,Center|}"';
								break;
						}
						
						// Add child array for container components
						const needsChild = ['View', 'SafeAreaView', 'ScrollView', 'Scroll', 'Collection', 'Table', 'GradientView', 'Blur', 'CircleView'];
						if (needsChild.includes(type)) {
							additionalProps += ',\n\t"child": []';
						}
						
						if (hasOpenQuote) {
							// Already have opening quote, don't add quotes
							snippetText = `${type}",\n\t"width": "\${1|${defaultWidth},${defaultWidth === 'wrapContent' ? 'matchParent' : 'wrapContent'}|}",\n\t"height": "\${2|${defaultHeight},${defaultHeight === 'wrapContent' ? 'matchParent' : 'wrapContent'}|}"${additionalProps}`;
						} else {
							// No opening quote, add quotes
							snippetText = `"${type}",\n\t"width": "\${1|${defaultWidth},${defaultWidth === 'wrapContent' ? 'matchParent' : 'wrapContent'}|}",\n\t"height": "\${2|${defaultHeight},${defaultHeight === 'wrapContent' ? 'matchParent' : 'wrapContent'}|}"${additionalProps}`;
						}
						
						item.insertText = new vscode.SnippetString(snippetText);
						item.sortText = `0_${type}`;
						
						// Also provide simple completion without width/height
						const simpleItem = new vscode.CompletionItem(`${type} (simple)`, vscode.CompletionItemKind.Value);
						simpleItem.detail = `Just ${type} without width/height`;
						simpleItem.filterText = type;
						simpleItem.sortText = `1_${type}`;
						if (!hasOpenQuote) {
							simpleItem.insertText = `"${type}"`;
						} else {
							simpleItem.insertText = type;
						}
						
						return [item, simpleItem];
					}).flat();
				}

				// Also match after { like {"
				if (linePrefix.match(/(?:^\s*|{\s*)"$/)) {
					console.log('[Snippet Processing] Entering property completion block');
					const text = document.getText();
					const currentPos = document.offsetAt(position);
					
					const beforeText = text.substring(0, currentPos);
					const typeMatch = beforeText.match(/"type"\s*:\s*"(\w+)"/);
					
					if (typeMatch) {
						const componentType = typeMatch[1];
						const properties = componentProperties[componentType] || commonAttributes;
						console.log('[Snippet Processing] Component type:', componentType);
						console.log('[Snippet Processing] Available properties count:', properties.length);
						
						return properties.map(prop => {
							const item = new vscode.CompletionItem(prop, vscode.CompletionItemKind.Property);
							item.detail = `SwiftJsonUI property`;
							
							// Set the insert text to just the property name
							// VSCode will handle the quotes automatically
							item.insertText = prop;
							
							// Add snippet completion for common properties with values
							const snippetItem = new vscode.CompletionItem(`${prop} (with value)`, vscode.CompletionItemKind.Snippet);
							snippetItem.detail = `SwiftJsonUI property with default value`;
							snippetItem.filterText = prop;
							snippetItem.sortText = `1_${prop}`;
							
							let snippetText = `${prop}": `;
							switch(prop) {
								case 'alignTopOfView':
								case 'alignBottomOfView':
								case 'alignLeftOfView':
								case 'alignRightOfView':
								case 'alignTopView':
								case 'alignBottomView':
								case 'alignLeftView':
								case 'alignRightView':
								case 'alignCenterVerticalView':
								case 'alignCenterHorizontalView':
									// For alignment attributes, create a special snippet that will trigger ID completion
									console.log('[Alignment Snippet] Processing alignment property:', prop);
									const ids = collectSiblingIds(text, currentPos);
									console.log('[Alignment Snippet] Found IDs:', ids);
									if (ids.length > 0) {
										// If there are sibling IDs, create a choice snippet
										snippetText += `"\${1|${ids.join(',')}|}"`;
									} else {
										// If no sibling IDs, just empty quotes with cursor inside
										snippetText += '"\${1:}"';
									}
									break;
								case 'include':
									// For include property, create a snippet with JSON file selection
									console.log('[Include Snippet] Processing include property');
									const jsonFiles = collectJsonFiles(document.uri);
									console.log('[Include Snippet] Found JSON files:', jsonFiles);
									if (jsonFiles.length > 0) {
										// Create a choice snippet with available JSON files
										snippetText += `"\${1|${jsonFiles.join(',')}|}"`;
									} else {
										// Just empty quotes with cursor inside
										snippetText += '"\${1:}"';
									}
									break;
								case 'width':
								case 'height':
									snippetText += '"matchParent"';
									break;
								case 'paddings':
								case 'margins':
									snippetText += '[\${1:0}, \${2:0}, \${3:0}, \${4:0}]';
									break;
								case 'gravity':
									snippetText += '[\${1|top,bottom,centerVertical,left,right,centerHorizontal|}]';
									break;
								case 'partialAttributes':
									snippetText += '[\n\t\t{\n\t\t\t"fontColor": "\${1:#000000}",\n\t\t\t"fontSize": \${2:16},\n\t\t\t"range": [\${3:0}, \${4:5}]\n\t\t}\n\t]';
									break;
								case 'fontSize':
								case 'lines':
								case 'spacing':
								case 'cornerRadius':
								case 'borderWidth':
								case 'minWidth':
								case 'maxWidth':
								case 'minHeight':
								case 'maxHeight':
								case 'widthWeight':
								case 'heightWeight':
								case 'aspectWidth':
								case 'aspectHeight':
								case 'weight':
								case 'leftMargin':
								case 'rightMargin':
								case 'topMargin':
								case 'bottomMargin':
								case 'paddingLeft':
								case 'paddingRight':
								case 'paddingTop':
								case 'paddingBottom':
								case 'tag':
								case 'minimum':
								case 'maximum':
								case 'selectedIndex':
								case 'minuteInterval':
									snippetText += '\${1:0}';
									break;
								case 'alpha':
								case 'opacity':
								case 'progress':
								case 'value':
								case 'minimumScaleFactor':
									snippetText += '\${1:1.0}';
									break;
								case 'fontColor':
								case 'background':
								case 'borderColor':
								case 'tapBackground':
								case 'tint':
								case 'tintColor':
								case 'color':
								case 'highlightColor':
								case 'hintColor':
								case 'hilightColor':
								case 'disabledFontColor':
								case 'disabledBackground':
								case 'normalColor':
								case 'selectedColor':
								case 'selectedFontColor':
								case 'accessoryBackground':
								case 'accessoryTextColor':
									snippetText += '"\${1:#000000}"';
									break;
								case 'text':
								case 'hint':
								case 'src':
								case 'id':
								case 'font':
								case 'hintFont':
								case 'url':
								case 'html':
								case 'doneText':
								case 'prompt':
								case 'dateStringFormat':
								case 'selectedDate':
								case 'maximumDate':
								case 'minimumDate':
								case 'group':
								case 'label':
								case 'icon':
								case 'selected_icon':
								case 'icon_on':
								case 'icon_off':
								case 'onSrc':
								case 'highlightSrc':
								case 'defaultImage':
								case 'errorImage':
								case 'loadingImage':
									snippetText += '"\${1:}"';
									break;
								case 'child':
									snippetText += '[]';
									break;
								case 'enabled':
								case 'hidden':
								case 'userInteractionEnabled':
								case 'checked':
								case 'centerInParent':
								case 'centerVertical':
								case 'centerHorizontal':
								case 'alignTop':
								case 'alignBottom':
								case 'alignLeft':
								case 'alignRight':
								case 'clipToBounds':
								case 'canTap':
								case 'highlighted':
								case 'secure':
								case 'linkable':
								case 'autoShrink':
								case 'flexible':
								case 'hideOnFocused':
								case 'showsHorizontalScrollIndicator':
								case 'showsVerticalScrollIndicator':
								case 'paging':
								case 'bounces':
								case 'scrollEnabled':
								case 'horizontalScroll':
								case 'setTargetAsDelegate':
								case 'setTargetAsDataSource':
								case 'hidesWhenStopped':
								case 'canBack':
								case 'includePromptWhenDataBinding':
								case 'allowsBackForwardNavigationGestures':
								case 'allowsLinkPreview':
									snippetText += '\${1:true}';
									break;
								case 'textAlign':
									snippetText += '"\${1|Left,Center,Right|}"';
									break;
								case 'contentMode':
									snippetText += '"\${1|AspectFit,AspectFill,Center|}"';
									break;
								case 'visibility':
									snippetText += '"\${1|visible,invisible,gone|}"';
									break;
								case 'orientation':
									snippetText += '"\${1|vertical,horizontal|}"';
									break;
								case 'lineBreakMode':
									snippetText += '"\${1|Tail,Word,Char,Clip,Head,Middle|}"';
									break;
								case 'borderStyle':
									snippetText += '"\${1|RoundedRect,Line,Bezel|}"';
									break;
								case 'input':
									snippetText += '"\${1|alphabet,email,password,number,decimal|}"';
									break;
								case 'returnKeyType':
									snippetText += '"\${1|Done,Next,Search,Send,Go,Route,Yahoo,Google|}"';
									break;
								case 'indicatorStyle':
									snippetText += '"\${1|medium,large|}"';
									break;
								case 'effectStyle':
									snippetText += '"\${1|Light,Dark,ExtraLight|}"';
									break;
								case 'gradientDirection':
									snippetText += '"\${1|Vertical,Horizontal,Oblique|}"';
									break;
								case 'iconPosition':
									snippetText += '"\${1|Left,Right,Top,Bottom|}"';
									break;
								case 'contentInsetAdjustmentBehavior':
									snippetText += '"\${1|automatic,always,never,scrollableAxes|}"';
									break;
								case 'datePickerMode':
									snippetText += '"\${1|date,time,datetime,countDown|}"';
									break;
								case 'datePickerStyle':
									snippetText += '"\${1|automatic,wheels,compact,inline|}"';
									break;
								case 'selectItemType':
									snippetText += '"\${1|Normal,Date|}"';
									break;
								case 'items':
								case 'gradient':
								case 'locations':
								case 'data':
								case 'variables':
								case 'touchEnabledViewIds':
								case 'safeAreaInsetPositions':
								case 'cellClasses':
								case 'headerClasses':
								case 'footerClasses':
									snippetText += '[\${1:}]';
									break;
								case 'rect':
									snippetText += '[\${1:0}, \${2:0}, \${3:100}, \${4:100}]';
									break;
								default:
									if (prop.startsWith('on') || prop.endsWith('Click') || prop.endsWith('Change')) {
										snippetText += '"@{\${1:}}"';
									} else {
										snippetText += '"\${1:}"';
									}
							}
							
							snippetItem.insertText = new vscode.SnippetString(snippetText);
							
							// Return both items - property name only and with value
							return [item, snippetItem];
						}).flat();
					}
				}

				// Check for alignment attributes that reference other view IDs
				// Also check for partial input
				const alignmentRefMatch = linePrefix.match(/"(alignTopOfView|alignBottomOfView|alignLeftOfView|alignRightOfView|alignTopView|alignBottomView|alignLeftView|alignRightView|alignCenterVerticalView|alignCenterHorizontalView)"\s*:\s*"([^"]*)?$/);
				if (alignmentRefMatch) {
					console.log('[ID Autocomplete] Alignment attribute detected:', alignmentRefMatch[1]);
					console.log('[ID Autocomplete] Current partial input:', alignmentRefMatch[2] || '');
					
					// Collect IDs from the same hierarchy level
					const text = document.getText();
					const currentPos = document.offsetAt(position);
					const ids = collectSiblingIds(text, currentPos);
					
					console.log('[ID Autocomplete] Found sibling IDs:', ids);
					
					if (ids.length > 0) {
						const partialInput = alignmentRefMatch[2] || '';
						// Filter IDs based on partial input
						const filteredIds = ids.filter(id => 
							id.toLowerCase().startsWith(partialInput.toLowerCase())
						);
						
						return filteredIds.map(id => {
							const item = new vscode.CompletionItem(id, vscode.CompletionItemKind.Reference);
							item.detail = 'View ID at same hierarchy level';
							item.insertText = id;
							item.filterText = id;
							return item;
						});
					}
				}

				// Check for width/height - only show suggestions when not typing data binding
				const widthHeightMatch = linePrefix.match(/"(width|height)"\s*:\s*"$/);
				if (widthHeightMatch) {
					const suggestions = ['matchParent', 'wrapContent'];
					return suggestions.map(value => {
						const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
						item.detail = 'SwiftJsonUI dimension';
						return item;
					});
				}

				if (linePrefix.match(/"textAlign"\s*:\s*"?$/)) {
					const alignments = ['Left', 'Center', 'Right'];
					return alignments.map(value => {
						const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
						item.detail = 'Text alignment';
						return item;
					});
				}

				if (linePrefix.match(/"alignment"\s*:\s*"?$/)) {
					const alignments = ['top', 'center', 'bottom', 'leading', 'trailing', 'centerVertical', 'centerHorizontal'];
					return alignments.map(value => {
						const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
						item.detail = 'Alignment';
						return item;
					});
				}

				if (linePrefix.match(/"contentMode"\s*:\s*"?$/)) {
					const modes = ['AspectFill', 'AspectFit', 'Center'];
					return modes.map(value => {
						const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
						item.detail = 'Content mode';
						return item;
					});
				}

				if (linePrefix.match(/"visibility"\s*:\s*"?$/)) {
					const modes = ['visible', 'invisible', 'gone'];
					return modes.map(value => {
						const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
						item.detail = 'Visibility state';
						return item;
					});
				}

				if (linePrefix.match(/"lineBreakMode"\s*:\s*"?$/)) {
					const modes = ['Char', 'Clip', 'Word', 'Head', 'Middle', 'Tail'];
					return modes.map(value => {
						const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
						item.detail = 'Line break mode';
						return item;
					});
				}

				if (linePrefix.match(/"borderStyle"\s*:\s*"?$/)) {
					const styles = ['RoundedRect', 'Line', 'Bezel'];
					return styles.map(value => {
						const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
						item.detail = 'Border style';
						return item;
					});
				}

				if (linePrefix.match(/"input"\s*:\s*"?$/)) {
					const types = ['alphabet', 'email', 'password', 'number', 'decimal'];
					return types.map(value => {
						const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
						item.detail = 'Keyboard type';
						return item;
					});
				}

				if (linePrefix.match(/"returnKeyType"\s*:\s*"?$/)) {
					const types = ['Done', 'Next', 'Search', 'Send', 'Go', 'Route', 'Yahoo', 'Google'];
					return types.map(value => {
						const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
						item.detail = 'Return key type';
						return item;
					});
				}

				if (linePrefix.match(/"effectStyle"\s*:\s*"?$/)) {
					const styles = ['Light', 'Dark', 'ExtraLight'];
					return styles.map(value => {
						const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
						item.detail = 'Blur effect style';
						return item;
					});
				}

				if (linePrefix.match(/"gradientDirection"\s*:\s*"?$/)) {
					const directions = ['Vertical', 'Horizontal', 'Oblique'];
					return directions.map(value => {
						const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.Value);
						item.detail = 'Gradient direction';
						return item;
					});
				}

				// Check if we're inside a partialAttributes array object
				const text = document.getText();
				const beforeText = text.substring(0, document.offsetAt(position));
				
				// Check if we're inside partialAttributes array
				if (beforeText.includes('"partialAttributes"') && linePrefix.match(/^\s*"$/)) {
					// Find if we're inside a partialAttributes object
					const lastPartialAttrIndex = beforeText.lastIndexOf('"partialAttributes"');
					const textAfterPartialAttr = beforeText.substring(lastPartialAttrIndex);
					
					// Count brackets to see if we're inside the array
					const openBrackets = (textAfterPartialAttr.match(/\[/g) || []).length;
					const closeBrackets = (textAfterPartialAttr.match(/\]/g) || []).length;
					const openBraces = (textAfterPartialAttr.match(/\{/g) || []).length;
					const closeBraces = (textAfterPartialAttr.match(/\}/g) || []).length;
					
					if (openBrackets > closeBrackets && openBraces > closeBraces) {
						// We're inside a partialAttributes object
						const partialAttributeProps = [
							'font', 'fontSize', 'fontColor', 'lineSpacing', 'lineHeightMultiple',
							'lineBreakMode', 'textAlign', 'underline', 'textShadow', 'range', 'onclick'
						];
						
						return partialAttributeProps.map(prop => {
							const item = new vscode.CompletionItem(prop, vscode.CompletionItemKind.Property);
							item.detail = `partialAttributes property`;
							item.insertText = prop;
							
							// Add snippet with value
							const snippetItem = new vscode.CompletionItem(`${prop} (with value)`, vscode.CompletionItemKind.Snippet);
							snippetItem.detail = `partialAttributes property with value`;
							snippetItem.filterText = prop;
							snippetItem.sortText = `1_${prop}`;
							
							let snippetText = `${prop}": `;
							switch(prop) {
								case 'font':
									snippetText += '"\${1:}"';
									break;
								case 'fontSize':
									snippetText += '\${1:16}';
									break;
								case 'fontColor':
									snippetText += '"\${1:#000000}"';
									break;
								case 'lineSpacing':
								case 'lineHeightMultiple':
									snippetText += '\${1:1.0}';
									break;
								case 'lineBreakMode':
									snippetText += '"\${1|Char,Clip,Word,Head,Middle,Tail|}"';
									break;
								case 'textAlign':
									snippetText += '"\${1|Left,Center,Right|}"';
									break;
								case 'underline':
									snippetText += '{\n\t\t\t\t"lineStyle": "\${1|Single,Double,Thick,None|}",\n\t\t\t\t"color": "\${2:#000000}"\n\t\t\t}';
									break;
								case 'textShadow':
									snippetText += '"color:\${1:#000000}|offset:\${2:0},\${3:1}|blur:\${4:3}"';
									break;
								case 'range':
									snippetText += '[\${1:0}, \${2:5}]';
									break;
								case 'onclick':
									snippetText += '"\${1:handleClick}"';
									break;
								default:
									snippetText += '"\${1:}"';
							}
							snippetItem.insertText = new vscode.SnippetString(snippetText);
							
							return [item, snippetItem];
						}).flat();
					}
				}
				
				// Check if we're inside a data array object
				if (beforeText.includes('"data"') && linePrefix.match(/^\s*"$/)) {
					const lastDataIndex = beforeText.lastIndexOf('"data"');
					const textAfterData = beforeText.substring(lastDataIndex);
					
					const openBrackets = (textAfterData.match(/\[/g) || []).length;
					const closeBrackets = (textAfterData.match(/\]/g) || []).length;
					const openBraces = (textAfterData.match(/\{/g) || []).length;
					const closeBraces = (textAfterData.match(/\}/g) || []).length;
					
					if (openBrackets > closeBrackets && openBraces > closeBraces) {
						// We're inside a data object
						const dataProps = ['name', 'class', 'defaultValue'];
						
						return dataProps.map(prop => {
							const item = new vscode.CompletionItem(prop, vscode.CompletionItemKind.Property);
							item.detail = `Data binding property`;
							item.insertText = prop;
							return item;
						});
					}
				}
				
				// Auto-complete for data array when include exists
				if (linePrefix.match(/^\s*"data"\s*:\s*$/)) {
					// Check if this object has "include" property
					const currentObjectMatch = beforeText.match(/\{[^{}]*"include"[^{}]*$/);
					if (currentObjectMatch) {
						const item = new vscode.CompletionItem('[]', vscode.CompletionItemKind.Snippet);
						item.detail = 'Data array for include';
						item.insertText = new vscode.SnippetString('[\n\t{\n\t\t"name": "\${1:variableName}",\n\t\t"class": "\${2|String,Int,Double,Bool,Array,Dictionary|}",\n\t\t"defaultValue": "\${3:}"\n\t}\n]');
						return [item];
					}
				}
				
				// Auto-complete for creating data object in array
				if (linePrefix.match(/^\s*\{$/)) {
					// Check if we're inside a data array
					const lastDataIndex = beforeText.lastIndexOf('"data"');
					if (lastDataIndex !== -1) {
						const textAfterData = beforeText.substring(lastDataIndex);
						const openBrackets = (textAfterData.match(/\[/g) || []).length;
						const closeBrackets = (textAfterData.match(/\]/g) || []).length;
						
						if (openBrackets > closeBrackets) {
							const item = new vscode.CompletionItem('data object', vscode.CompletionItemKind.Snippet);
							item.detail = 'Create data binding object';
							item.insertText = new vscode.SnippetString('\n\t"name": "\${1:variableName}",\n\t"class": "\${2|String,Int,Double,Bool,Array,Dictionary|}",\n\t"defaultValue": "\${3:}"\n');
							return [item];
						}
					}
				}

				return undefined;
			}
		},
		'"',
		':',
		'@',  // Add @ as a trigger character for data binding
		'_'   // Add _ as a trigger character for string.json navigation
	);

	// Add a separate completion provider for { character
	const bracketCompletionProvider = vscode.languages.registerCompletionItemProvider(
		{ scheme: 'file', pattern: '**/*.json' },
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
				const linePrefix = document.lineAt(position).text.substring(0, position.character);
				
				// Skip if we're inside a string value (data binding or regular string)
				if (linePrefix.match(/"[^"]*\{$/)) {
					return undefined;
				}
				
				// Only provide suggestions for { at the start of a line or after array/object start
				if (linePrefix.match(/^\s*\{$/) || linePrefix.match(/[\[,]\s*\{$/)) {
					const text = document.getText();
					const currentPos = document.offsetAt(position);
					const beforeText = text.substring(0, currentPos);
					
					// First check if this is a new component object (not inside partialAttributes or data)
					const isInPartialAttributes = beforeText.lastIndexOf('"partialAttributes"') > -1 && 
						(() => {
							const lastPartialAttrIndex = beforeText.lastIndexOf('"partialAttributes"');
							const textAfterPartialAttr = beforeText.substring(lastPartialAttrIndex);
							const openBrackets = (textAfterPartialAttr.match(/\[/g) || []).length;
							const closeBrackets = (textAfterPartialAttr.match(/\]/g) || []).length;
							return openBrackets > closeBrackets;
						})();
					
					const isInData = beforeText.lastIndexOf('"data"') > -1 && 
						(() => {
							const lastDataIndex = beforeText.lastIndexOf('"data"');
							const textAfterData = beforeText.substring(lastDataIndex);
							const openBrackets = (textAfterData.match(/\[/g) || []).length;
							const closeBrackets = (textAfterData.match(/\]/g) || []).length;
							return openBrackets > closeBrackets;
						})();
					
					// If not in partialAttributes or data, suggest type, data, include
					if (!isInPartialAttributes && !isInData) {
						const suggestions = [];
						
						// Type suggestion with snippet
						const typeItem = new vscode.CompletionItem('type', vscode.CompletionItemKind.Snippet);
						typeItem.detail = 'Component type';
						typeItem.insertText = new vscode.SnippetString('\n\t"type": "\${1|View,Label,Button,TextField,Image,ScrollView,SafeAreaView|}",\n\t"width": "\${2|matchParent,wrapContent|}",\n\t"height": "\${3|matchParent,wrapContent|}"');
						typeItem.sortText = '0_type';
						suggestions.push(typeItem);
						
						// Data suggestion
						const dataItem = new vscode.CompletionItem('data', vscode.CompletionItemKind.Snippet);
						dataItem.detail = 'Data binding array';
						dataItem.insertText = new vscode.SnippetString('\n\t"data": [\n\t\t{\n\t\t\t"name": "\${1:variableName}",\n\t\t\t"class": "\${2|String,Int,Double,Bool,Array,Dictionary|}",\n\t\t\t"defaultValue": "\${3:}"\n\t\t}\n\t]');
						dataItem.sortText = '1_data';
						suggestions.push(dataItem);
						
						// Include suggestion
						const includeItem = new vscode.CompletionItem('include', vscode.CompletionItemKind.Snippet);
						includeItem.detail = 'Include another JSON file';
						includeItem.insertText = new vscode.SnippetString('\n\t"include": "\${1:filename.json}"');
						includeItem.sortText = '2_include';
						suggestions.push(includeItem);
						
						return suggestions;
					}
					
					// Check if we're inside a partialAttributes array
					const lastPartialAttrIndex = beforeText.lastIndexOf('"partialAttributes"');
					if (lastPartialAttrIndex !== -1) {
						const textAfterPartialAttr = beforeText.substring(lastPartialAttrIndex);
						const openBrackets = (textAfterPartialAttr.match(/\[/g) || []).length;
						const closeBrackets = (textAfterPartialAttr.match(/\]/g) || []).length;
						
						if (openBrackets > closeBrackets) {
							// Check we're not already inside an object
							const openBraces = (textAfterPartialAttr.match(/\{/g) || []).length;
							const closeBraces = (textAfterPartialAttr.match(/\}/g) || []).length;
							
							// Only suggest if this is a new object (more open braces than close braces)
							if (openBraces > closeBraces) {
								const item = new vscode.CompletionItem('partialAttributes object', vscode.CompletionItemKind.Snippet);
								item.detail = 'Create partial attributes object';
								item.insertText = new vscode.SnippetString('\n\t\t"fontColor": "\${1:#000000}",\n\t\t"fontSize": \${2:16},\n\t\t"range": [\${3:0}, \${4:5}]\n\t');
								item.command = {
									command: 'editor.action.triggerSuggest',
									title: 'Re-trigger suggestions'
								};
								return [item];
							}
						}
					}
					
					// Check if we're inside a data array
					const lastDataIndex = beforeText.lastIndexOf('"data"');
					if (lastDataIndex !== -1) {
						const textAfterData = beforeText.substring(lastDataIndex);
						const openBrackets = (textAfterData.match(/\[/g) || []).length;
						const closeBrackets = (textAfterData.match(/\]/g) || []).length;
						
						if (openBrackets > closeBrackets) {
							// Check we're not already inside an object
							const openBraces = (textAfterData.match(/\{/g) || []).length;
							const closeBraces = (textAfterData.match(/\}/g) || []).length;
							
							// Only suggest if this is a new object (more open braces than close braces)
							if (openBraces > closeBraces) {
								const item = new vscode.CompletionItem('data object', vscode.CompletionItemKind.Snippet);
								item.detail = 'Create data binding object';
								item.insertText = new vscode.SnippetString('\n\t\t"name": "\${1:variableName}",\n\t\t"class": "\${2|String,Int,Double,Bool,Array,Dictionary|}",\n\t\t"defaultValue": "\${3:}"\n\t');
								item.command = {
									command: 'editor.action.triggerSuggest',
									title: 'Re-trigger suggestions'
								};
								return [item];
							}
						}
					}
				}
				
				return undefined;
			}
		},
		'{'
	);

	const insertViewTemplate = vscode.commands.registerCommand('swiftjsonui-helper.insertViewTemplate', () => {
		insertTemplate(templates.view);
	});

	const insertLabelTemplate = vscode.commands.registerCommand('swiftjsonui-helper.insertLabelTemplate', () => {
		insertTemplate(templates.label);
	});

	const insertButtonTemplate = vscode.commands.registerCommand('swiftjsonui-helper.insertButtonTemplate', () => {
		insertTemplate(templates.button);
	});


	const insertTextFieldTemplate = vscode.commands.registerCommand('swiftjsonui-helper.insertTextFieldTemplate', () => {
		insertTemplate(templates.textField);
	});

	const insertScrollViewTemplate = vscode.commands.registerCommand('swiftjsonui-helper.insertScrollViewTemplate', () => {
		insertTemplate(templates.scrollView);
	});

	const insertSafeAreaViewTemplate = vscode.commands.registerCommand('swiftjsonui-helper.insertSafeAreaViewTemplate', () => {
		insertTemplate(templates.safeAreaView);
	});

	const insertSafeAreaScrollViewTemplate = vscode.commands.registerCommand('swiftjsonui-helper.insertSafeAreaScrollViewTemplate', () => {
		insertTemplate(templates.safeAreaScrollView);
	});

	const insertCollectionTemplate = vscode.commands.registerCommand('swiftjsonui-helper.insertCollectionTemplate', () => {
		insertTemplate(templates.collection);
	});

	const hoverProvider = vscode.languages.registerHoverProvider(
		{ scheme: 'file', pattern: '**/*.json' },
		{
			provideHover(document, position) {
				const range = document.getWordRangeAtPosition(position, /"[\w]+"/);
				if (!range) { return; }
				
				const word = document.getText(range).replace(/"/g, '');
				
				const descriptions: { [key: string]: string } = {
					'type': 'The type of UI component (View, Label, Button, etc.)',
					'id': 'Unique identifier for the view',
					'width': 'View width ("matchParent", "wrapContent", or number)',
					'height': 'View height ("matchParent", "wrapContent", or number)',
					'text': 'Text content - supports @{variable} for data binding',
					'fontSize': 'Font size in points',
					'fontColor': 'Text color in hex format (#RRGGBB)',
					'background': 'Background color in hex format (#RRGGBB)',
					'textAlign': 'Text alignment (Left, Center, Right)',
					'onClick': 'Closure-based event handler (uses @{} with closure type)',
					'onclick': 'Selector-based event handler (calls Objective-C/ViewModel methods)',
					'cornerRadius': 'Corner radius for rounded corners',
					'paddings': 'Padding for all sides [top, right, bottom, left] or single value',
					'margins': 'Margin for all sides [top, right, bottom, left] or single value',
					'child': 'Array of child view definitions',
					'spacing': 'Space between children',
					'alignment': 'Child alignment',
					'hint': 'Placeholder text for input fields',
					'src': 'Image source name/path',
					'contentMode': 'Image content mode (AspectFill, AspectFit, Center)',
					'checked': 'Checked state for checkboxes/switches',
					'minimum': 'Minimum value for sliders',
					'maximum': 'Maximum value for sliders',
					'value': 'Current value',
					'progress': 'Progress value (0.0-1.0)',
					'items': 'Array of items for selection',
					'enabled': 'Whether the component is enabled',
					'hidden': 'Hidden state (can be data binding)',
					'visibility': 'Visibility state ("visible", "invisible", "gone")',
					'secure': 'Secure text entry for passwords',
					'lines': 'Number of lines (0 = unlimited)',
					'lineBreakMode': 'How to break lines (Char, Clip, Word, Head, Middle, Tail)',
					'borderStyle': 'TextField border style (RoundedRect, Line, Bezel)',
					'input': 'Keyboard type (alphabet, email, password, number, decimal)',
					'returnKeyType': 'Return key type (Done, Next, Search, Send, Go, etc.)',
					'indicatorStyle': 'Activity indicator style (medium, large)',
					'effectStyle': 'Blur effect style (Light, Dark, ExtraLight)',
					'gradient': 'Array of gradient colors',
					'gradientDirection': 'Gradient direction (Vertical, Horizontal, Oblique)',
					'url': 'URL for web view or network image',
					'orientation': 'Linear layout direction (vertical, horizontal)',
					'distribution': 'Child distribution in stack',
					'centerInParent': 'Center both horizontally and vertically',
					'centerVertical': 'Center vertically in parent',
					'centerHorizontal': 'Center horizontally in parent'
				};
				
				if (descriptions[word]) {
					return new vscode.Hover(descriptions[word]);
				}
				
				const componentDescriptions: { [key: string]: string } = {
					'View': 'Container component that can hold other components',
					'SafeAreaView': 'Container that respects safe area insets',
					'Label': 'Text display component',
					'Button': 'Clickable button component',
					'TextField': 'Single-line text input field',
					'TextView': 'Multi-line text input field',
					'Image': 'Local image display component',
					'NetworkImage': 'Network image display component',
					'CircleImage': 'Circular network image component',
					'ScrollView': 'Scrollable container (alias for Scroll)',
					'Scroll': 'Scrollable container',
					'Table': 'Table view for lists',
					'Collection': 'Collection view for grids',
					'Switch': 'Toggle switch component',
					'Slider': 'Value slider component',
					'Progress': 'Progress indicator',
					'Indicator': 'Activity indicator',
					'Check': 'Checkbox component',
					'Radio': 'Radio button component',
					'Segment': 'Segmented control',
					'SelectBox': 'Dropdown selection component',
					'IconLabel': 'Label with icon',
					'GradientView': 'View with gradient background',
					'Blur': 'Blur effect view',
					'CircleView': 'Circular container view',
					'Web': 'Web view component'
				};
				
				if (componentDescriptions[word]) {
					return new vscode.Hover(componentDescriptions[word]);
				}
				
				return undefined;
			}
		}
	);

	context.subscriptions.push(
		jsonCompletionProvider,
		bracketCompletionProvider,
		insertViewTemplate,
		insertLabelTemplate,
		insertButtonTemplate,
		insertTextFieldTemplate,
		insertScrollViewTemplate,
		insertSafeAreaViewTemplate,
		insertSafeAreaScrollViewTemplate,
		insertCollectionTemplate,
		hoverProvider
	);
}

function insertTemplate(template: any) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}

	const position = editor.selection.active;
	const templateString = JSON.stringify(template, null, 2);
	
	editor.edit(editBuilder => {
		editBuilder.insert(position, templateString);
	}).then(() => {
		vscode.commands.executeCommand('editor.action.formatDocument');
	});
}

export function deactivate() {}