import React, { useState, useEffect } from 'react';
import useAuthStore, { api } from '../store/authStore';
import { ShoppingCart, Send, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Catalog() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState({});
    const [localQty, setLocalQty] = useState({});
    const [loading, setLoading] = useState(true);

    const [shippingAddress, setShippingAddress] = useState('');
    const [billingAddress, setBillingAddress] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // If categoryId is present, we could append it to a query or just filter on client side.
                // Since our backend /api/products relies on what the user is approved for, it returns everything.
                // We'll filter on client for simplicity, or we could pass ?category=id
                const res = await api.get('/products');
                let fetchedProducts = res.data;
                if (categoryId) {
                     fetchedProducts = fetchedProducts.filter(p => p.category?._id === categoryId);
                }
                setProducts(fetchedProducts);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [categoryId]);

    const handleQuantityChange = (product, qty) => {
        let value = parseInt(qty, 10);
        if (isNaN(value)) value = 0;
        
        // Ensure the value adheres to the Minimum Order Quantity multiplier (MOQ).
        // For instance, if MOQ is 100, valid values are 0, 100, 200...
        const moq = product.moq || 1;
        if (value > 0) {
            value = Math.ceil(value / moq) * moq;
        }

        if (value > product.stockQuantity) {
            value = Math.floor(product.stockQuantity / moq) * moq;
        }

        setCart(prev => {
            const newCart = { ...prev };
            if (value <= 0) {
                delete newCart[product._id];
            } else {
                newCart[product._id] = value;
            }
            return newCart;
        });
    };

    const submitRFQ = async () => {
         if (!shippingAddress.trim() || !billingAddress.trim()) {
             alert('Please enter both your Billing and Shipping Addresses for this RFQ prior to submission!');
             return;
         }

         const items = Object.entries(cart).map(([productId, quantity]) => {
              const product = products.find(p => p._id === productId);
              return { product: productId, quantity, requestedPrice: product.basePrice };
         });
         
         try {
             await api.post('/orders/request', { items, shippingAddress, billingAddress });
             alert('Order Request (RFQ) Submitted to Sales Rep!');
             setCart({});
             setLocalQty({});
             setShippingAddress('');
             setBillingAddress('');
         } catch (err) {
             alert('Failed to submit RFQ. Please try again.');
         }
    };

    const cartCount = Object.keys(cart).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem' }}>
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', gap: '1rem' }}>
                <div style={{ flex: 1, textAlign: 'left', width: '100%' }}>
                   <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0, marginBottom: '0.75rem', fontSize: '0.9rem', justifyContent: 'flex-start' }}>
                       <ArrowLeft size={16} /> <span className="desktop-only">Go Back</span>
                   </button>
                   <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', marginBottom: '0.5rem', lineHeight: '1.2' }}>Wholesale Catalog</h1>
                   <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.85rem' }}>Discover premium items mapped directly to your profile.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '350px' }}>
                     {cartCount > 0 && (
                          <>
                              <input type="text" className="input-glass" placeholder="Billing Address Required" value={billingAddress} onChange={e => setBillingAddress(e.target.value)} style={{ padding: '0.65rem', fontSize: '0.8rem' }} />
                              <input type="text" className="input-glass" placeholder="Shipping Address Required" value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} style={{ padding: '0.65rem', fontSize: '0.8rem' }} />
                          </>
                     )}
                     <button className={`btn btn-${cartCount > 0 ? 'primary' : 'glass'}`} disabled={cartCount === 0} onClick={submitRFQ} style={{ justifyContent: 'center', padding: '0.75rem' }}>
                         {cartCount > 0 ? <Send size={18} /> : <ShoppingCart size={18} />}
                         Submit RFQ ({cartCount})
                     </button>
                </div>
            </header>

            {loading ? (
                <div style={{ color: 'var(--text-secondary)' }}>Loading catalog data...</div>
            ) : products.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No products available for this category.</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                     {products.map(p => (
                          <div key={p._id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                               <div style={{ height: '200px', background: 'var(--bg-secondary)', position: 'relative' }}>
                                    {p.imageUrl ? (
                                         <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                         <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No Image Available</div>
                                    )}
                                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                         {p.sku}
                                    </div>
                               </div>
                               
                               <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
                                   <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 600 }}>{p.category?.name}</div>
                                   <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{p.name}</div>
                                   {p.details && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, flex: 1 }}>{p.details}</p>}
                                   
                                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                        <div style={{ flex: 1 }}>
                                             <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{p.basePrice.toFixed(2)}</div>
                                             <div style={{ fontSize: '0.75rem', color: p.stockQuantity > 10 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{p.stockQuantity} in stock</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                            <input 
                                                type="number" 
                                                className="input-glass" 
                                                style={{ width: '60px', padding: '0.5rem', textAlign: 'center', fontSize: '0.85rem' }}
                                                min="0"
                                                max={p.stockQuantity}
                                                step={p.moq || 1}
                                                value={localQty[p._id] !== undefined ? localQty[p._id] : (cart[p._id] || '')}
                                                onChange={(e) => setLocalQty({...localQty, [p._id]: e.target.value})}
                                                placeholder={`x${p.moq || 1}`}
                                            />
                                            <button 
                                                className="btn btn-primary" 
                                                style={{ padding: '0.5rem 0.6rem', fontSize: '0.8rem', gap: 0 }}
                                                onClick={(e) => {
                                                    const val = localQty[p._id] !== undefined ? localQty[p._id] : cart[p._id];
                                                    handleQuantityChange(p, val || 0);
                                                    const btn = e.currentTarget;
                                                    btn.innerHTML = '✓';
                                                    btn.style.background = 'var(--accent-green)';
                                                    setTimeout(() => {
                                                        btn.innerHTML = 'Add';
                                                        btn.style.background = '';
                                                    }, 1000);
                                                }}
                                            >
                                               Add
                                            </button>
                                        </div>
                                   </div>
                               </div>
                          </div>
                     ))}
                </div>
            )}
        </div>
    );
}
