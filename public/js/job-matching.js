document.addEventListener('DOMContentLoaded', () => {
  const jobForm = document.getElementById('job-matching-form');
  const jobDescription = document.getElementById('job-description');
  const matchButton = document.getElementById('match-button');
  const statusMessage = document.getElementById('match-status');
  const resultContainer = document.getElementById('matching-results');
  const loadingSpinner = document.getElementById('loading-spinner');
  
  if (jobForm) {
    jobForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const description = jobDescription.value.trim();
      if (!description) {
        showError('Please enter a job description');
        return;
      }
      
      try {
        // Show loading state
        matchButton.disabled = true;
        loadingSpinner.classList.remove('hidden');
        statusMessage.textContent = 'Finding matches...';
        statusMessage.classList.remove('text-red-500');
        statusMessage.classList.add('text-gray-500');
        resultContainer.innerHTML = '';
        
        // Get selected resumes if any
        const selectedResumes = Array.from(document.querySelectorAll('input[name="resume-select"]:checked')).map(el => el.value);
        
        // Call job matching API
        const response = await fetch('/api/job-match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobDescription: description,
            resumeIds: selectedResumes.length > 0 ? selectedResumes : null
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Matching failed');
        }
        
        const result = await response.json();
        
        // Display results
        if (result.success && result.matches.length > 0) {
          displayMatches(result.matches);
          statusMessage.textContent = `Found ${result.matches.length} matching candidates`;
          statusMessage.classList.remove('text-red-500', 'text-gray-500');
          statusMessage.classList.add('text-green-500');
        } else {
          resultContainer.innerHTML = '<div class="text-center p-6 bg-gray-50 rounded-lg"><p class="text-gray-500">No matching candidates found</p></div>';
          statusMessage.textContent = 'No matches found for this job description';
          statusMessage.classList.remove('text-red-500', 'text-green-500');
          statusMessage.classList.add('text-gray-500');
        }
      } catch (error) {
        console.error('Matching error:', error);
        showError(error.message || 'An error occurred during matching');
      } finally {
        matchButton.disabled = false;
        loadingSpinner.classList.add('hidden');
      }
    });
  }
  
  function displayMatches(matches) {
    resultContainer.innerHTML = '';
    
    matches.forEach(match => {
      // Determine match color class based on match score
      let matchColorClass = 'bg-red-100 border-red-300';
      if (match.score >= 75) {
        matchColorClass = 'bg-green-100 border-green-300';
      } else if (match.score >= 50) {
        matchColorClass = 'bg-yellow-100 border-yellow-300';
      }
      
      const matchElement = document.createElement('div');
      matchElement.className = `mb-4 p-4 rounded-lg border ${matchColorClass} transition-all hover:shadow-md`;
      
      // Build match content
      matchElement.innerHTML = `
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">${match.name || 'Candidate #' + match.resumeId}</h3>
          <span class="text-sm font-bold rounded-full px-3 py-1 ${match.score >= 75 ? 'bg-green-500' : match.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'} text-white">
            ${match.score}% Match
          </span>
        </div>
        <div class="mt-2">
          <p class="text-gray-700">${match.email || 'No email available'}</p>
          <div class="mt-3">
            <h4 class="font-medium text-sm text-gray-700">Matching Skills:</h4>
            <div class="flex flex-wrap gap-2 mt-1">
              ${match.matchingSkills.map(skill => 
                `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${skill}</span>`
              ).join('')}
            </div>
          </div>
          <div class="mt-4">
            <a href="/candidate/${match.resumeId}" class="text-blue-600 hover:underline text-sm font-medium">
              View Full Profile →
            </a>
          </div>
        </div>
      `;
      
      resultContainer.appendChild(matchElement);
    });
  }
  
  function showError(message) {
    statusMessage.textContent = message;
    statusMessage.classList.remove('text-green-500', 'text-gray-500');
    statusMessage.classList.add('text-red-500');
  }
}); 