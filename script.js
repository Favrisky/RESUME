// Initialize AOS animations
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true
});

// Initialize Feather icons
feather.replace();

// Optional: VANTA Globe Background
VANTA.GLOBE({
  el: "#vanta-bg",
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.00,
  minWidth: 200.00,
  scale: 1.00,
  scaleMobile: 1.00,
  color: 0x3b82f6,
  backgroundColor: 0x111827,
  size: 0.8
});

// -----------------------------
// Preview Update Function
// -----------------------------
const updatePreview = () => {
  // Basic Info
  const name = document.getElementById('name').value || 'Your Name';
  const title = document.getElementById('title').value || 'Your Title';
  const summary = document.getElementById('summary').value || 'Your professional summary will appear here...';
  const experience = document.getElementById('experience').value || 'Your work experience will appear here...';

  document.getElementById('previewName').textContent = name;
  document.getElementById('previewTitle').textContent = title;
  document.getElementById('previewSummary').textContent = summary;
  document.getElementById('previewExperience').textContent = experience;

  // Skills
  const skills = document.getElementById('skills').value.split(',')
    .map(s => s.trim())
    .filter(s => s !== '');
  
  const skillsContainer = document.getElementById('previewSkills');
  skillsContainer.innerHTML = '';

  skills.forEach(skill => {
    const span = document.createElement('span');
    span.className = 'bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm';
    span.textContent = skill;
    skillsContainer.appendChild(span);
  });
};

// If you want auto-update as you type, uncomment these lines:
// ['name', 'title', 'summary', 'experience', 'skills'].forEach(id => {
//   document.getElementById(id).addEventListener('input', updatePreview);
// });

// -----------------------------
// AI Suggest Mock Buttons
// -----------------------------
document.getElementById('aiSuggestSummary').addEventListener('click', () => {
  document.getElementById('summary').value =
    "Results-driven software engineer with expertise in scalable web apps, API design, and modern JavaScript frameworks.";
  updatePreview();
});

document.getElementById('aiSuggestExperience').addEventListener('click', () => {
  document.getElementById('experience').value =
    "- Developed responsive applications using React and Node.js.\n" +
    "- Led cross-functional teams to deliver high-impact features.\n" +
    "- Implemented CI/CD pipelines for continuous deployment.";
  updatePreview();
});

// -----------------------------
// Chart.js Resume Analytics
// -----------------------------
const ctx = document.getElementById('resumeChart')?.getContext('2d');

if (ctx) {
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Profile Completeness', 'Skill Diversity', 'Experience Depth', 'Summary Quality'],
      datasets: [{
        label: 'Resume Score',
        data: [85, 70, 90, 80],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#3b82f6',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
        x: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } }
      },
      plugins: { legend: { labels: { color: '#9ca3af' } } }
    }
  });
}

// -----------------------------
// Download PDF
// -----------------------------
const downloadBtn = document.getElementById('downloadResume');
const previewContainer = document.getElementById('previewContainer');

downloadBtn.addEventListener('click', () => {
  const opt = {
    margin: 0.5,
    filename: 'Resume.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(previewContainer).save();
});

// -----------------------------
// Optional: Manual Update Button
// -----------------------------
document.getElementById('updatePreview')?.addEventListener('click', updatePreview);
