import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import FadeIn from '../components/FadeIn';

const Checkout = () => {
  const { cartItems, cartTotal } = useCart();
  const shipping = cartTotal > 0 ? 15 : 0;
  const total = cartTotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-bold uppercase mb-4">Your cart is empty</h1>
        <p className="text-gray-500 font-mono mb-8">You need items in your cart to checkout.</p>
        <Link 
          to="/" 
          className="bg-black text-white px-8 py-3 rounded-full font-medium uppercase tracking-wide hover:bg-gray-800 transition-colors"
        >
          Go Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide hover:text-gray-600 transition-colors mb-8">
        <ArrowLeft size={16} /> Back to Shop
      </Link>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left Column - Form */}
        <div className="w-full lg:w-2/3">
          <FadeIn direction="up">
            <h1 className="text-3xl font-bold uppercase tracking-tight mb-8">Checkout</h1>
            
            <form className="space-y-8">
              {/* Contact Info */}
              <section>
                <h2 className="text-xl font-bold uppercase mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <input 
                    type="email" 
                    placeholder="Email address" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="newsletter" className="rounded text-black focus:ring-black accent-black" />
                    <label htmlFor="newsletter" className="text-sm text-gray-600">Email me with news and offers</label>
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section>
                <h2 className="text-xl font-bold uppercase mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="First name" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                  <input 
                    type="text" 
                    placeholder="Last name" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                  <input 
                    type="text" 
                    placeholder="Address" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all md:col-span-2"
                  />
                  <input 
                    type="text" 
                    placeholder="City" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                  <input 
                    type="text" 
                    placeholder="Postal code" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                </div>
              </section>

              {/* Payment */}
              <section>
                <h2 className="text-xl font-bold uppercase mb-4">Payment</h2>
                <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                  <ShieldCheck size={16} /> All transactions are secure and encrypted.
                </p>
                <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <input 
                    type="text" 
                    placeholder="Card number" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Expiration date (MM/YY)" 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                    <input 
                      type="text" 
                      placeholder="Security code" 
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Name on card" 
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  />
                </div>
              </section>

              <button 
                type="button"
                className="w-full bg-black text-white py-4 rounded-full font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors text-lg mt-4"
              >
                Pay ${total.toFixed(2)}
              </button>
            </form>
          </FadeIn>
        </div>

        {/* Right Column - Order Summary */}
        <div className="w-full lg:w-1/3">
          <FadeIn direction="up" delay={0.2}>
            <div className="bg-gray-50 rounded-3xl p-6 lg:p-8 sticky top-32">
              <h2 className="text-xl font-bold uppercase mb-6">Order Summary</h2>
              
              <div className="flex flex-col gap-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full z-10">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold uppercase text-sm">{item.name}</h3>
                      <p className="font-mono text-gray-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-200 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold text-black">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-bold text-black">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200 text-lg">
                  <span className="font-sans font-bold uppercase">Total</span>
                  <span className="font-sans font-bold">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
