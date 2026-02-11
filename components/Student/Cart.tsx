import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Trash2, QrCode, ArrowRight, Loader2, Smartphone } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, placeOrder, clearCart, restaurants } = useStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'review' | 'payment'>('review');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | null>(null);
  const [upiRef, setUpiRef] = useState('');
  const [isDeepLinkOpened, setIsDeepLinkOpened] = useState(false);

  const restaurant = cart.length > 0 ? restaurants.find(r => r.id === cart[0].restaurantId) : null;
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'upi' && !upiRef) {
      alert("Please enter your UPI ID");
      return;
    }
    setLoading(true);
    try {
      await placeOrder(upiRef);
      navigate('/student/orders');
    } catch (e) {
      alert("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  // Generate UPI Deep Link
  const getDeepLink = () => {
      if (!restaurant?.upiId) return '';
      const pa = restaurant.upiId;
      const pn = encodeURIComponent(restaurant.name);
      const am = total.toFixed(2);
      const cu = 'INR';
      // Format: upi://pay?pa=...&pn=...&am=...&cu=INR
      return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=${cu}`;
  };
  
  const handleDeepLinkClick = () => {
      setIsDeepLinkOpened(true);
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 dark:text-slate-500">
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
          <Trash2 size={40} />
        </div>
        <p className="text-lg font-medium">Your cart is empty</p>
        <button onClick={() => navigate('/student/restaurants')} className="mt-4 text-indigo-600 dark:text-indigo-400 font-medium">Browse Restaurants</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Checkout</h1>
      
      {step === 'review' ? (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden mb-6 border border-slate-200 dark:border-slate-800">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/30 flex justify-between items-center">
              <span className="font-medium text-indigo-900 dark:text-indigo-300">{restaurant?.name}</span>
              <button onClick={clearCart} className="text-xs text-red-500 dark:text-red-400 font-medium hover:underline">Clear All</button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {cart.map(item => (
                <div key={item.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-1.5 rounded">{item.quantity}x</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-slate-900 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="font-medium text-slate-600 dark:text-slate-400">Total</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">₹{total.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={() => setStep('payment')} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition flex items-center justify-center gap-2">
            Proceed to Payment <ArrowRight size={20} />
          </button>
        </>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Select Payment Method</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setPaymentMethod('upi')}
                className={`flex items-center gap-4 p-4 rounded-lg border transition ${paymentMethod === 'upi' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600 dark:border-indigo-500 dark:ring-indigo-500' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
              >
                <div className="bg-white dark:bg-slate-800 p-2 rounded shadow-sm"><QrCode size={24} className="text-slate-700 dark:text-slate-200" /></div>
                <div className="text-left">
                  <p className="font-medium text-slate-900 dark:text-white">UPI / QR</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Scan or Pay via App</p>
                </div>
              </button>
            </div>
          </div>

          {paymentMethod === 'upi' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
              <div className="bg-white p-4 mx-auto rounded-xl flex items-center justify-center mb-4 w-fit shadow-sm border border-slate-100">
                {getDeepLink() ? (
                    <QRCode 
                        value={getDeepLink()} 
                        size={180}
                        viewBox={`0 0 256 256`}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    />
                ) : (
                    <div className="w-40 h-40 bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                        Invalid UPI Config
                    </div>
                )}
              </div>
              <p className="font-mono text-xs text-slate-500 mb-4">{restaurant?.upiId || 'No UPI ID'}</p>
              
              <div className="mb-6">
                   <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">On Mobile?</p>
                   <a 
                     href={getDeepLink()}
                     onClick={handleDeepLinkClick}
                     className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-4 py-2 rounded-full font-medium hover:bg-indigo-200 transition"
                   >
                     <Smartphone size={16} /> Pay via UPI App
                   </a>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Total Amount: <span className="font-bold text-slate-900 dark:text-white">₹{total.toFixed(2)}</span></p>
              
              {isDeepLinkOpened ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2">
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                         Payment Verification
                     </label>
                     <input 
                        type="text" 
                        placeholder="Enter your UPI ID (e.g. name@bank)" 
                        className="w-full max-w-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none mx-auto block"
                        value={upiRef}
                        onChange={e => setUpiRef(e.target.value)}
                    />
                     <p className="text-xs text-slate-400 mt-2">Enter the UPI ID you used to make the payment.</p>
                  </div>
              ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                      Please scan or click "Pay via UPI App" first to proceed.
                  </p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep('review')} className="flex-1 py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">Back</button>
            <button 
              onClick={handlePlaceOrder}
              disabled={!paymentMethod || loading || (paymentMethod === 'upi' && !upiRef)}
              className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Confirm Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}