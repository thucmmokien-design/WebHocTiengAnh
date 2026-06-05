// =========================
// PRACTICE PAGE JAVASCRIPT
// =========================

// Selected avatar file
let selectedAvatarFile = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Wait a bit for navbar to load from home.js
    setTimeout(() => {
        loadVocabSets();
    }, 500);

    // Add event listener for avatar file input
    const avatarInput = document.getElementById('vocabAvatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarChange);
    }

    // Add event listener for edit avatar input
    const editAvatarInput = document.getElementById('editVocabAvatarInput');
    if (editAvatarInput) {
        editAvatarInput.addEventListener('change', handleEditAvatarChange);
    }
});

// Load Vocabulary Sets from API
async function loadVocabSets() {
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const vocabSetsGrid = document.getElementById('vocab-sets-grid');

    try {
        // Check if user is authenticated
        if (!auth.isAuthenticated()) {
            loading.style.display = 'none';
            showError('Vui lòng đăng nhập để xem danh sách từ vựng');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        // Show loading
        loading.style.display = 'flex';
        errorMessage.style.display = 'none';
        vocabSetsGrid.innerHTML = '';

        // Get token from localStorage
        const token = auth.getToken();

        // Fetch vocab sets from API with authentication
        const response = await api.get('/vocab_set', token);
        
        // Hide loading
        loading.style.display = 'none';

        // Check if response has data
        if (response && response.data && response.data.length > 0) {
            displayVocabSets(response.data);
        } else {
            showError('Không có bộ từ vựng nào được tìm thấy');
        }

    } catch (error) {
        console.error('Error loading vocab sets:', error);
        loading.style.display = 'none';
        
        // Check if error is authentication related
        if (error.message.includes('Token') || error.message.includes('đăng nhập')) {
            showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            
            // Clear token and redirect to login
            auth.removeToken();
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showError('Không thể tải danh sách từ vựng. Vui lòng thử lại sau.');
        }
    }
}

// Display Vocabulary Sets
function displayVocabSets(vocabSets) {
    const vocabSetsGrid = document.getElementById('vocab-sets-grid');
    vocabSetsGrid.innerHTML = '';

    // Sắp xếp theo ID tăng dần
    const sortedVocabSets = [...vocabSets].sort((a, b) => a.id - b.id);

    console.log('📊 Sorted vocab sets:', sortedVocabSets.length, 'items');

    // Kiểm tra có dữ liệu không
    if (sortedVocabSets.length === 0) {
        vocabSetsGrid.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Không có bộ từ vựng nào.</p>';
        return;
    }

    // Hiển thị tất cả các bộ từ
    sortedVocabSets.forEach(vocabSet => {
        const vocabSetCard = createVocabSetCard(vocabSet);
        vocabSetsGrid.appendChild(vocabSetCard);
    });

    // Thêm card "Thêm bộ từ mới" ở cuối
    const addNewCard = createAddNewCard();
    vocabSetsGrid.appendChild(addNewCard);
}

// Create Vocabulary Set Card
function createVocabSetCard(vocabSet) {
    const card = document.createElement('div');
    card.className = 'vocab-set-card';
    
    // Kiểm tra avatar_url có hợp lệ không
    const hasValidAvatar = vocabSet.avatar_url && 
                          vocabSet.avatar_url !== "0" && 
                          vocabSet.avatar_url.trim() !== "";
    
    let imageContent = '';
    if (hasValidAvatar) {
        // Có avatar hợp lệ - hiển thị ảnh
        const avatarUrl = vocabSet.avatar_url.startsWith('/uploads') 
            ? `http://localhost:3000${vocabSet.avatar_url}`
            : vocabSet.avatar_url;
        imageContent = `<img src="${avatarUrl}" alt="${vocabSet.title}">`;
    }
    // Không có avatar - để trống (background trắng)

    // Kiểm tra xem user có phải là chủ sở hữu không
    const currentUser = auth.getUser();
    const isOwner = currentUser && currentUser.id === vocabSet.created_by;
    const canDelete = isOwner && vocabSet.is_public === 0; // Chỉ xóa được nếu is_public = 0

    card.innerHTML = `
        <div class="vocab-set-image">
            ${imageContent}
            ${isOwner ? `
                <div class="vocab-actions">
                    <button class="btn-manage-words" onclick="openManageWordsModal(${vocabSet.id}, '${vocabSet.title.replace(/'/g, "\\'")}')" title="Quản lý từ vựng">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="btn-edit-vocab" onclick="openEditVocabSetModal(${vocabSet.id}, '${vocabSet.title.replace(/'/g, "\\'")}', '${(vocabSet.description || '').replace(/'/g, "\\'")}', '${vocabSet.avatar_url || ''}')" title="Sửa bộ từ vựng">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${canDelete ? `
                        <button class="btn-delete-vocab" onclick="deleteVocabSet(${vocabSet.id}, '${vocabSet.title.replace(/'/g, "\\'")}')" title="Xóa bộ từ vựng">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    ` : ''}
                </div>
            ` : ''}
        </div>
        <div class="vocab-set-content">
            <h3 class="vocab-set-title">${vocabSet.title}</h3>
            <p class="vocab-set-description">${vocabSet.description || 'Không có mô tả'}</p>
            <div class="vocab-set-footer">
                <div class="vocab-set-stats">
                    <span class="word-count">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                        </svg>
                        ${vocabSet.word_count || 0} từ
                    </span>
                    ${vocabSet.is_public ? '<span class="badge-public"><i class="fas fa-globe"></i> Công khai</span>' : '<span class="badge-private"><i class="fas fa-lock"></i> Riêng tư</span>'}
                </div>
                <button class="btn-practice" onclick="startPractice(${vocabSet.id})">
                    Bắt đầu học
                </button>
            </div>
        </div>
    `;

    return card;
}

// Create "Add New" Card
function createAddNewCard() {
    const card = document.createElement('div');
    card.className = 'vocab-set-card add-new-card';
    card.onclick = openAddVocabSetModal;
    
    card.innerHTML = `
        <div class="vocab-set-image add-new-image">
            <i class="fas fa-plus-circle"></i>
        </div>
        <div class="vocab-set-content">
            <h3 class="vocab-set-title">Thêm Bộ Từ Mới</h3>
            <p class="vocab-set-description">Tạo bộ từ vựng của riêng bạn</p>
        </div>
    `;

    return card;
}

// Start Practice with selected vocab set
function startPractice(vocabSetId) {
    // Store vocab set ID in sessionStorage
    sessionStorage.setItem('currentVocabSetId', vocabSetId);
    
    // Navigate to practice detail page
    window.location.href = `practice-detail.html?setId=${vocabSetId}`;
}

// Show Error Message
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.querySelector('p').textContent = message;
    errorMessage.style.display = 'block';
}

// Refresh vocabulary sets
function refreshVocabSets() {
    loadVocabSets();
}

// =========================
// ADD NEW VOCAB SET
// =========================

// Open modal to add new vocab set
function openAddVocabSetModal() {
    const modal = document.getElementById('addVocabSetModal');
    if (modal) {
        modal.style.display = 'flex';
        // Reset form
        document.getElementById('newVocabSetForm').reset();
        document.getElementById('addVocabError').style.display = 'none';
        
        // Reset avatar preview
        selectedAvatarFile = null;
        const preview = document.getElementById('vocabAvatarPreview');
        preview.innerHTML = '<i class="fas fa-image"></i>';
    }
}

// Close modal
function closeAddVocabSetModal() {
    const modal = document.getElementById('addVocabSetModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Save new vocab set
async function saveNewVocabSet() {
    const title = document.getElementById('vocabTitle').value.trim();
    const description = document.getElementById('vocabDescription').value.trim();
    const errorDiv = document.getElementById('addVocabError');

    // Validate
    if (!title) {
        errorDiv.textContent = 'Vui lòng nhập tiêu đề!';
        errorDiv.style.display = 'block';
        return;
    }

    if (!description) {
        errorDiv.textContent = 'Vui lòng nhập mô tả!';
        errorDiv.style.display = 'block';
        return;
    }

    // Disable button
    const saveBtn = document.getElementById('saveVocabBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    errorDiv.style.display = 'none';

    try {
        const token = auth.getToken();
        if (!token) {
            throw new Error('Vui lòng đăng nhập để thêm bộ từ mới');
        }

        let avatarUrl = null;

        // Upload avatar if selected
        if (selectedAvatarFile) {
            console.log('📤 Uploading avatar...');
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải ảnh...';
            
            const formData = new FormData();
            formData.append('avatar', selectedAvatarFile);

            // Upload to server (vocab set avatar endpoint)
            const uploadResponse = await fetch('http://localhost:3000/api/vocab_set/upload-avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.message || 'Không thể tải ảnh lên. Vui lòng thử lại!');
            }

            const uploadData = await uploadResponse.json();
            // Response structure: { message, avatar_url }
            avatarUrl = uploadData.avatar_url;
            console.log('✅ Avatar uploaded:', avatarUrl);
        }

        // Create vocab set
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo bộ từ...';
        console.log('📤 Creating new vocab set:', { title, description, is_public: 1, avatar_url: avatarUrl });

        const response = await api.post('/vocab_set', {
            title,
            description,
            is_public: 1,
            avatar_url: avatarUrl
        }, token);

        console.log('✅ Vocab set created:', response);

        // Close modal
        closeAddVocabSetModal();

        // Reload vocab sets
        await loadVocabSets();

        // Show success message
        alert('Thêm bộ từ vựng thành công!');

    } catch (error) {
        console.error('❌ Error creating vocab set:', error);
        errorDiv.textContent = error.message || 'Không thể tạo bộ từ vựng. Vui lòng thử lại!';
        errorDiv.style.display = 'block';
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Lưu';
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('addVocabSetModal');
    if (event.target === modal) {
        closeAddVocabSetModal();
    }
}

// =========================
// DELETE VOCAB SET
// =========================
async function deleteVocabSet(vocabSetId, vocabSetTitle) {
    // Xác nhận xóa
    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa bộ từ vựng "${vocabSetTitle}"?\n\nHành động này không thể hoàn tác!`);
    
    if (!confirmDelete) {
        return;
    }

    try {
        const token = auth.getToken();
        if (!token) {
            alert('Vui lòng đăng nhập để xóa bộ từ vựng!');
            return;
        }

        console.log('🗑️ Deleting vocab set:', vocabSetId);

        const response = await api.delete(`/vocab_set/${vocabSetId}`, token);

        console.log('✅ Vocab set deleted:', response);

        // Reload danh sách
        await loadVocabSets();

        alert('Đã xóa bộ từ vựng thành công!');

    } catch (error) {
        console.error('❌ Error deleting vocab set:', error);
        alert(error.message || 'Không thể xóa bộ từ vựng. Vui lòng thử lại!');
    }
}

// Handle avatar file change
function handleAvatarChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB!');
        return;
    }

    // Store file
    selectedAvatarFile = file;

    // Preview image
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('vocabAvatarPreview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
}

// Handle edit avatar file change
function handleEditAvatarChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB!');
        return;
    }

    // Store file
    selectedAvatarFile = file;

    // Preview image
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('editVocabAvatarPreview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
}

// =========================
// EDIT VOCAB SET
// =========================
let currentEditAvatarUrl = null;

function openEditVocabSetModal(id, title, description, avatarUrl) {
    const modal = document.getElementById('editVocabSetModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Fill form with current data
        document.getElementById('editVocabId').value = id;
        document.getElementById('editVocabTitle').value = title;
        document.getElementById('editVocabDescription').value = description;
        
        // Reset avatar
        selectedAvatarFile = null;
        currentEditAvatarUrl = avatarUrl;
        
        const preview = document.getElementById('editVocabAvatarPreview');
        if (avatarUrl && avatarUrl !== '0' && avatarUrl.trim() !== '') {
            const fullAvatarUrl = avatarUrl.startsWith('/uploads') 
                ? `http://localhost:3000${avatarUrl}`
                : avatarUrl;
            preview.innerHTML = `<img src="${fullAvatarUrl}" alt="Current avatar">`;
        } else {
            preview.innerHTML = '<i class="fas fa-image"></i>';
        }
        
        document.getElementById('editVocabError').style.display = 'none';
    }
}

function closeEditVocabSetModal() {
    const modal = document.getElementById('editVocabSetModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function updateVocabSet() {
    const id = document.getElementById('editVocabId').value;
    const title = document.getElementById('editVocabTitle').value.trim();
    const description = document.getElementById('editVocabDescription').value.trim();
    const errorDiv = document.getElementById('editVocabError');

    // Validate
    if (!title) {
        errorDiv.textContent = 'Vui lòng nhập tiêu đề!';
        errorDiv.style.display = 'block';
        return;
    }

    if (!description) {
        errorDiv.textContent = 'Vui lòng nhập mô tả!';
        errorDiv.style.display = 'block';
        return;
    }

    // Disable button
    const updateBtn = document.getElementById('updateVocabBtn');
    updateBtn.disabled = true;
    updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang cập nhật...';
    errorDiv.style.display = 'none';

    try {
        const token = auth.getToken();
        if (!token) {
            throw new Error('Vui lòng đăng nhập để sửa bộ từ');
        }

        let avatarUrl = currentEditAvatarUrl;

        // Upload new avatar if selected
        if (selectedAvatarFile) {
            console.log('📤 Uploading new avatar...');
            updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải ảnh...';
            
            const formData = new FormData();
            formData.append('avatar', selectedAvatarFile);

            const uploadResponse = await fetch('http://localhost:3000/api/vocab_set/upload-avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.message || 'Không thể tải ảnh lên!');
            }

            const uploadData = await uploadResponse.json();
            avatarUrl = uploadData.avatar_url;
            console.log('✅ New avatar uploaded:', avatarUrl);
        }

        // Update vocab set
        updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang cập nhật...';
        console.log('📤 Updating vocab set:', { id, title, description, avatar_url: avatarUrl });

        const response = await api.put(`/vocab_set/${id}`, {
            title,
            description,
            avatar_url: avatarUrl
        }, token);

        console.log('✅ Vocab set updated:', response);

        // Close modal
        closeEditVocabSetModal();

        // Reload vocab sets
        await loadVocabSets();

        alert('Cập nhật bộ từ vựng thành công!');

    } catch (error) {
        console.error('❌ Error updating vocab set:', error);
        errorDiv.textContent = error.message || 'Không thể cập nhật bộ từ vựng. Vui lòng thử lại!';
        errorDiv.style.display = 'block';
    } finally {
        updateBtn.disabled = false;
        updateBtn.innerHTML = '<i class="fas fa-save"></i> Cập nhật';
    }
}


// =========================
// MANAGE WORDS FROM PRACTICE PAGE
// =========================

let currentManageSetId = null;

// Open Manage Words Modal
async function openManageWordsModal(setId, setTitle) {
    currentManageSetId = setId;
    document.getElementById('manageWordsTitle').textContent = setTitle;
    
    const modal = document.getElementById('manageWordsModal');
    if (modal) {
        modal.style.display = 'flex';
        await loadWordsForManage();
    }
}

// Close Manage Words Modal
function closeManageWordsModal() {
    const modal = document.getElementById('manageWordsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Load Words for Manage
async function loadWordsForManage() {
    const container = document.getElementById('manageWordsContainer');
    container.innerHTML = '<p style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>';
    
    try {
        const token = auth.getToken();
        if (!token) {
            throw new Error('Vui lòng đăng nhập!');
        }

        const response = await api.get(`/words/set/${currentManageSetId}`, token);
        
        if (response && response.data) {
            displayWordsForManage(response.data);
        }
    } catch (error) {
        console.error('❌ Error loading words:', error);
        container.innerHTML = `<p style="text-align: center; color: #e74c3c; padding: 2rem;">${error.message}</p>`;
    }
}

// Display Words for Manage
function displayWordsForManage(words) {
    const container = document.getElementById('manageWordsContainer');
    
    if (words.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #95a5a6; padding: 2rem;">Chưa có từ vựng nào. Hãy thêm từ mới!</p>';
        return;
    }
    
    container.innerHTML = '';
    
    words.forEach(word => {
        const item = document.createElement('div');
        item.className = 'word-list-item';
        
        item.innerHTML = `
            <div class="word-list-info">
                <div class="word-list-english">${word.english_word}</div>
                <div class="word-list-meaning">${word.meaning}</div>
                ${word.pronunciation ? `<div class="word-list-pronunciation">${word.pronunciation}</div>` : ''}
            </div>
            <div class="word-list-actions">
                <button class="btn-icon btn-icon-edit" onclick="editWordFromManage(${word.id}, '${word.english_word.replace(/'/g, "\\'")}', '${word.meaning.replace(/'/g, "\\'")}', '${(word.pronunciation || '').replace(/'/g, "\\'")}', '${(word.example_sentence || '').replace(/'/g, "\\'")}')" title="Sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-icon-delete" onclick="deleteWordFromManage(${word.id}, '${word.english_word.replace(/'/g, "\\'")}')" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// Open Add Word Modal (from manage)
function openAddWordModalFromManage() {
    const modal = document.getElementById('addWordModalFromManage');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('addWordFormManage').reset();
        document.getElementById('addWordErrorManage').style.display = 'none';
    }
}

// Close Add Word Modal
function closeAddWordModalFromManage() {
    const modal = document.getElementById('addWordModalFromManage');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Save New Word (from manage)
async function saveNewWordFromManage() {
    const english_word = document.getElementById('wordEnglishManage').value.trim();
    const meaning = document.getElementById('wordMeaningManage').value.trim();
    const pronunciation = document.getElementById('wordPronunciationManage').value.trim();
    const example_sentence = document.getElementById('wordExampleManage').value.trim();
    const errorDiv = document.getElementById('addWordErrorManage');

    if (!english_word || !meaning) {
        errorDiv.textContent = 'Vui lòng nhập đầy đủ thông tin bắt buộc!';
        errorDiv.style.display = 'block';
        return;
    }

    const saveBtn = document.getElementById('saveWordBtnManage');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    errorDiv.style.display = 'none';

    try {
        const token = auth.getToken();
        await api.post('/words', {
            set_id: currentManageSetId,
            english_word,
            meaning,
            pronunciation: pronunciation || null,
            example_sentence: example_sentence || null
        }, token);

        closeAddWordModalFromManage();
        await loadWordsForManage();
        await loadVocabSets(); // Reload vocab sets để cập nhật word_count
        alert('Thêm từ vựng thành công!');

    } catch (error) {
        console.error('❌ Error adding word:', error);
        errorDiv.textContent = error.message || 'Không thể thêm từ vựng!';
        errorDiv.style.display = 'block';
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Lưu';
    }
}

// Edit Word (from manage)
function editWordFromManage(id, english_word, meaning, pronunciation, example_sentence) {
    const modal = document.getElementById('editWordModalFromManage');
    if (modal) {
        modal.style.display = 'flex';
        
        document.getElementById('editWordIdManage').value = id;
        document.getElementById('editWordEnglishManage').value = english_word;
        document.getElementById('editWordMeaningManage').value = meaning;
        document.getElementById('editWordPronunciationManage').value = pronunciation;
        document.getElementById('editWordExampleManage').value = example_sentence;
        
        document.getElementById('editWordErrorManage').style.display = 'none';
    }
}

// Close Edit Word Modal
function closeEditWordModalFromManage() {
    const modal = document.getElementById('editWordModalFromManage');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Update Word (from manage)
async function updateWordFromManage() {
    const id = document.getElementById('editWordIdManage').value;
    const english_word = document.getElementById('editWordEnglishManage').value.trim();
    const meaning = document.getElementById('editWordMeaningManage').value.trim();
    const pronunciation = document.getElementById('editWordPronunciationManage').value.trim();
    const example_sentence = document.getElementById('editWordExampleManage').value.trim();
    const errorDiv = document.getElementById('editWordErrorManage');

    if (!english_word || !meaning) {
        errorDiv.textContent = 'Vui lòng nhập đầy đủ thông tin bắt buộc!';
        errorDiv.style.display = 'block';
        return;
    }

    const updateBtn = document.getElementById('updateWordBtnManage');
    updateBtn.disabled = true;
    updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang cập nhật...';
    errorDiv.style.display = 'none';

    try {
        const token = auth.getToken();
        await api.put(`/words/${id}`, {
            english_word,
            meaning,
            pronunciation: pronunciation || null,
            example_sentence: example_sentence || null
        }, token);

        closeEditWordModalFromManage();
        await loadWordsForManage();
        await loadVocabSets(); // Reload vocab sets để cập nhật word_count
        alert('Cập nhật từ vựng thành công!');

    } catch (error) {
        console.error('❌ Error updating word:', error);
        errorDiv.textContent = error.message || 'Không thể cập nhật từ vựng!';
        errorDiv.style.display = 'block';
    } finally {
        updateBtn.disabled = false;
        updateBtn.innerHTML = '<i class="fas fa-save"></i> Cập nhật';
    }
}

// Delete Word (from manage)
async function deleteWordFromManage(id, english_word) {
    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa từ "${english_word}"?\n\nHành động này không thể hoàn tác!`);
    
    if (!confirmDelete) {
        return;
    }

    try {
        const token = auth.getToken();
        await api.delete(`/words/${id}`, token);

        await loadWordsForManage();
        await loadVocabSets(); // Reload vocab sets để cập nhật word_count
        alert('Đã xóa từ vựng thành công!');

    } catch (error) {
        console.error('❌ Error deleting word:', error);
        alert(error.message || 'Không thể xóa từ vựng!');
    }
}

// Confirm Delete Word (from manage)
async function confirmDeleteWordFromManage() {
    const id = document.getElementById('editWordIdManage').value;
    const english_word = document.getElementById('editWordEnglishManage').value;

    const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa từ "${english_word}"?\n\nHành động này không thể hoàn tác!`);
    
    if (!confirmDelete) {
        return;
    }

    try {
        const token = auth.getToken();
        await api.delete(`/words/${id}`, token);

        closeEditWordModalFromManage();
        await loadWordsForManage();
        await loadVocabSets(); // Reload vocab sets để cập nhật word_count
        alert('Đã xóa từ vựng thành công!');

    } catch (error) {
        console.error('❌ Error deleting word:', error);
        alert(error.message || 'Không thể xóa từ vựng!');
    }
}
