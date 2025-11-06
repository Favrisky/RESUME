// ===== LIVE PREVIEW =====
    const fields = [
      {id: 'name', preview: 'previewName', default: 'Your Name'},
      {id: 'title', preview: 'previewTitle', default: 'Your Title'},
      {id: 'summary', preview: 'previewSummary', default: 'Your professional summary will appear here...'},
      {id: 'experience', preview: 'previewExperience', default: 'Your work experience will appear here...'}
    ];

    fields.forEach(f => {
      const input = document.getElementById(f.id);
      const preview = document.getElementById(f.preview);
      input.addEventListener('input', () => {
        preview.textContent = input.value || f.default;
      });
    });

    // Skills
    const skillsInput = document.getElementById('skills');
    const skillsPreview = document.getElementById('previewSkills');

    skillsInput.addEventListener('input', () => {
      const skills = skillsInput.value.split(',').map(s => s.trim()).filter(Boolean);
      skillsPreview.innerHTML = '';
      if (skills.length === 0) {
        const span = document.createElement('span');
        span.textContent = 'Your Skills';
        span.className = 'bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm';
        skillsPreview.appendChild(span);
      } else {
        skills.forEach(skill => {
          const span = document.createElement('span');
          span.textContent = skill;
          span.className = 'bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm';
          skillsPreview.appendChild(span);
        });
      }
    });

    // AI Suggest placeholders
    document.getElementById('aiSuggestSummary').addEventListener('click', () => {
      document.getElementById('summary').value = "Experienced software engineer with a proven record of delivering high-quality web applications. Skilled in JavaScript, React, and Node.js.";
      document.getElementById('summary').dispatchEvent(new Event('input'));
    });

    document.getElementById('aiSuggestExperience').addEventListener('click', () => {
      document.getElementById('experience').value = "Senior Software Engineer at TechCorp (2020-2025): Developed scalable web apps and led a team of 5 engineers.";
      document.getElementById('experience').dispatchEvent(new Event('input'));
    });

    // Template switch
    const templateSelect = document.getElementById('templateSelect');
    const previewContainer = document.getElementById('previewContainer');

    templateSelect.addEventListener('change', () => {
      previewContainer.className = 'resume-preview rounded-lg p-8 shadow-2xl transition-all duration-300';
      const value = templateSelect.value;
      if (value === 'default') previewContainer.classList.add('bg-gray-800', 'text-white');
      if (value === 'light') previewContainer.classList.add('bg-white', 'text-gray-900');
      if (value === 'elegant') previewContainer.classList.add('bg-blue-500', 'text-white');
    });

    // Feather icons
    feather.replace();

    // AOS animations
    AOS.init();
  