const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/AdminDashboard.jsx', 'utf8');

const targetStr = `<h4 style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Category Authorizations</h4>`;

const replaceStr = `<div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', margin: 0 }}>Category Authorizations</h4>
</div>
<div style={{ marginBottom: '1rem' }}>
    <select className="input-glass" style={{ width: '100%', fontSize: '0.8rem', padding: '0.6rem' }} onChange={(e) => { if (e.target.value) { toggleClientCategory(selectedClient, e.target.value); e.target.value = ""; } }}>
        <option value="">+ Manually Authorize Category (Proactive Grant)</option>
        {categories.filter(c => !selectedClient.approvedCategories?.some(ac => ac._id === c._id)).map(c => <option key={c._id} value={c._id}>Grant Access: {c.name}</option>)}
    </select>
</div>`;

const newContent = content.replace(targetStr, replaceStr);

const targetStr2 = `{(!selectedClient.requestedCategories?.length && !selectedClient.approvedCategories?.length) && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No category tracking recorded yet.</div>}`;

const replaceStr2 = `{(!selectedClient.requestedCategories?.length && !selectedClient.approvedCategories?.length) && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>Client hasn't initiated any requests. Use the dropdown above to explicitly assign a tracking category.</div>}`;

const finalContent = newContent.replace(targetStr2, replaceStr2);

fs.writeFileSync('frontend/src/pages/AdminDashboard.jsx', finalContent);
console.log("Patched successfully");
