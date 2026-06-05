// =========================
// PRACTICE DETAIL PAGE
// =========================

let currentVocabSetId = null;
let vocabSetData = null;
let wordsData = [];
let currentCardIndex = 0; // Index của thẻ hiện tại

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for navbar to load
    setTimeout(() => {
        init();
    }, 500);
});

async function init() {
    // Get vocab set ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    currentVocabSetId = urlParams.get('setId');

    if (!currentVocabSetId) {
        showError('Không tìm thấy ID bộ từ vựng!');
        return;
    }

    console.log('📚 Loading vocab set:', currentVocabSetId);

    // Load words directly
    await loadWords();
    
    // Add keyboard navigation
    setupKeyboardNavigation();
}

// Setup keyboard navigation (Arrow keys + Space)
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Left arrow or A - Previous
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            e.preventDefault();
            previousCard();
        }
        // Right arrow or D - Next
        else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            e.preventDefault();
            nextCard();
        }
        // Space or Enter - Flip card
        else if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            const currentCard = document.querySelector('.flashcard');
            if (currentCard) {
                flipCard(currentCard);
            }
        }
    });
}

// Load Words List
async function loadWords() {
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const wordsList = document.getElementById('words-list');

    try {
        loading.style.display = 'flex';
        errorMessage.style.display = 'none';
        wordsList.innerHTML = '';

        const token = auth.getToken();
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        console.log('📤 Fetching words for set:', currentVocabSetId);

        // Call API to get words
        const response = await api.get(`/words/set/${currentVocabSetId}`, token);

        loading.style.display = 'none';

        if (response && response.data) {
            wordsData = response.data;
            
            if (wordsData.length > 0) {
                displayWords(wordsData);
            } else {
                wordsList.innerHTML = '<p class="no-words">Bộ từ vựng này chưa có từ nào. Hãy thêm từ mới!</p>';
                document.getElementById('navigationControls').style.display = 'none';
            }
        }

    } catch (error) {
        console.error('❌ Error loading words:', error);
        loading.style.display = 'none';
        showError('Không thể tải danh sách từ vựng. Vui lòng thử lại!');
    }
}

// Display Words
function displayWords(words) {
    currentCardIndex = 0; // Reset về thẻ đầu tiên
    showCurrentCard();
}

// Show current card only
function showCurrentCard() {
    const wordsList = document.getElementById('words-list');
    const progressInfo = document.getElementById('progressInfo');
    
    // Clear all cards
    wordsList.innerHTML = '';
    
    if (wordsData.length === 0) {
        wordsList.innerHTML = '<p class="no-words">Bộ từ vựng này chưa có từ nào.</p>';
        return;
    }
    
    // Update progress
    progressInfo.textContent = `${currentCardIndex + 1} / ${wordsData.length}`;
    
    // Show only current card
    const word = wordsData[currentCardIndex];
    const wordCard = createWordCard(word, currentCardIndex + 1);
    wordsList.appendChild(wordCard);
    
    // Update navigation buttons
    updateNavigationButtons();
}

// Update navigation buttons state
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Disable prev button if at first card
    prevBtn.disabled = currentCardIndex === 0;
    
    // Disable next button if at last card
    nextBtn.disabled = currentCardIndex === wordsData.length - 1;
}

// Go to previous card
function previousCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        showCurrentCard();
    }
}

// Go to next card
function nextCard() {
    if (currentCardIndex < wordsData.length - 1) {
        currentCardIndex++;
        showCurrentCard();
    }
}

// Create Word Card
function createWordCard(word, index) {
    const card = document.createElement('div');
    card.className = 'word-card flashcard';
    card.onclick = () => flipCard(card);
    
    card.innerHTML = `
        <div class="flashcard-inner">
            <!-- Front Side (Tiếng Anh) -->
            <div class="flashcard-front">
                <div class="card-number">${index}</div>
                <div class="card-content">
                    <h2 class="english-word">${word.english_word}</h2>
                    <p class="pronunciation">${word.pronunciation || ''}</p>
                    <button class="btn-audio" onclick="event.stopPropagation(); playAudio('${word.english_word}')">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <p class="flip-hint"><i class="fas fa-sync-alt"></i> Click để xem nghĩa</p>
                </div>
            </div>
            
            <!-- Back Side (Tiếng Việt) -->
            <div class="flashcard-back">
                <div class="card-number">${index}</div>
                <div class="card-content">
                    <h2 class="vietnamese-meaning">${word.meaning}</h2>
                    ${word.example_sentence ? `
                        <div class="example">
                            <p class="example-text"><strong>Ví dụ:</strong> ${word.example_sentence}</p>
                        </div>
                    ` : ''}
                    <p class="flip-hint"><i class="fas fa-sync-alt"></i> Click để xem từ</p>
                </div>
            </div>
        </div>
    `;

    return card;
}

// Flip Flashcard
function flipCard(cardElement) {
    cardElement.classList.toggle('flipped');
}

// Play Audio (Text-to-Speech)
function playAudio(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    } else {
        alert('Trình duyệt của bạn không hỗ trợ phát âm!');
    }
}

// Show Error
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.querySelector('p').textContent = message;
    errorMessage.style.display = 'block';
}

// =========================
// ADD/EDIT/DELETE WORD
// =========================

// Open Word List Modal
function openWordListModal() {
    const modal = document.getElementById('wordListModal');
    if (modal) {
        modal.style.display = 'flex';
        displayWordList();
    }
}

// Close Word List Modal
function closeWordListModal() {
    const modal = document.getElementById('wordListModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Display Word List
function displayWordList() {
    const container = document.getElementById('wordListContainer');
    
    if (wordsData.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #95a5a6; padding: 2rem;">Chưa có từ vựng nào.</p>';
        return;
    }
    
    container.innerHTML = '';
    
    wordsData.forEach(word => {
        const item = document.createElement('div');
        item.className = 'word-list-item';
        
        item.innerHTML = `
            <div class="word-list-info">
                <div class="word-list-english">${word.english_word}</div>
                <div class="word-list-meaning">${word.meaning}</div>
                ${word.pronunciation ? `<div class="word-list-pronunciation">${word.pronunciation}</div>` : ''}
            </div>
            <div class="word-list-actions">
                <button class="btn-icon btn-icon-edit" onclick="editWordFromList(${word.id}, '${word.english_word.replace(/'/g, "\\'")}', '${word.meaning.replace(/'/g, "\\'")}', '${(word.pronunciation || '').replace(/'/g, "\\'")}', '${(word.example_sentence || '').replace(/'/g, "\\'")}')" title="Sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-icon-delete" onclick="deleteWordFromList(${word.id}, '${word.english_word.replace(/'/g, "\\'")}')" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// Edit Word From List
function editWordFromList(id, english_word, meaning, pronunciation, example_sentence) {
    closeWordListModal();
    openEditWordModal(id, english_word, meaning, pronunciation, example_sentence);
}

// Delete Word From List
async function deleteWordFromList(id, english_word) {
    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa từ "${english_word}"?\n\nHành động này không thể hoàn tác!`);
    
    if (!confirmDelete) {
        return;
    }

    try {
        const token = auth.getToken();
        if (!token) {
            throw new Error('Vui lòng đăng nhập!');
        }

        const response = await api.delete(`/words/${id}`, token);

        console.log('✅ Word deleted:', response);

        // Reload words
        await loadWords();
        
        // Update word list display
        displayWordList();

        alert('Đã xóa từ vựng thành công!');

    } catch (error) {
        console.error('❌ Error deleting word:', error);
        alert(error.message || 'Không thể xóa từ vựng. Vui lòng thử lại!');
    }
}

// Open Add Word Modal
function openAddWordModal() {
    const modal = document.getElementById('addWordModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('addWordForm').reset();
        document.getElementById('addWordError').style.display = 'none';
    }
}

// Close Add Word Modal
function closeAddWordModal() {
    const modal = document.getElementById('addWordModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Save New Word
async function saveNewWord() {
    const english_word = document.getElementById('wordEnglish').value.trim();
    const meaning = document.getElementById('wordMeaning').value.trim();
    const pronunciation = document.getElementById('wordPronunciation').value.trim();
    const example_sentence = document.getElementById('wordExample').value.trim();
    const errorDiv = document.getElementById('addWordError');

    // Validate
    if (!english_word) {
        errorDiv.textContent = 'Vui lòng nhập từ tiếng Anh!';
        errorDiv.style.display = 'block';
        return;
    }

    if (!meaning) {
        errorDiv.textContent = 'Vui lòng nhập nghĩa tiếng Việt!';
        errorDiv.style.display = 'block';
        return;
    }

    // Disable button
    const saveBtn = document.getElementById('saveWordBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    errorDiv.style.display = 'none';

    try {
        const token = auth.getToken();
        if (!token) {
            throw new Error('Vui lòng đăng nhập!');
        }

        const response = await api.post('/words', {
            set_id: currentVocabSetId,
            english_word,
            meaning,
            pronunciation: pronunciation || null,
            example_sentence: example_sentence || null
        }, token);

        console.log('✅ Word added:', response);

        // Close modal
        closeAddWordModal();

        // Reload words
        await loadWords();

        alert('Thêm từ vựng thành công!');

    } catch (error) {
        console.error('❌ Error adding word:', error);
        errorDiv.textContent = error.message || 'Không thể thêm từ vựng. Vui lòng thử lại!';
        errorDiv.style.display = 'block';
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Lưu';
    }
}

// Open Edit Word Modal
function openEditWordModal(id, english_word, meaning, pronunciation, example_sentence) {
    const modal = document.getElementById('editWordModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Fill form
        document.getElementById('editWordId').value = id;
        document.getElementById('editWordEnglish').value = english_word;
        document.getElementById('editWordMeaning').value = meaning;
        document.getElementById('editWordPronunciation').value = pronunciation;
        document.getElementById('editWordExample').value = example_sentence;
        
        document.getElementById('editWordError').style.display = 'none';
    }
}

// Close Edit Word Modal
function closeEditWordModal() {
    const modal = document.getElementById('editWordModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Update Word
async function updateWord() {
    const id = document.getElementById('editWordId').value;
    const english_word = document.getElementById('editWordEnglish').value.trim();
    const meaning = document.getElementById('editWordMeaning').value.trim();
    const pronunciation = document.getElementById('editWordPronunciation').value.trim();
    const example_sentence = document.getElementById('editWordExample').value.trim();
    const errorDiv = document.getElementById('editWordError');

    // Validate
    if (!english_word) {
        errorDiv.textContent = 'Vui lòng nhập từ tiếng Anh!';
        errorDiv.style.display = 'block';
        return;
    }

    if (!meaning) {
        errorDiv.textContent = 'Vui lòng nhập nghĩa tiếng Việt!';
        errorDiv.style.display = 'block';
        return;
    }

    // Disable button
    const updateBtn = document.getElementById('updateWordBtn');
    updateBtn.disabled = true;
    updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang cập nhật...';
    errorDiv.style.display = 'none';

    try {
        const token = auth.getToken();
        if (!token) {
            throw new Error('Vui lòng đăng nhập!');
        }

        const response = await api.put(`/words/${id}`, {
            english_word,
            meaning,
            pronunciation: pronunciation || null,
            example_sentence: example_sentence || null
        }, token);

        console.log('✅ Word updated:', response);

        // Close modal
        closeEditWordModal();

        // Reload words
        await loadWords();

        alert('Cập nhật từ vựng thành công!');

    } catch (error) {
        console.error('❌ Error updating word:', error);
        errorDiv.textContent = error.message || 'Không thể cập nhật từ vựng. Vui lòng thử lại!';
        errorDiv.style.display = 'block';
    } finally {
        updateBtn.disabled = false;
        updateBtn.innerHTML = '<i class="fas fa-save"></i> Cập nhật';
    }
}

// Confirm Delete Word
async function confirmDeleteWord() {
    const id = document.getElementById('editWordId').value;
    const english_word = document.getElementById('editWordEnglish').value;

    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa từ "${english_word}"?\n\nHành động này không thể hoàn tác!`);
    
    if (!confirmDelete) {
        return;
    }

    try {
        const token = auth.getToken();
        if (!token) {
            throw new Error('Vui lòng đăng nhập!');
        }

        const response = await api.delete(`/words/${id}`, token);

        console.log('✅ Word deleted:', response);

        // Close modal
        closeEditWordModal();

        // Reload words
        await loadWords();

        alert('Đã xóa từ vựng thành công!');

    } catch (error) {
        console.error('❌ Error deleting word:', error);
        alert(error.message || 'Không thể xóa từ vựng. Vui lòng thử lại!');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const addModal = document.getElementById('addWordModal');
    const editModal = document.getElementById('editWordModal');
    const listModal = document.getElementById('wordListModal');
    
    if (event.target === addModal) {
        closeAddWordModal();
    }
    if (event.target === editModal) {
        closeEditWordModal();
    }
    if (event.target === listModal) {
        closeWordListModal();
    }
}
