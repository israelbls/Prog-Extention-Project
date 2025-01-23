document.addEventListener('DOMContentLoaded', () => {
  const dropdownChecklist = document.querySelector('.dropdown-checklist');
  const dropdownToggle = dropdownChecklist.querySelector('.dropdown-toggle');
  const dropdownMenu = dropdownChecklist.querySelector('.dropdown-menu');
  const checkboxes = dropdownMenu.querySelectorAll('input[type="checkbox"]');
  const saveButton = document.getElementById('save-button');

  saveButton.addEventListener('click', saveSettings);
  loadSettings();

  function saveSettings() {
    // Collect language setting
    const language = document.getElementById('language').value;

    // Collect post weight settings
    const postWeightCheckboxes = document.querySelectorAll('input[name="post-weight"]:checked');
    const postWeight = Array.from(postWeightCheckboxes).map(cb => cb.value);

    // Collect statistics settings
    const statsCheckboxes = document.querySelectorAll('input[name="stats"]:checked');
    const stats = Array.from(statsCheckboxes).map(cb => cb.value);

    // Collect notes
    const notes = document.getElementById('notes').value;

    // Create settings object
    const settings = {
      language,
      postWeight,
      stats,
      notes
    };

    // Save to localStorage
    try {
      localStorage.setItem('extensionSettings', JSON.stringify(settings));
      alert('הגדרות נשמרו בהצלחה!');
    } catch (error) {
      console.error('שגיאה בשמירת ההגדרות:', error);
      alert('אירעה שגיאה בשמירת ההגדרות.');
    }
  }

  function loadSettings() {
    try {
      const savedSettings = localStorage.getItem('extensionSettings');

      if (savedSettings) {
        const settings = JSON.parse(savedSettings);

        // Restore language
        if (settings.language) {
          document.getElementById('language').value = settings.language;
        }

        // Restore post weight checkboxes
        if (settings.postWeight) {
          settings.postWeight.forEach(value => {
            const checkbox = document.querySelector(`input[name="post-weight"][value="${value}"]`);
            if (checkbox) checkbox.checked = true;
          });
        }

        // Restore statistics checkboxes
        if (settings.stats) {
          settings.stats.forEach(value => {
            const checkbox = document.querySelector(`input[name="stats"][value="${value}"]`);
            if (checkbox) checkbox.checked = true;
          });
        }

        // Restore notes
        if (settings.notes) {
          document.getElementById('notes').value = settings.notes;
        }
      }
    } catch (error) {
      console.error('שגיאה בטעינת ההגדרות:', error);
    }
  }

  // Toggle dropdown
  dropdownToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownChecklist.classList.toggle('open');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdownChecklist.contains(e.target)) {
      dropdownChecklist.classList.remove('open');
    }
  });

  // Prevent dropdown menu clicks from closing the dropdown
  dropdownMenu.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Update dropdown toggle text based on selected checkboxes
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const selectedItems = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.nextElementSibling.textContent);

      dropdownToggle.textContent = selectedItems.length > 0
        ? selectedItems.join(', ')
        : 'בחר דרגות...';
    });
  });
});