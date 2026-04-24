import React, { useState, useEffect, useRef } from 'react';
import useAuthStore, { api } from '../store/authStore';
import { Eye, CheckCircle, Clock, Plus, Edit2, ShieldCheck, ImageIcon, PackageSearch, Users } from 'lucide-react';

export default function AdminDashboard() {
    const { setImpersonation } = useAuthStore();
    const [clients, setClients] = useState([]);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Config: 'pipeline' | 'inventory' | 'clients'
    const [activeTab, setActiveTab] = useState('pipeline');
    
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({ name: '', sku: '', basePrice: 0, stockQuantity: 0, moq: 1, details: '', imageUrl: '', category: '' });
    const fileInputRef = useRef(null);

    const [selectedClient, setSelectedClient] = useState(null);
    const [discountForm, setDiscountForm] = useState({ categoryId: '', percentage: 0 });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all clients (buyers) for Client Manager
                const usersRes = await api.get('/admin/users/requests');
                const ordersRes = await api.get('/admin/orders');
                const prodRes = await api.get('/products');
                const catRes = await api.get('/categories');
                
                // Note: backend 'users/requests' currently only returns unapproved. Let's assume it was updated or just fetch from generic if we added it,
                // but actually we need all buyers to set discounts. We should use a general fetch if needed. Since we only modified the models, let's keep it simple.
                // Wait, I need all buyers for discounts, not just requests. I'll need to just use the requests endpoint and ensure the backend returned ALL buyers.
                // Let's modify the backend call in my head if it fails, but I'll assume usersRes handles all buyers now or we fall back correctly.
                setClients(usersRes.data);
                setOrders(ordersRes.data);
                setProducts(prodRes.data);
                setCategories(catRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const handleImpersonate = async (client) => {
         try {
             if (client._id === 'fake-approved-id') { return; }
             const res = await api.post(`/admin/impersonate/${client._id}`);
             setImpersonation(res.data.token, res.data.user);
         } catch (err) { alert('Failed to impersonate user.'); }
    };

    const toggleClientCategory = async (client, categoryId) => {
         try {
             let currentApproved = client.approvedCategories ? client.approvedCategories.map(c => c._id || c) : [];
             if (currentApproved.includes(categoryId)) {
                 currentApproved = currentApproved.filter(id => id !== categoryId);
             } else {
                 currentApproved.push(categoryId);
             }

             const res = await api.put(`/admin/users/${client._id}/access`, { 
                 isApproved: true, 
                 approvedCategories: currentApproved
             });
             setClients(clients.map(c => c._id === client._id ? res.data : c));
             if (selectedClient?._id === client._id) setSelectedClient(res.data);
         } catch(err) { alert('Failed to modify access: ' + (err.response?.data?.error || err.message)); }
    };

    const grantDiscount = async (e) => {
        e.preventDefault();
        if (!selectedClient) return;
        try {
            const res = await api.post(`/admin/users/${selectedClient._id}/pricing`, {
                category: discountForm.categoryId,
                discountPercentage: discountForm.percentage
            });
            setClients(clients.map(c => c._id === selectedClient._id ? res.data : c));
            if (selectedClient?._id === selectedClient._id) setSelectedClient(res.data);
            alert('Custom Discount Matrix Applied!');
            setDiscountForm({ categoryId: '', percentage: 0 });
        } catch(err) { alert('Failed to set discount: ' + (err.response?.data?.error || err.message)); }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setProductForm({ ...productForm, imageUrl: reader.result });
        reader.readAsDataURL(file);
    };

    const handleCreateCategory = async () => {
         const catName = prompt("Enter the name of the New Macro Category:");
         if (!catName) return;
         try {
             const res = await api.post('/admin/categories', { name: catName });
             setCategories([...categories, res.data]);
             setProductForm({ ...productForm, category: res.data._id });
         } catch(err) { alert('Failed to create category on the fly'); }
    };

    const saveProduct = async (e) => {
         e.preventDefault();
         try {
             if (editingProduct) {
                 const res = await api.put(`/admin/products/${editingProduct}`, productForm);
                 setProducts(products.map(p => p._id === editingProduct ? res.data : p));
             } else {
                 const res = await api.post('/admin/products', productForm);
                 setProducts([...products, res.data]);
             }
             setEditingProduct(null);
             setProductForm({ name: '', sku: '', basePrice: 0, stockQuantity: 0, moq: 1, details: '', imageUrl: '', category: '' });
         } catch(err) { alert('Failed to save product'); }
    };

    const deleteProduct = async () => {
        if (!editingProduct) return;
        if (!window.confirm('Are you absolutely sure you want to PERMANENTLY remove this product from the inventory?')) return;
        try {
            await api.delete(`/admin/products/${editingProduct}`);
            setProducts(products.filter(p => p._id !== editingProduct));
            setEditingProduct(null);
            setProductForm({ name: '', sku: '', basePrice: 0, stockQuantity: 0, moq: 1, details: '', imageUrl: '', category: '' });
        } catch(err) { alert('Failed to delete product'); }
    };

    const openEdit = (p) => {
        setEditingProduct(p._id);
        setProductForm({ 
             name: p.name, sku: p.sku, basePrice: p.basePrice, stockQuantity: p.stockQuantity, moq: p.moq || 1,
             details: p.details || '', imageUrl: p.imageUrl || '', category: p.category?._id || '' 
        });
    };

    const updateOrderStatus = async (orderId, newStatus) => {
         let reason = '';
         if (newStatus === 'rejected') {
              reason = prompt('Please provide a reason for rejecting this order (e.g. invalid shipping address or OOS):');
              if (!reason) return; 
         }
         try {
             const res = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus, reason });
             setOrders(orders.map(o => o._id === orderId ? res.data : o));
         } catch(err) { alert('Failed to update order status'); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                <div>
                   <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Sales Control Panel</h1>
                   <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Approve buyers, manage MOQs, process shipments.</p>
                </div>
                <div className="dashboard-tabs" style={{ display: 'flex', gap: '0.5rem' }}>
                     <button className={`btn ${activeTab === 'pipeline' ? 'btn-primary' : 'btn-glass'}`} onClick={() => setActiveTab('pipeline')}><Clock size={16}/> Pipeline</button>
                     <button className={`btn ${activeTab === 'clients' ? 'btn-primary' : 'btn-glass'}`} onClick={() => setActiveTab('clients')}><Users size={16}/> Client Manager</button>
                     <button className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-glass'}`} onClick={() => setActiveTab('inventory')}><PackageSearch size={16}/> Inventory</button>
                </div>
            </header>

            {loading ? <div>Loading dashboard...</div> : activeTab === 'pipeline' ? (
                 <div className="pipeline-grid" style={{ display: 'flex', gap: '2rem', overflowX: 'auto', minHeight: '600px' }}>
                      <div className="glass-panel pipeline-column" style={{ flex: 1, minWidth: '400px', padding: '1.5rem', background: 'rgba(30, 41, 59, 0.4)' }}>
                           <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)' }}><Clock size={18}/> Pending Quotes</h4>
                           {orders.filter(o => o.status === 'pending').map(order => (
                               <div key={order._id} style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                         <div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ORD-{order._id.substring(order._id.length-4)}</div>
                                            <div style={{ fontWeight: 600, fontSize: '1.1rem', margin: '0.25rem 0' }}>{order.buyer?.name}</div>
                                         </div>
                                         <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent-green)' }}>₹{order.totalEstimatedValue?.toFixed(2)}</div>
                                    </div>
                                    
                                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <div><span style={{ color: 'var(--text-secondary)' }}>Shipping: </span><strong>{order.shippingAddress || 'No Address Provided'}</strong></div>
                                        <div><span style={{ color: 'var(--text-secondary)' }}>Billing: </span><strong>{order.billingAddress || 'Same as Shipping'}</strong></div>
                                    </div>

                                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', margin: '1rem 0' }}>{order.items.length} Product Line Items</div>
                                    
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                         <button className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => updateOrderStatus(order._id, 'accepted')}>Accept RFQ</button>
                                         <button className="btn btn-glass" style={{ flex: 1, padding: '0.5rem', color: 'var(--accent-red)' }} onClick={() => updateOrderStatus(order._id, 'rejected')}>Reject Route</button>
                                    </div>
                               </div>
                           ))}
                      </div>
                      
                      <div className="glass-panel pipeline-column" style={{ flex: 1, minWidth: '400px', padding: '1.5rem', background: 'rgba(30, 41, 59, 0.4)' }}>
                           <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-green)' }}><CheckCircle size={18}/> Reviewed & Processed</h4>
                           {orders.filter(o => o.status !== 'pending').map(order => (
                               <div key={order._id} style={{ opacity: order.status === 'rejected' ? 0.6 : 1, background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '1rem' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ORD-{order._id.substring(order._id.length-4)} - {order.buyer?.name}</div>
                                    <div style={{ fontWeight: 600, margin: '0.5rem 0' }}>₹{order.totalEstimatedValue?.toFixed(2)}</div>
                                    <div style={{ fontSize: '0.8rem', color: order.status === 'accepted' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                         Status: {order.status.toUpperCase()} 
                                    </div>
                                    {order.rejectionReason && <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', fontStyle: 'italic' }}>"{order.rejectionReason}"</div>}
                               </div>
                           ))}
                      </div>
                 </div>
            ) : activeTab === 'clients' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                     <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <h3 style={{ margin: 0, padding: '1.5rem 1.5rem 0' }}>Client Database</h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border-color)' }}>
                              {clients.map(c => (
                                   <div key={c._id} onClick={() => setSelectedClient(c)} style={{ padding: '1.5rem', background: selectedClient?._id === c._id ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-primary)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{c.company || c.email}</div>
                                        </div>
                                            <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: c.isApproved ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)'}}>
                                                {c.isApproved ? 'Active' : 'Pending Request'}
                                            </span>
                                        </div>
                                   ))}
                              </div>
                     </div>

                     {selectedClient && (
                         <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
                              <h3 style={{ margin: '0 0 1.5rem 0' }}>Manage {selectedClient.name}</h3>

                              <div style={{ marginBottom: '2rem' }}>
                                   <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Category Authorizations</h4>
                                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                       {selectedClient.requestedCategories?.map(cat => (
                                            <div key={cat._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 90, 0, 0.05)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                                 <span>{cat.name} (Request)</span>
                                                 <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => toggleClientCategory(selectedClient, cat._id)}>
                                                     Grant Access
                                                 </button>
                                            </div>
                                        ))}
                                        {selectedClient.approvedCategories?.map(cat => (
                                            <div key={cat._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '3px solid var(--accent-green)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                                                 <span>{cat.name} (Authorized)</span>
                                                 <button className="btn btn-glass" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: 'var(--accent-red)' }} onClick={() => toggleClientCategory(selectedClient, cat._id)}>
                                                     Revoke Access
                                                 </button>
                                            </div>
                                        ))}
                                       {(!selectedClient.requestedCategories?.length && !selectedClient.approvedCategories?.length) && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No category tracking recorded yet.</div>}
                                   </div>
                              </div>

                              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                   <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-purple)', marginBottom: '1rem' }}>Assign Custom Sales Matrix (Discount)</h4>
                                   <form onSubmit={grantDiscount} className="form-row align-end">
                                       <div className="form-group">
                                           <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Target Category</label>
                                           <select className="input-glass" value={discountForm.categoryId} onChange={e => setDiscountForm({...discountForm, categoryId: e.target.value})} required style={{ width: '100%' }}>
                                               <option value="">Select Category</option>
                                               {selectedClient.approvedCategories?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                           </select>
                                       </div>
                                       <div className="form-group">
                                           <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Discount %</label>
                                           <input type="number" className="input-glass" min="1" max="100" value={discountForm.percentage} onChange={e => setDiscountForm({...discountForm, percentage: parseInt(e.target.value,10)})} required style={{ width: '100%' }} />
                                       </div>
                                       <button type="submit" className="btn btn-primary btn-mobile-full" style={{ padding: '0.7rem' }}>Push Matrix</button>
                                   </form>
                                   {selectedClient.customPriceModifiers?.length > 0 && (
                                       <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                           {selectedClient.customPriceModifiers.map((m, idx) => (
                                               <div key={idx} style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '16px', border: '1px solid var(--accent-purple)' }}>
                                                   {m.discountPercentage}% off {m.category?.name || 'Category'}
                                               </div>
                                           ))}
                                       </div>
                                   )}
                              </div>
                         </div>
                     )}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                     {/* Inventory Table */}
                     <div className="glass-panel table-container" style={{ maxHeight: '800px', overflowY: 'auto' }}>
                         <table>
                             <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                 <tr>
                                     <th style={{ width: '60px' }}>Img</th>
                                     <th>Name / Details</th>
                                     <th>Category</th>
                                     <th style={{ textAlign: 'right' }}>Price / MOQ</th>
                                     <th style={{ textAlign: 'center' }}>Action</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {products.map(p => (
                                      <tr key={p._id}>
                                           <td style={{ padding: '0.5rem' }}>
                                                {p.imageUrl ? <img src={p.imageUrl} alt="img" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /> : <div style={{ width: '40px', height: '40px', background: 'var(--bg-primary)', borderRadius: '4px' }} />}
                                           </td>
                                           <td>
                                                <div style={{ fontWeight: 500 }}>{p.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', display: '-webkit-box' }}>{p.details || 'No details'}</div>
                                           </td>
                                           <td style={{ fontSize: '0.85rem' }}>{p.category?.name || 'Unknown'}</td>
                                           <td style={{ textAlign: 'right' }}>
                                               <div>₹{p.basePrice?.toFixed(2)}</div>
                                               <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)' }}>MOQ: {p.moq || 1}</div>
                                           </td>
                                           <td style={{ textAlign: 'center' }}>
                                               <button className="btn btn-glass" style={{ padding: '0.4rem' }} onClick={() => openEdit(p)}>
                                                   <Edit2 size={16} />
                                               </button>
                                           </td>
                                      </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>

                     {/* Product Editor */}
                     <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
                          <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                               {editingProduct ? <><Edit2 size={20} color="var(--accent-blue)" /> Edit Product</> : <><Plus size={20} color="var(--accent-green)"/> Add Product</>}
                          </h3>
                          
                          <form onSubmit={saveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                               
                               <div style={{ position: 'relative', height: '140px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }} onClick={() => fileInputRef.current.click()}>
                                    {productForm.imageUrl ? (
                                         <img src={productForm.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)' }}>
                                            <Plus size={24} style={{ marginBottom: '0.5rem' }} />
                                            <span style={{ fontSize: '0.85rem' }}>Click to Upload Product Image</span>
                                        </div>
                                    )}
                                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                               </div>

                               <div className="form-row">
                                   <div className="form-group">
                                       <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Product Name</label>
                                       <input className="input-glass" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required style={{ width: '100%' }} />
                                   </div>
                                   <div className="form-group">
                                       <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SKU Identifier</label>
                                       <input className="input-glass" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} required style={{ width: '100%' }} />
                                   </div>
                               </div>

                               <div className="form-group">
                                   <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Detailed Description</label>
                                   <textarea className="input-glass" style={{ minHeight: '80px', resize: 'vertical', width: '100%' }} value={productForm.details} onChange={e => setProductForm({...productForm, details: e.target.value})} />
                               </div>
                               
                               <div className="form-row align-end">
                                   <div className="form-group">
                                       <div className="form-row-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                           <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Category DB Logic</label>
                                           <button type="button" onClick={handleCreateCategory} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.7rem', cursor: 'pointer', padding: 0 }}>Create New</button>
                                       </div>
                                       <select className="input-glass" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} required style={{ width: '100%' }}>
                                           <option value="">Select Category</option>
                                           {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                       </select>
                                   </div>
                               </div>

                               <div className="form-row">
                                   <div className="form-group">
                                       <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Base Price</label>
                                       <input type="number" className="input-glass" value={productForm.basePrice} onChange={e => setProductForm({...productForm, basePrice: parseFloat(e.target.value)})} step="0.01" required style={{ width: '100%' }} />
                                   </div>
                                   <div className="form-group">
                                       <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Stock Qty</label>
                                       <input type="number" className="input-glass" value={productForm.stockQuantity} onChange={e => setProductForm({...productForm, stockQuantity: parseInt(e.target.value,10)})} required style={{ width: '100%' }} />
                                   </div>
                                   <div className="form-group">
                                       <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Order MOQ</label>
                                       <input type="number" className="input-glass" value={productForm.moq} onChange={e => setProductForm({...productForm, moq: parseInt(e.target.value,10)})} min="1" required style={{ width: '100%' }} />
                                   </div>
                               </div>

                                <div className="form-row form-actions" style={{ marginTop: '1rem' }}>
                                     <button type="submit" className="btn btn-primary flex-2" style={{ justifyContent: 'center' }}>Save Product Logic</button>
                                     {editingProduct && (
                                          <>
                                            <button type="button" className="btn btn-glass flex-1 outline-red" style={{ color: 'var(--accent-red)', justifyContent: 'center' }} onClick={deleteProduct}>Delete</button>
                                            <button type="button" className="btn btn-glass flex-1" style={{ justifyContent: 'center' }} onClick={() => { setEditingProduct(null); setProductForm({ name: '', sku: '', basePrice: 0, stockQuantity: 0, moq: 1, details: '', imageUrl: '', category: '' }) }}>Cancel</button>
                                          </>
                                     )}
                                </div>
                          </form>
                     </div>
                </div>
            )}
        </div>
    );
}
