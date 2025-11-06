
  feather.replace();
  AOS.init();

  const fields = [
    { id: 'name', preview: 'previewName', default: 'Your Name' },
    { id: 'title', preview: 'previewTitle', default: 'Your Title' },
    { id: 'summary', preview: 'previewSummary', default: 'Your professional summary will appear here...' },
    { id: 'education', preview: 'previewEducation', default: 'Your education details will appear here...' },
    { id: 'certifications', preview: 'previewCertifications', default: 'Your certifications will appear here...' },
    { id: 'awards', preview: 'previewAwards', default: 'Your awards will appear here...' }
  ];

  fields.forEach(f => {
    const input = document.getElementById(f.id);
    const preview = document.getElementById(f.preview);
    if (input && preview) {
      input.addEventListener('input', () => preview.textContent = input.value || f.default);
    }
  });

  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const emailPhonePreview = document.getElementById('previewEmailPhone');
  function updateContact() {
    const email = emailInput?.value || 'you@example.com';
    const phone = phoneInput?.value || '+234 000 000 0000';
    emailPhonePreview.textContent = `${email} | ${phone}`;
  }
  emailInput?.addEventListener('input', updateContact);
  phoneInput?.addEventListener('input', updateContact);

  // ===== AI SUMMARY =====
  document.getElementById('aiSuggestSummary').addEventListener('click', async () => {
    const title = document.getElementById('title').value;
    if (!title) return alert("Please enter a job title first!");
    try {
      const res = await fetch("http://localhost:3000/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      document.getElementById('summary').value = data.text;
      document.getElementById('previewSummary').textContent = data.text;
    } catch (err) {
      alert("Error generating AI summary: " + err.message);
    }
  });

  // ===== AI EXPERIENCE =====
  document.getElementById('aiSuggestExperience').addEventListener('click', async () => {
    const company = document.getElementById('company').value || "Company Name";
    const jobTitle = document.getElementById('jobTitle').value || "Job Title";
    const dates = document.getElementById('dates').value || "Dates";
    const title = document.getElementById('title').value;

    try {
      const res = await fetch("http://localhost:3000/api/ai-experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, company, jobTitle }),
      });
      const data = await res.json();
      const bullets = data.text.split(/\n|•|-/).filter(b => b.trim().length > 5);
      document.getElementById('experience').value = bullets.map(b => `• ${b.trim()}`).join('\n');
      const formattedHTML = `
        <div class="mb-3">
          <h4 class="text-lg font-semibold text-white">${company}</h4>
          <p class="text-sm text-gray-400 italic mb-2">${jobTitle} | ${dates}</p>
          <ul class="list-disc list-inside text-gray-300 space-y-1">
            ${bullets.map(b => `<li>${b.trim().replace(/^•/, '')}</li>`).join('')}
          </ul>
        </div>`;
      document.getElementById('previewExperience').innerHTML = formattedHTML;
    } catch (err) {
      alert("Error generating AI experience: " + err.message);
    }
  });

  // ===== Live Previews =====
  const expInput = document.getElementById('experience');
  const companyInput = document.getElementById('company');
  const jobInput = document.getElementById('jobTitle');
  const dateInput = document.getElementById('dates');

  function renderExperience() {
    const bullets = expInput?.value.split(/\n/).filter(b => b.trim().length > 0) || [];
    const html = `
      <div class="mb-3">
        <h4 class="text-lg font-semibold text-white">${companyInput?.value || 'Company Name'}</h4>
        <p class="text-sm text-gray-400 italic mb-2">${jobInput?.value || 'Job Title'} | ${dateInput?.value || 'Dates'}</p>
        <ul class="list-disc list-inside text-gray-300 space-y-1">${bullets.map(b => `<li>${b.trim().replace(/^•/, '')}</li>`).join('')}</ul>
      </div>`;
    document.getElementById('previewExperience').innerHTML = html;
  }
  [expInput, companyInput, jobInput, dateInput].forEach(el => el?.addEventListener('input', renderExperience));

  const skillsInput = document.getElementById('skills');
  const skillsPreview = document.getElementById('previewSkills');
  function renderSkills() {
    const skills = skillsInput?.value.split(',').map(s => s.trim()).filter(Boolean) || [];
    skillsPreview.innerHTML = skills.length
      ? skills.map(s => `<span class='bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm'>${s}</span>`).join('')
      : `<span class='bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm'>Your Skills</span>`;
  }
  skillsInput?.addEventListener('input', renderSkills);

  window.addEventListener('DOMContentLoaded', () => {
    fields.forEach(f => {
      const el = document.getElementById(f.id);
      const pv = document.getElementById(f.preview);
      if (pv) pv.textContent = el?.value || f.default;
    });
    updateContact();
    renderExperience();
    renderSkills();
  });

  // ===== FIXED PDF EXPORT (STABLE & TESTED) =====
  document.getElementById('downloadResume').addEventListener('click', async () => {
    try {
      const name = document.getElementById('previewName')?.textContent.trim() || 'Your Name';
      const emailPhone = document.getElementById('previewEmailPhone')?.textContent.trim() || 'you@example.com | +234 000 000 0000';
      const title = document.getElementById('previewTitle')?.textContent.trim() || 'Your Title';
      const summary = document.getElementById('previewSummary')?.textContent.trim() || 'Professional summary goes here.';
      const company = document.getElementById('company')?.value || 'Company Name';
      const jobTitle = document.getElementById('jobTitle')?.value || 'Job Title';
      const dates = document.getElementById('dates')?.value || 'Dates';
      const experienceText = document.getElementById('experience')?.value || 'Your experience goes here.';
      const education = document.getElementById('previewEducation')?.textContent.trim() || 'Your education goes here.';
      const certs = document.getElementById('previewCertifications')?.textContent.trim() || '';
      const awards = document.getElementById('previewAwards')?.textContent.trim() || '';
      const skillsArray = (document.getElementById('skills')?.value || '').split(',').map(s => s.trim()).filter(Boolean);

      const exportHTML = `
        <div style="width:210mm;min-height:297mm;background:white;color:#111;
          font-family:Arial,sans-serif;padding:20mm;box-sizing:border-box;">
          <div style="text-align:center;border-bottom:3px solid #2563eb;padding-bottom:10px;margin-bottom:20px;">
            <h1 style="font-size:28px;font-weight:bold;margin:0;color:#1e3a8a;">${name}</h1>
            <p style="margin:5px 0;color:#666;">${emailPhone}</p>
            <p style="margin:0;color:#2563eb;font-weight:600;">${title}</p>
          </div>
          <h2 style="color:#1e3a8a;border-bottom:2px solid #2563eb;display:inline-block;">Professional Summary</h2>
          <p style="font-size:13px;color:#333;line-height:1.6;">${summary}</p>
          <h2 style="color:#1e3a8a;border-bottom:2px solid #2563eb;display:inline-block;margin-top:15px;">Experience</h2>
          <h3 style="font-size:15px;font-weight:600;margin:5px 0;">${company}</h3>
          <p style="font-size:12px;color:#666;font-style:italic;">${jobTitle} | ${dates}</p>
          ${experienceText.split('\n').filter(line=>line.trim()).map(line=>`<p style="margin:0;padding-left:10px;">• ${line.replace(/^[•\-]\s*/, '')}</p>`).join('')}
          <h2 style="color:#1e3a8a;border-bottom:2px solid #2563eb;display:inline-block;margin-top:15px;">Education</h2>
          <p style="font-size:13px;">${education}</p>
          ${certs?`<h2 style="color:#1e3a8a;border-bottom:2px solid #2563eb;display:inline-block;margin-top:15px;">Certifications</h2><p style="font-size:13px;">${certs}</p>`:''}
          ${awards?`<h2 style="color:#1e3a8a;border-bottom:2px solid #2563eb;display:inline-block;margin-top:15px;">Awards</h2><p style="font-size:13px;">${awards}</p>`:''}
          <h2 style="color:#1e3a8a;border-bottom:2px solid #2563eb;display:inline-block;margin-top:15px;">Skills</h2>
          <div>${skillsArray.length?skillsArray.map(skill=>`<span style="background:#e0e7ff;color:#1e3a8a;padding:5px 10px;border-radius:20px;margin:2px;display:inline-block;font-size:12px;">${skill}</span>`).join(''):'<p style="font-size:13px;">No skills provided.</p>'}</div>
        </div>`;

      const tempWrapper = document.createElement('div');
      tempWrapper.innerHTML = exportHTML;
      tempWrapper.style.position = 'absolute';
      tempWrapper.style.left = '-9999px';
      document.body.appendChild(tempWrapper);
      const element = tempWrapper.firstElementChild;

      await new Promise(resolve => setTimeout(resolve, 200));

      const opt = {
        margin: 0,
        filename: `${name.replace(/\s+/g, '_')}_Resume.pdf`,
        html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#fff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
      document.body.removeChild(tempWrapper);
    } catch (err) {
      console.error('❌ PDF generation error:', err);
      alert('PDF generation failed. Please try again.');
    }
  });
