document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('resume-upload-form');
  const fileInput = document.getElementById('resume-file');
  const uploadButton = document.getElementById('upload-button');
  const statusMessage = document.getElementById('upload-status');
  const progressBar = document.getElementById('upload-progress');
  const progressContainer = document.getElementById('progress-container');
  const resultContainer = document.getElementById('analysis-result');
  
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const file = fileInput.files[0];
      if (!file) {
        showError('Please select a file to upload');
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        showError('Invalid file type. Please upload a PDF or Word document.');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('File size exceeds 5MB limit. Please upload a smaller file.');
        return;
      }
      
      try {
        // Show progress
        progressContainer.classList.remove('hidden');
        uploadButton.disabled = true;
        statusMessage.textContent = 'Uploading...';
        
        const formData = new FormData();
        formData.append('resume', file);
        
        // Upload file and analyze
        const response = await fetch('/api/resume/upload', {
          method: 'POST',
          body: formData,
          // Don't set Content-Type header with fetch when using FormData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }
        
        const result = await response.json();
        
        // Show success message
        statusMessage.textContent = 'Resume uploaded and analyzed successfully!';
        statusMessage.classList.remove('text-red-500');
        statusMessage.classList.add('text-green-500');
        
        // Update progress to 100%
        progressBar.style.width = '100%';
        
        // Display analysis results or redirect
        if (result.resumeId) {
          setTimeout(() => {
            window.location.href = `/candidate/${result.resumeId}`;
          }, 1000);
        }
      } catch (error) {
        console.error('Upload error:', error);
        showError(error.message || 'An error occurred during upload');
        progressBar.style.width = '0%';
      } finally {
        uploadButton.disabled = false;
      }
    });
    
    // Preview file name when selected
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) {
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('file-preview').classList.remove('hidden');
      }
    });
  }
  
  function showError(message) {
    statusMessage.textContent = message;
    statusMessage.classList.remove('text-green-500');
    statusMessage.classList.add('text-red-500');
  }
}); 