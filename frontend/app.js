// References to DOM elements
const fileUpload = document.getElementById('fileUpload');
const textInput = document.getElementById('textInput');
const linkInput = document.getElementById('linkInput');
const processInput = document.getElementById('processInput');
const textDisplay = document.getElementById('textDisplay');

// Read text from fileUpload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const fileText = e.target.result;
            textWithComplexity(fileText);
        };
        reader.readAsText(file);
    } else {
        alert('Please upload a valid text file.');
    }
}

// Process pasted or inputted text
function handleTextInput() {
    const inputText = textInput.value.trim();
    if (inputText) {
        textWithComplexity(inputText);
    } else {
        alert('Please paste some text to process.');
    }
}

// Process URL input (basic setup, more needed for webscraping)
function handleLinkInput() {
    const link = linkInput.value.trim();
    if (link) {
        // Placeholder behavior
        textWithComplexity(`Fetching text from: ${link}`);
    } else {
        alert('Please paste a valid URL.');
    }
}

// Sentence complexity calculation
function calculateComplexity(sentence) {
    const wordCount = sentence.split(/\s+/).length;
    const rareWords = sentence.match(/\b([a-zA-Z]{8,})\b/g)?.length || 0; // Example: Words with 8+ letters
    const conjunctions = sentence.match(/\b(and|or|but|because|although)\b/g)?.length || 0;

    // Scoring computation
    const score = wordCount + rareWords * 2 + conjunctions * 1.5;

    if (score < 10) return 'Simple';
    if (score < 20) return 'Moderate';
    return 'Complex';
}

// Display text with complexity scores
function textWithComplexity(text) {
    textDisplay.innerHTML = '';
    const sentences = text.split(/(?<=[.!?])\s+/); // Split text into sentences
    sentences.forEach((sentence) => {
        const sentenceElement = document.createElement('p');
        sentenceElement.className = 'sentence';
        const complexity = calculateComplexity(sentence);

        // Add complexity class and display
        sentenceElement.textContent = `${sentence} (${complexity})`;
        sentenceElement.classList.add(complexity.toLowerCase());
        textDisplay.appendChild(sentenceElement);
    });
}

// Event listeners
fileUpload.addEventListener('change', handleFileUpload);
processInput.addEventListener('click', () => {
    if (textInput.value) {
        handleTextInput();
    } else if (fileUpload.files.length > 0) {
        handleFileUpload({ target: fileUpload });
    } else if (linkInput.value) {
        handleLinkInput();
    } else {
        alert('Please provide some input.');
    }
});
