// Variables to track speech synthesis
let synth = window.speechSynthesis;
let utterance = null;
let sentences = [];
let currentSentenceIndex = 0;
let isPaused = false;
let isSkipping = false;

// Get button references
const playPauseButton = document.getElementById('play-pause');
const prevButton = document.getElementById('prev-sentence');
const nextButton = document.getElementById('next-sentence');

// Icons for Play, Pause, Stop
const playIcon = '<i class="fas fa-play"></i> Play';
const pauseIcon = '<i class="fas fa-pause"></i> Pause';
const stopIcon = '<i class="fas fa-stop"></i> Stop';

// Play/Pause/Stop button functionality
playPauseButton.addEventListener('click', () => {
    if (!utterance) {
        startSpeech(); // Start playing if no utterance exists
    } else if (isPaused) {
        synth.resume(); // Resume if paused
        playPauseButton.innerHTML = pauseIcon;
        isPaused = false;
    } else {
        synth.pause(); // Pause if playing
        playPauseButton.innerHTML = playIcon;
        isPaused = true;
    }
});

// Previous and Next button functionality
prevButton.addEventListener('click', async () => {
    if (currentSentenceIndex > 0) {
        currentSentenceIndex--;
        isSkipping = true;
        stopSpeech();
        await startSpeech();
    }
});

nextButton.addEventListener('click', async () => {
    if (currentSentenceIndex < sentences.length - 1) {
        currentSentenceIndex++;
        isSkipping = true;
        stopSpeech();
        await startSpeech();
    }
});

// Function to start speech synthesis
async function startSpeech() {
    // Get all sentences from the text-container
    const textContainer = document.getElementById('text-container');
    sentences = Array.from(textContainer.querySelectorAll('.sentence')).map(
        (sentence) => cleanText(sentence.innerHTML.trim()) // Clean text to remove subscripts
    );

    if (sentences.length === 0) {
        Swal.fire({
            title: 'No Content',
            text: 'Please add some text to play.',
            icon: 'warning',
            confirmButtonText: 'Okay',
        });
        return;
    }

    // Reset the speech synthesis utterance
    utterance = new SpeechSynthesisUtterance(sentences[currentSentenceIndex]);
    utterance.lang = 'en-US'; // Set language, adjust as needed
    utterance.rate = 1; // Set speech rate, adjust as needed
    utterance.pitch = 1; // Set speech pitch, adjust as needed

    // Highlight the current sentence
    await highlightCurrentSentence();
    console.log(currentSentenceIndex);

    // Handle speech synthesis events
    utterance.onend = () => {
        if (!isSkipping){
            if (currentSentenceIndex < sentences.length - 1) {
                currentSentenceIndex = currentSentenceIndex + 1;
                startSpeech(); // Move to next sentence
            } else {
                resetSpeech(); // End playback
            }
        }else{
            isSkipping = false;
        }
    };

    // Speak the current sentence
    synth.speak(utterance);
    playPauseButton.innerHTML = pauseIcon;
    isPaused = false;
}

// Helper function to clean text
function cleanText(html) {
    // Create a temporary element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove all <sub>...</sub> elements
    tempDiv.querySelectorAll('sub').forEach((sub) => sub.remove());

    // Return plain text
    return tempDiv.textContent || tempDiv.innerText || '';
}

// Function to stop speech synthesis
function stopSpeech() {
    if (synth.speaking) {
        synth.cancel();
    }
    playPauseButton.innerHTML = playIcon;
    isPaused = false;
}

// Function to reset speech synthesis
async function resetSpeech() {
    stopSpeech();
    utterance = null;
    currentSentenceIndex = 0;
    unhighlightSentences();
}

// Function to highlight the current sentence
async function highlightCurrentSentence() {
    const textContainer = document.getElementById('text-container');
    const sentenceElements = Array.from(
        textContainer.querySelectorAll('.sentence')
    );

    // Clear previous highlights
    sentenceElements.forEach((element) =>
        element.classList.remove('highlighted')
    );

    // Highlight the current sentence
    const currentSentenceElement = sentenceElements[currentSentenceIndex];
    if (currentSentenceElement) {
        currentSentenceElement.classList.add('highlighted');
        currentSentenceElement.scrollIntoView({ behavior: 'smooth' });
    }
}

// Function to remove highlights from sentences
function unhighlightSentences() {
    const textContainer = document.getElementById('text-container');
    const sentenceElements = Array.from(
        textContainer.querySelectorAll('.sentence')
    );
    sentenceElements.forEach((element) =>
        element.classList.remove('highlighted')
    );
}
