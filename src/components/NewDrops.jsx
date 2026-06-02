import React from 'react';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import ImageLoader from './ImageLoader';
import FadeIn from './FadeIn';

const products = [
  {
    id: 1,
    name: 'SHADOW DRIP',
    description: 'A sleek, minimalistic hoodie with dark tones and subtle reflective accents for an effortless street vibe.',
    price: 89,
    originalPrice: 120,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
    isNew: true,
  },
  {
    id: 2,
    name: 'URBAN PHANTOM',
    description: 'Urban Phantom - A bold, oversized hoodie with edgy graphics and a stealthy aesthetic inspired by city nights.',
    price: 89,
    originalPrice: 120,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    isNew: true,
  },
  {
    id: 3,
    name: 'NEON REBELLION',
    description: 'A statement piece with vibrant neon details and rebellious street art influences for a standout look.',
    price: 89,
    originalPrice: 120,
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=800&auto=format&fit=crop',
    isNew: true,
  },
  {
    id: 4,
    name: 'MIDNIGHT RUNNER',
    description: 'Lightweight and breathable jacket designed for late-night city runs and urban exploration.',
    price: 95,
    originalPrice: 130,
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800&auto=format&fit=crop',
    isNew: true,
  },
  {
    id: 5,
    name: 'CONCRETE JUNGLE',
    description: 'Heavyweight cotton tee featuring an abstract brutalist architectural print on the back.',
    price: 45,
    originalPrice: 65,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
    isNew: false,
  },
  {
    id: 6,
    name: 'GRAFFITI SOUL',
    description: 'Classic fit hoodie with custom hand-drawn graffiti style lettering and premium embroidery.',
    price: 110,
    originalPrice: 150,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop',
    isNew: true,
  }
];

const NewDrops = () => {
  const { addToCart } = useCart();

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <section className="px-4 md:px-12 py-16">
      <FadeIn direction="up">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold tracking-tight mb-4 uppercase">NEW DROPS</h2>
            <p className="text-gray-500 font-mono text-sm">
              Stand out with our latest collection—bold designs, premium fabrics, and street-ready fits. Once they're gone, they're gone. Don't miss out!
            </p>
          </div>
          <button className="group flex items-center gap-2 border border-gray-300 rounded-full px-6 py-2 hover:bg-black hover:text-white hover:border-black transition-all duration-300 whitespace-nowrap font-medium">
            View all drops <ArrowRight size={16} className="group-hover:rotate-45 transition-transform duration-300" />
          </button>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product, index) => (
          <FadeIn key={product.id} delay={index * 0.1} direction="up">
            <div className="group cursor-pointer">
              <div className="relative aspect-[4/5] mb-6 rounded-2xl overflow-hidden bg-gray-100">
                <ImageLoader 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                {product.isNew && (
                  <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    NEW
                  </div>
                )}
                
                {/* Add to Cart Button (Hover only) */}
                <button 
                  onClick={(e) => handleAddToCart(e, product)}
                  className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-black hover:text-white"
                >
                  <ShoppingCart size={20} />
                </button>
              </div>
              <h3 className="text-xl font-bold mb-2 uppercase">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-4 font-mono leading-relaxed line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold">${product.price}</span>
                <span className="text-gray-400 line-through text-sm">${product.originalPrice}</span>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};

export default NewDrops;
