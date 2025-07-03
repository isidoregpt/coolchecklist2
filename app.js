function generateChecklist() {
  const input = document.getElementById('choreInput').value.trim();
  const list = document.getElementById('choreList');
  const stats = document.getElementById('stats');
  
  // Clear previous list
  list.innerHTML = '';

  if (!input) {
    showNotification('Please enter at least one chore! 📝');
    list.innerHTML = '<div class="empty-state">Your chores will appear here once you create your checklist ✨</div>';
    stats.style.display = 'none';
    return;
  }

  // Process chores
  const chores = input.split('\n')
    .map(item => item.trim())
    .filter(item => item)
    .map(item => item.replace(/^[•\-\*]\s*/, '')); // Remove bullet points

  if (chores.length === 0) {
    showNotification('Please enter valid chores! 📝');
    list.innerHTML = '<div class="empty-state">Your chores will appear here once you create your checklist ✨</div>';
    stats.style.display = 'none';
    return;
  }

  // Show stats
  stats.style.display = 'block';
  updateProgress();

  // Create checklist items
  chores.forEach((chore, index) => {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    const choreText = document.createElement('span');
    
    checkbox.type = 'checkbox';
    checkbox.id = `chore-${index}`;
    checkbox.setAttribute('aria-describedby', `chore-text-${index}`);
    
    choreText.className = 'chore-text';
    choreText.id = `chore-text-${index}`;
    choreText.textContent = chore;

    checkbox.addEventListener('change', () => {
      li.classList.toggle('completed', checkbox.checked);
      updateProgress();
      
      // Add completion animation
      if (checkbox.checked) {
        li.style.transform = 'scale(1.02)';
        setTimeout(() => {
          li.style.transform = '';
        }, 200);
        
        // Announce completion for screen readers
        announceCompletion(chore, true);
      } else {
        announceCompletion(chore, false);
      }
    });

    li.appendChild(checkbox);
    li.appendChild(choreText);
    li.setAttribute('role', 'listitem');
    list.appendChild(li);

    // Stagger animation
    li.style.animationDelay = `${index * 0.1}s`;
  });

  // Success feedback
  showNotification(`Created checklist with ${chores.length} chore${chores.length > 1 ? 's' : ''}! 🎉`);
  
  // Update progress bar attributes
  updateProgressBarAttributes();
}

function updateProgress() {
  const checkboxes = document.querySelectorAll('#choreList input[type="checkbox"]');
  const completed = document.querySelectorAll('#choreList input[type="checkbox"]:checked').length;
  const total = checkboxes.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  document.getElementById('completed-count').textContent = `${completed} of ${total} completed`;
  document.getElementById('progress-percent').textContent = `${percentage}%`;
  document.getElementById('progress-fill').style.width = `${percentage}%`;
  
  // Update progress bar accessibility
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    progressBar.setAttribute('aria-valuenow', percentage);
    progressBar.setAttribute('aria-valuetext', `${completed} of ${total} chores completed`);
  }
}

function updateProgressBarAttributes() {
  const progressBar = document.querySelector('.progress-bar');
  if (progressBar) {
    progressBar.setAttribute('aria-label', 'Chore completion progress');
  }
}

function announceCompletion(choreName, isCompleted) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  announcement.textContent = isCompleted 
    ? `Completed: ${choreName}` 
    : `Unchecked: ${choreName}`;
    
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

function showNotification(message) {
  // Create temporary notification
  const notification = document.createElement('div');
  notification.setAttribute('role', 'status');
  notification.setAttribute('aria-live', 'polite');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    font-weight: 500;
    z-index: 1000;
    animation: slideDown 0.3s ease-out;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    max-width: 90vw;
    text-align: center;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideUpOut 0.3s ease-out forwards';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    generateChecklist();
  }
  
  // Escape to clear input
  if (e.key === 'Escape') {
    const textarea = document.getElementById('choreInput');
    if (document.activeElement === textarea) {
      textarea.value = '';
      showNotification('Input cleared! 🗑️');
    }
  }
});

// Auto-focus textarea on load
window.addEventListener('load', () => {
  const textarea = document.getElementById('choreInput');
  textarea.focus();
  
  // Add sample data for demo (remove if not wanted)
  if (!textarea.value) {
    setTimeout(() => {
      showNotification('Welcome! Add your chores above to get started 👋');
    }, 1000);
  }
});

// Handle visibility change for better performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden, pause animations if needed
    document.body.style.animationPlayState = 'paused';
  } else {
    // Page is visible, resume animations
    document.body.style.animationPlayState = 'running';
  }
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW registered'))
      .catch(() => console.log('SW registration failed'));
  });
}
