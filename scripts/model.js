let model;
let dataset;
let preprocessedData;



// Check if the model exists
async function checkModelFile() {
    const spinner = document.getElementById('loading-spinner');
    spinner.classList.remove('hidden'); // Show the spinner
    dataset = await loadDataset(); // Load dataset
    preprocessedData = await preprocessDataset(dataset); // Preprocess it

    try {
        model = await tf.loadLayersModel('localstorage://cefr-model');
        console.log('Model loaded successfully');
        return true;
    } catch (error) {
        console.error('There is no model yet.', error);
        return false;
    } finally {
        spinner.classList.add('hidden'); // Hide the spinner
    }
}

async function loadDataset() {
    const url = 'models/cefr_leveled_texts.csv'; // URL to fetch the CSV
    const response = await fetch(url);
    const csvData = await response.text();

    return new Promise((resolve, reject) => {
        Papa.parse(csvData, {
            header: true, // Assume the CSV has a header
            skipEmptyLines: true, // Skip empty rows
            dynamicTyping: true, // Automatically convert numeric data types
            complete: (results) => {
                if (results.errors.length) {
                    console.error("Errors while parsing CSV:", results.errors);
                    reject(results.errors);
                } else {
                    console.log("Parsed Dataset:", results.data);
                    resolve(results.data);
                }
            },
            error: (error) => {
                console.error("Error parsing CSV:", error);
                reject(error);
            }
        });
    });
}


// Train model with preprocessed data
async function trainModel({ inputs, labels, vocabSize, maxSequenceLength }) {
    // Define the model
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [inputs.shape[1]] }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 6, activation: 'softmax' })); // 6 CEFR levels

    model.compile({
        optimizer: tf.train.adam(),
        loss: 'sparseCategoricalCrossentropy',
        metrics: ['accuracy']
    });

    // Custom container for graphs
    const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    const container = document.getElementById('tfjs-graph-container');

    // Start training with callbacks
    await model.fit(inputs, labels, {
        batchSize: 32,
        epochs: 10,
        validationSplit: 0.2,
        callbacks: tfvis.show.fitCallbacks(container, metrics, { height: 200 })
    });

    console.log('Model training completed');
    await model.save('localstorage://cefr-model');
}

// Preprocess Dataset
function preprocessDataset(dataset) {
    const texts = dataset.map(row => row.text);
    const labels = dataset.map(row => mapLabelToInt(row.label));

    // Create word index and tokenize
    const wordIndex = {};
    let currentIndex = 1;

    texts.forEach(text => {
        text.split(/\s+/).forEach(word => {
            const cleanedWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!wordIndex[cleanedWord] && cleanedWord.length > 0) {
                wordIndex[cleanedWord] = currentIndex++;
            }
        });
    });

    const sequences = texts.map(text =>
        text.split(/\s+/).map(word => wordIndex[word.toLowerCase().replace(/[^a-z0-9]/g, '')] || 0)
    );

    const maxSequenceLength = Math.max(...sequences.map(seq => seq.length));
    const paddedSequences = sequences.map(seq =>
        seq.length > maxSequenceLength
            ? seq.slice(0, maxSequenceLength)
            : [...seq, ...Array(maxSequenceLength - seq.length).fill(0)]
    );

    const inputs = tf.tensor2d(paddedSequences, [paddedSequences.length, maxSequenceLength], 'int32');
    const labelsTensor = tf.tensor1d(labels, 'float32');

    return { inputs, labels: labelsTensor, vocabSize: currentIndex, maxSequenceLength, wordIndex };
}

// Map CEFR label
function mapLabelToInt(label) {
    const labelMap = {
        "A1": 0,
        "A2": 1,
        "B1": 2,
        "B2": 3,
        "C1": 4,
        "C2": 5
    };
    return labelMap[label] || 0; // Default to 0 if the label is not found
}


async function predict(inputText) {
    const wordIndex = preprocessedData.wordIndex
    const maxSequenceLength = preprocessedData.maxSequenceLength

    if (!model) {
        throw new Error("Model is not initialized. Ensure the model is loaded or trained before making predictions.");
    }

    // Tokenize the input text
    const sequence = inputText.split(/\s+/).map(word => {
        const cleanedWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
        return wordIndex[cleanedWord] || 0; // Use 0 if the word is not in the vocabulary
    });

    // Pad the sequence to match the maxSequenceLength
    const paddedSequence = sequence.length > maxSequenceLength 
        ? sequence.slice(0, maxSequenceLength) 
        : [...sequence, ...Array(maxSequenceLength - sequence.length).fill(0)];

    // Convert to tensor
    const inputTensor = tf.tensor2d([paddedSequence]);

    // Make prediction
    const prediction = model.predict(inputTensor);
    const predictedLabelIndex = prediction.argMax(-1).dataSync()[0];

    // Map the label index back to a human-readable label
    const labelMap = {
        0: "A1",
        1: "A2",
        2: "B1",
        3: "B2",
        4: "C1",
        5: "C2"
    };
    return labelMap[predictedLabelIndex];
}
