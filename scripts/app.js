
document.addEventListener('DOMContentLoaded', () => {
    checkAndHandleModel();
});

document.getElementById('train-model').addEventListener('click', () => {
    promptForReTraining('Would you like to retrain the model?');
});

// Function to check if the model exists and handle accordingly
async function checkAndHandleModel() {
    const fileExists = await checkModelFile();
    console.log(await predict('Hello World!')); // I did it!!!!!
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
        html: '<input type="file" class="form-control mt-3">',
        showCancelButton: true,
        confirmButtonText: 'Upload'
    });
});

// Paste Text Modal
document.getElementById('paste-text').addEventListener('click', () => {
    Swal.fire({
        title: 'Paste Text',
        html: '<textarea class="form-control" rows="5" placeholder="Paste your text here..."></textarea>',
        showCancelButton: true,
        confirmButtonText: 'Submit'
    });
});

// Toggle Right Sidebar for Graphs
document.getElementById('view-graph').addEventListener('click', () => {
    tfvis.visor().toggle(); // Toggle the tfvis visor for graphs
});

// JavaScript to trigger SweetAlert when Save button is clicked
document.getElementById('save-button').addEventListener('click', () => {
    Swal.fire({
        title: 'Saving Data',
        text: 'Do you want to save your current progress?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Save',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
            // Simulate a save action (you can replace this with an actual save process)
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                    Swal.fire({
                        title: 'Saved!',
                        text: 'Your progress has been saved.',
                        icon: 'success',
                        confirmButtonText: 'Okay'
                    });
                }, 2000); // Simulating a save process with a 2 second delay
            });
        }
    });
});

// Variables to track playback state
let isPlaying = false;
let isPaused = false;

const playPauseButton = document.getElementById('play-pause');
const playIcon = '<i class="fas fa-play"></i> Play';
const pauseIcon = '<i class="fas fa-pause"></i> Pause';
const stopIcon = '<i class="fas fa-stop"></i> Stop';

// Event listener for the Play/Pause/Stop button
playPauseButton.addEventListener('click', () => {
    if (!isPlaying) {
        // Start playing
        isPlaying = true;
        isPaused = false;
        playPauseButton.innerHTML = pauseIcon;
        playPauseButton.classList.remove('btn-success');
        playPauseButton.classList.add('btn-warning'); // Change color to yellow for Pause
        alert('Playing text aloud...');
    } else if (isPlaying && !isPaused) {
        // Pause playback
        isPaused = true;
        playPauseButton.innerHTML = stopIcon;
        playPauseButton.classList.remove('btn-warning');
        playPauseButton.classList.add('btn-danger'); // Change color to red for Stop
        alert('Paused playback.');
    } else {
        // Stop playback
        isPlaying = false;
        isPaused = false;
        playPauseButton.innerHTML = playIcon;
        playPauseButton.classList.remove('btn-danger');
        playPauseButton.classList.add('btn-success'); // Change color back to green for Play
        alert('Stopped playback.');
    }
});

// Placeholder for navigating sentences
document.getElementById('prev-sentence').addEventListener('click', () => {
    alert('Previous sentence.');
});

document.getElementById('next-sentence').addEventListener('click', () => {
    alert('Next sentence.');
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

