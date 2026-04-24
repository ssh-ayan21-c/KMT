import re

with open('frontend/src/pages/AdminDashboard.jsx', 'r') as f:
    content = f.read()

target1 = r"<h4 style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Category Authorizations</h4>"

replace1 = """<div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', margin: 0 }}>Category Authorizations</h4>
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <select 
                                            className="input-glass" 
                                            style={{ width: '100%', fontSize: '0.8rem', padding: '0.6rem' }}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    toggleClientCategory(selectedClient, e.target.value);
                                                    e.target.value = "";
                                                }
                                            }}
                                        >
                                            <option value="">+ Manually Authorize Category (Proactive Grant)</option>
                                            {categories.filter(c => !selectedClient.approvedCategories?.some(ac => ac._id === c._id)).map(c => (
                                                <option key={c._id} value={c._id}>Grant Access: {c.name}</option>
                                            ))}
                                        </select>
                                    </div>"""

content = content.replace(target1, replace1)

target2 = r"Client hasn't initiated any requests. Use the dropdown above to approve their account and expressly assign a specific category."
replace2 = r"Client hasn't initiated any requests. Use the dropdown above to approve their account and expressly assign a specific category."

if "No category tracking recorded yet." in content:
    content = content.replace("No category tracking recorded yet.", replace2)

with open('frontend/src/pages/AdminDashboard.jsx', 'w') as f:
    f.write(content)
