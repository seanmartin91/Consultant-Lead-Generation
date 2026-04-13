const AVATAR_COLORS = ['av-purple', 'av-teal', 'av-coral', 'av-blue'];

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

async function generateLeads() {
  const industry = document.getElementById('industry').value;
  const size     = document.getElementById('size').value;
  const role     = document.getElementById('role').value;
  const geo      = document.getElementById('geo').value;
  const pain     = document.getElementById('pain').value;
  const offer    = document.getElementById('offer').value || 'IT sales consulting and procurement advisory';
  const count    = document.getElementById('count').value;
  const apiKey   = document.getElementById('apiKey').value.trim();

  if (!apiKey) {
    alert('Please enter your Anthropic API key to generate leads.');
    return;
  }

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = `<div class="loading">Generating ${count} qualified leads...</div>`;

  const prompt = `You are a B2B lead generation expert for Sean Martin, an IT sales professional based in Niagara Falls, Ontario. He has 8+ years of IT sales experience, ran his own IT services company, and consistently exceeds revenue targets ($5M+ achieved at his last role).

Generate ${count} realistic, specific fictional prospect leads matching this profile:
- Industry: ${industry}
- Company size: ${size}
- Decision maker role: ${role}
- Geography: ${geo}
- Pain point: ${pain}
- Sean's offer: ${offer}

For each lead return a JSON object with these exact fields:
- name: full name (realistic Canadian/North American name)
- title: job title
- company: company name (realistic, specific, not generic)
- city: specific city in ${geo}
- employees: number like "45 employees"
- pain_signal: one specific, concrete reason this company likely has the pain point (e.g. "Still running Windows Server 2012, last IT upgrade was 2019")
- score: either "Hot" or "Warm"
- linkedin_message: a short, personalized LinkedIn connection request message (under 300 characters) written in Sean's voice — confident, direct, IT-savvy. Reference the company or pain point specifically. Do NOT use generic openers like "I came across your profile".
- email_subject: a punchy cold email subject line (under 60 chars)
- email_body: a 3-sentence cold email body. Sentence 1: specific hook about their situation. Sentence 2: what Sean offers and one credibility point. Sentence 3: a low-friction CTA.

Return ONLY a valid JSON array of ${count} objects. No markdown, no explanation, no backticks.`;

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error?.message || `API error ${resp.status}`);
    }

    const data = await resp.json();
    const raw  = data.content.map(b => b.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();
    const leads = JSON.parse(clean);
    renderLeads(leads, industry, pain);
  } catch (e) {
    resultsDiv.innerHTML = `<div class="error">Error: ${e.message}</div>`;
  }
}

function renderLeads(leads, industry, pain) {
  const resultsDiv = document.getElementById('results');
  const hot  = leads.filter(l => l.score === 'Hot').length;
  const warm = leads.filter(l => l.score === 'Warm').length;

  let html = `
    <p class="section-label" style="margin-top:1.5rem;">${leads.length} leads — ${industry} · ${pain}</p>
    <div class="stats-row">
      <div class="stat-box"><div class="stat-n">${leads.length}</div><div class="stat-l">Total leads</div></div>
      <div class="stat-box"><div class="stat-n" style="color:var(--green-text)">${hot}</div><div class="stat-l">Hot leads</div></div>
      <div class="stat-box"><div class="stat-n" style="color:var(--amber-text)">${warm}</div><div class="stat-l">Warm leads</div></div>
    </div>`;

  leads.forEach((lead, i) => {
    const av    = AVATAR_COLORS[i % AVATAR_COLORS.length];
    const ini   = initials(lead.name);
    const score = lead.score === 'Hot' ? 'score-hot' : 'score-warm';
    const liId  = `li-${i}`;
    const emId  = `em-${i}`;

    html += `
    <div class="lead-card">
      <div class="lead-top">
        <div class="lead-avatar ${av}">${ini}</div>
        <div>
          <div class="lead-name">${lead.name}</div>
          <div class="lead-meta">${lead.title} · ${lead.company}</div>
        </div>
        <span class="score-pill ${score}">${lead.score}</span>
      </div>
      <div class="field-row"><span class="field-lbl">Location</span><span class="field-val">${lead.city}</span></div>
      <div class="field-row"><span class="field-lbl">Size</span><span class="field-val">${lead.employees}</span></div>
      <div class="field-row"><span class="field-lbl">Pain signal</span><span class="field-val">${lead.pain_signal}</span></div>
      <hr />
      <div class="msg-label">LinkedIn message (${lead.linkedin_message.length} chars)</div>
      <div class="msg-box" id="${liId}">${lead.linkedin_message}</div>
      <button class="copy-btn" onclick="copyText('${liId}', this, 'Copy LinkedIn message')">Copy LinkedIn message</button>
      <hr style="margin-top:10px;" />
      <div class="msg-label">Cold email</div>
      <div class="msg-box" id="${emId}"><strong>Subject: </strong>${lead.email_subject}<br><br>${lead.email_body}</div>
      <button class="copy-btn" onclick="copyEmail('${lead.email_subject}', '${lead.email_body.replace(/'/g,"\\'")}', this)">Copy email</button>
    </div>`;
  });

  resultsDiv.innerHTML = html;
}

function copyText(id, btn, originalLabel) {
  const text = document.getElementById(id).innerText;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = originalLabel; }, 2000);
  });
}

function copyEmail(subject, body, btn) {
  const text = `Subject: ${subject}\n\n${body}`;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy email'; }, 2000);
  });
}
