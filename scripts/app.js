document.addEventListener('DOMContentLoaded', () => {
    checkAndHandleModel();

    const readingSection = document.querySelector('.reading-section');
    const textContainer = document.getElementById('text-container');

    // Hide the reading section initially if no text exists
    if (textContainer.children.length === 0) {
        readingSection.style.display = 'none';
    }
});

document.getElementById('train-model').addEventListener('click', () => {
    promptForReTraining('Would you like to retrain the model?');
});

// Function to check if the model exists and handle accordingly
async function checkAndHandleModel() {
    const fileExists = await checkModelFile();
    if (!fileExists) {
        promptForTraining('The model file does not exist. Would you like to train the model?');
    }
}

// Reusable function to prompt the user for training
function promptForTraining(message) {
    Swal.fire({
        title: 'Model Training Required',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Train Model',
        cancelButtonText: 'Cancel',
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed) {
            startTrainingProcess();
        } else {
            showUnclosableError();
        }
    });
}

// Reusable function to prompt the user for training
function promptForReTraining(message) {
    Swal.fire({
        title: 'Model Training Required',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Train Model',
        cancelButtonText: 'Cancel',
        allowOutsideClick: false
    }).then((result) => {
        if (result.isConfirmed) {
            startTrainingProcess();
        }
    });
}

// Function to handle the training process
async function startTrainingProcess() {
    Swal.fire({
        title: 'Training Model',
        html: '<div id="tfjs-graph-container" class="text-center"></div>',
        width: '600px',
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
    });

    try {
        await trainModel(preprocessedData);
        Swal.fire({
            title: 'Model Training Completed',
            text: 'The model has been successfully trained!',
            icon: 'success'
        });
    } catch (error) {
        console.error('Error during training:', error);
        Swal.fire({
            title: 'Error',
            text: 'An error occurred during model training. Please try again.',
            icon: 'error'
        });
    }
}

// Function to show an unclosable error if training is canceled
function showUnclosableError() {
    Swal.fire({
        title: 'Application Error',
        text: 'The application cannot run unless the model is trained.',
        icon: 'error',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showConfirmButton: false
    });
}

// Import PDF/Text Modal
document.getElementById('import-file').addEventListener('click', () => {
    Swal.fire({
        title: 'Import PDF',
        html: '<input type="file" id="pdf-input" class="form-control mt-3" accept=".pdf">',
        showCancelButton: true,
        confirmButtonText: 'Upload',
        preConfirm: () => {
            const fileInput = document.getElementById('pdf-input');
            if (fileInput.files.length === 0) {
                Swal.showValidationMessage('Please select a PDF file.');
                return false;
            }
            return fileInput.files[0];
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const pdfFile = result.value;
            parsePDF(pdfFile);
        }
    });
});

// Function to parse the PDF file and extract text
function parsePDF(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const typedarray = new Uint8Array(e.target.result);

        try {
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let text = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();

                // Extract the text content
                const pageText = content.items.map(item => item.str).join(' ');
                text += pageText + '\n'; // Add a newline for separation between pages
            }

            // Populate the text-container
            populateTextContainer(text);
        } catch (error) {
            console.error('Error parsing PDF:', error);
            Swal.fire({
                title: 'Error',
                text: 'Unable to parse the PDF file. Please try again.',
                icon: 'error'
            });
        }
    };

    reader.onerror = () => {
        Swal.fire({
            title: 'Error',
            text: 'Failed to read the file. Please try again.',
            icon: 'error'
        });
    };

    reader.readAsArrayBuffer(file);
}


// Paste Text Modal
document.getElementById('paste-text').addEventListener('click', () => {
    Swal.fire({
        title: 'Paste Text',
        html: '<textarea id="text-input" class="form-control" rows="5" placeholder="Paste your text here..."></textarea>',
        showCancelButton: true,
        confirmButtonText: 'Submit',
        preConfirm: () => {
            const textInput = document.getElementById('text-input').value;
            populateTextContainer(textInput);
        }
    });
});

// Clear button
document.getElementById('clear-text-container').addEventListener('click', () => {
    const textContainer = document.getElementById('text-container');
    const readingSection = document.querySelector('.reading-section');

    // Confirm the action with the user
    Swal.fire({
        title: 'Clear Text?',
        text: 'Are you sure you want to clear all the text?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Clear',
        cancelButtonText: 'Cancel',
    }).then((result) => {
        if (result.isConfirmed) {
            // Clear the text-container
            textContainer.innerHTML = '';
            readingSection.style.display = 'none'; // Hide the section if no text exists

            Swal.fire({
                title: 'Cleared',
                text: 'The text container has been cleared.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
        }
    });
});

// Save Button
document.getElementById('save-button').addEventListener('click', () => {
    const textContainer = document.getElementById('text-container');

    // Get the text content from the text-container
    const text = Array.from(textContainer.querySelectorAll('.sentence'))
        .map(sentence => sentence.textContent.replace(/\[\w+\]\s/, '')) // Remove subscript and whitespace
        .join('\n'); // Join sentences with new lines

    if (!text.trim()) {
        Swal.fire({
            title: 'No Content',
            text: 'The text container is empty. Please add content to save.',
            icon: 'warning',
            confirmButtonText: 'Okay'
        });
        return;
    }

    // Create a blob with the text content
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');

    // Create a downloadable link
    link.href = URL.createObjectURL(blob);
    link.download = 'text-container-content.txt';

    // Simulate a click to trigger the download
    link.click();

    // Clean up the URL object
    URL.revokeObjectURL(link.href);

    Swal.fire({
        title: 'Saved!',
        text: 'The text container content has been saved as a .txt file.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
    });
});

// Sentence simplification interaction
document.querySelectorAll('.sentence').forEach(sentence => {
    sentence.addEventListener('click', () => {
        Swal.fire({
            title: 'Simplifying...',
            text: 'Please wait while the sentence is being simplified.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
                // Simulate a delay for simplification
                setTimeout(() => {
                    Swal.fire({
                        title: 'Simplified Sentence',
                        text: 'Here is the simplified version of the sentence.',
                        icon: 'success'
                    });
                }, 2000); // Simulate 2 seconds delay
            }
        });
    });
});

// Populate text-container with individual sentences
async function populateTextContainer(text) {
    const textContainer = document.getElementById('text-container');
    const readingSection = document.querySelector('.reading-section');
    textContainer.innerHTML = ''; // Clear existing content

    if (!text.trim()) {
        Swal.fire({
            title: 'No Text Provided',
            text: 'Please paste or import text to get started.',
            icon: 'warning',
            confirmButtonText: 'Okay'
        });
        return;
    }

    // Show the reading section
    readingSection.style.display = 'block';

    // Split text into sentences using basic delimiters (period, exclamation, question marks)
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
    for (const sentence of sentences) {
        const p = document.createElement('p');
        p.classList.add('sentence');
        p.textContent = sentence.trim();

        try {
            // Predict CEFR level
            const predictedLevel = await predict(sentence.trim());

            // Add subscript
            const subscript = document.createElement('sub');
            subscript.textContent = `[${predictedLevel}] `;
            p.prepend(subscript);

            // Add color based on CEFR level
            const colorMap = {
                "A1": "rgba(144, 238, 144, 0.5)",
                "A2": "rgba(0, 255, 0, 0.05)",
                "B1": "rgba(173, 216, 230, 0.5)",
                "B2": "rgba(0, 0, 255, 0.5)",
                "C1": "rgba(255, 165, 0, 0.5)",
                "C2": "rgba(255, 0, 0, 0.5)"
            };
            p.style.backgroundColor = colorMap[predictedLevel];
        } catch (error) {
            console.error('Prediction error:', error);
        }

        textContainer.appendChild(p);

        // Add click event listener for each sentence
        p.addEventListener('click', async () => {
            try {
                // Display loading Swal while simplifying
                Swal.fire({
                    title: 'Simplifying...',
                    text: `Please wait while the sentence "${sentence.trim()}" is being simplified.`,
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                // Call the simplify function
                const simplifiedText = await simplify(sentence.trim());

                // Update DOM with the simplified text
                p.textContent = simplifiedText;

                // Reapply CEFR prediction and color coding
                const predictedLevel = await predict(simplifiedText);
                const subscript = document.createElement('sub');
                subscript.textContent = `[${predictedLevel}] `;
                p.prepend(subscript);

                const colorMap = {
                    "A1": "rgba(144, 238, 144, 0.5)",
                    "A2": "rgba(0, 255, 0, 0.05)",
                    "B1": "rgba(173, 216, 230, 0.5)",
                    "B2": "rgba(0, 0, 255, 0.5)",
                    "C1": "rgba(255, 165, 0, 0.5)",
                    "C2": "rgba(255, 0, 0, 0.5)"
                };
                p.style.backgroundColor = colorMap[predictedLevel];

                Swal.close(); // Close the Swal

            } catch (error) {
                console.error('Simplification error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to simplify the sentence. Please try again.',
                    icon: 'error'
                });
            }
        });
    }
}


