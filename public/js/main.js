/**
 * Resume Scout - Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize any components that need setup
    initializeTooltips();
    initializeMatchGauges();
    
    // Set up file upload functionality if on the upload page
    const fileUploadArea = document.querySelector('.file-upload-area');
    if (fileUploadArea) {
        setupFileUpload(fileUploadArea);
    }
    
    // Setup any job matching form
    const jobMatchingForm = document.getElementById('job-matching-form');
    if (jobMatchingForm) {
        setupJobMatchingForm(jobMatchingForm);
    }
    
    // Setup contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        setupContactForm(contactForm);
    }
});

/**
 * Initialize tooltips
 */
function initializeTooltips() {
    // No actual initialization needed with our CSS-only tooltips
    console.log('Tooltips initialized');
}

/**
 * Initialize match percentage gauges
 */
function initializeMatchGauges() {
    const gauges = document.querySelectorAll('.match-gauge-circle');
    
    gauges.forEach(gauge => {
        const percentText = gauge.nextElementSibling.textContent;
        const percent = parseFloat(percentText);
        gauge.style.setProperty('--percentage', `${percent}%`);
        
        // Set color based on percentage
        if (percent >= 75) {
            gauge.style.background = `conic-gradient(#10B981 ${percent}%, #E5E7EB ${percent}%)`;
        } else if (percent >= 50) {
            gauge.style.background = `conic-gradient(#F59E0B ${percent}%, #E5E7EB ${percent}%)`;
        } else {
            gauge.style.background = `conic-gradient(#EF4444 ${percent}%, #E5E7EB ${percent}%)`;
        }
    });
}

/**
 * Set up file upload functionality
 * @param {HTMLElement} uploadArea - The file upload area element
 */
function setupFileUpload(uploadArea) {
    const fileInput = document.getElementById('resume-file');
    const uploadForm = document.getElementById('upload-form');
    const progressBar = document.querySelector('.progress');
    const progressContainer = document.querySelector('.progress-container');
    const uploadStatus = document.getElementById('upload-status');
    
    // Handle drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Add/remove styling on drag events
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('drag-over');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('drag-over');
        });
    });
    
    // Handle dropped files
    uploadArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        fileInput.files = files;
        handleFiles(files);
    });
    
    // Handle file selection via the file input
    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });
    
    // Process the selected files
    function handleFiles(files) {
        if (files.length === 0) return;
        
        const file = files[0];
        
        // Check file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only PDF and Word documents are allowed');
            return;
        }
        
        // Update UI to show file details
        const fileDetails = document.getElementById('file-details');
        if (fileDetails) {
            fileDetails.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
            fileDetails.classList.remove('hidden');
        }
        
        // Show the submit button
        const submitButton = document.querySelector('#upload-form button[type="submit"]');
        if (submitButton) {
            submitButton.classList.remove('hidden');
        }
    }
    
    // Format file size in KB, MB, etc.
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Handle form submission with AJAX
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(uploadForm);
            
            // Show progress container
            if (progressContainer) {
                progressContainer.classList.remove('hidden');
            }
            
            // Use fetch API to upload the file
            fetch(uploadForm.action, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Handle successful upload
                if (progressBar) {
                    progressBar.style.width = '100%';
                }
                
                if (uploadStatus) {
                    uploadStatus.textContent = 'Upload completed!';
                    uploadStatus.classList.add('text-green-600');
                }
                
                // Redirect to candidate page after a delay
                setTimeout(() => {
                    window.location.href = `/candidate/${data.resumeId}`;
                }, 1500);
            })
            .catch(error => {
                console.error('Error:', error);
                
                if (uploadStatus) {
                    uploadStatus.textContent = 'Error: ' + error.message;
                    uploadStatus.classList.add('text-red-600');
                }
            });
            
            // Simulate progress for demo purposes
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
                
                if (progress >= 90) {
                    clearInterval(interval);
                }
            }, 300);
        });
    }
}

/**
 * Set up job matching form functionality
 * @param {HTMLElement} form - The job matching form element
 */
function setupJobMatchingForm(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Searching...';
        submitButton.disabled = true;
        
        // Use fetch API to submit the form
        fetch(form.action, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Display results
            const resultsContainer = document.getElementById('job-match-results');
            if (resultsContainer) {
                resultsContainer.innerHTML = '';
                resultsContainer.classList.remove('hidden');
                
                if (data.matches && data.matches.length > 0) {
                    // Create results HTML
                    data.matches.forEach(match => {
                        const matchElement = createMatchElement(match);
                        resultsContainer.appendChild(matchElement);
                    });
                } else {
                    resultsContainer.innerHTML = '<p class="text-center text-gray-500">No matching candidates found.</p>';
                }
            }
            
            // Reset button
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
            
            // Reset button
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
    });
    
    // Helper function to create a match result element
    function createMatchElement(match) {
        const matchElement = document.createElement('div');
        matchElement.className = 'bg-white p-4 rounded-lg shadow-md mb-4 custom-card';
        
        // Determine match class based on score
        let matchClass = 'match-weak';
        if (match.score >= 75) {
            matchClass = 'match-strong';
        } else if (match.score >= 50) {
            matchClass = 'match-moderate';
        }
        
        // Create the match HTML
        matchElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-lg font-bold">${match.name}</h3>
                    <p class="text-gray-600">${match.email}</p>
                    <div class="mt-2">
                        <span class="inline-block px-2 py-1 text-xs text-white rounded-full ${matchClass}">
                            ${match.score}% Match
                        </span>
                    </div>
                </div>
                <a href="/candidate/${match.id}" class="btn-primary">View Profile</a>
            </div>
        `;
        
        return matchElement;
    }
}

/**
 * Set up contact form functionality
 * @param {HTMLElement} form - The contact form element
 */
function setupContactForm(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form fields
        const nameField = form.querySelector('#name');
        const emailField = form.querySelector('#email');
        const messageField = form.querySelector('#message');
        
        // Create JSON data
        const jsonData = {
            name: nameField.value,
            email: emailField.value,
            message: messageField.value
        };
        
        console.log('Form data to send:', jsonData);
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        // Show message container
        const messageContainer = document.getElementById('contact-message');
        if (messageContainer) {
            messageContainer.innerHTML = '<p>Sending your message...</p>';
            messageContainer.classList.remove('hidden');
            messageContainer.classList.remove('text-red-600', 'text-green-600');
            messageContainer.classList.add('bg-blue-100', 'text-blue-700', 'border-blue-500');
        }
        
        // Testing only - show form data in message container
        if (messageContainer) {
            messageContainer.innerHTML += '<p>Debug: ' + JSON.stringify(jsonData) + '</p>';
        }
        
        // Use fetch API to submit the form with JSON
        fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(jsonData)
        })
        .then(response => {
            console.log('Response status:', response.status);
            return response.json().then(data => {
                console.log('Response data:', data);
                if (!response.ok) {
                    throw new Error(data.message || 'Network response was not ok');
                }
                return data;
            });
        })
        .then(data => {
            // Show success message
            if (messageContainer) {
                messageContainer.textContent = data.message || 'Message sent successfully!';
                messageContainer.classList.remove('bg-blue-100', 'text-blue-700', 'border-blue-500', 'text-red-600');
                messageContainer.classList.add('bg-green-100', 'text-green-700', 'border-green-500');
            }
            
            // Reset form
            form.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            
            // Show error message
            if (messageContainer) {
                messageContainer.textContent = 'An error occurred: ' + error.message;
                messageContainer.classList.remove('bg-blue-100', 'text-blue-700', 'border-blue-500', 'text-green-600');
                messageContainer.classList.add('bg-red-100', 'text-red-700', 'border-red-500');
            }
        })
        .finally(() => {
            // Reset button
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
    });
} 