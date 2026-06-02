import React from 'react';
import { ArrowRight } from 'lucide-react';
import ImageLoader from './ImageLoader';
import FadeIn from './FadeIn';

const Hero = () => {
  return (
    <section className="px-4 md:px-12 py-4">
      <FadeIn direction="up">
        <div className="relative w-full h-[600px] md:h-[700px] rounded-[2rem] overflow-hidden bg-zinc-900 text-white">
          {/* Background Image - Placeholder */}
          <ImageLoader 
            src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=2000&auto=format&fit=crop" 
            alt="Model wearing black hoodie" 
            className="absolute inset-0 w-full h-full opacity-60"
          />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-16">
            <div className="max-w-2xl mt-auto mb-12">
              <FadeIn delay={0.2} direction="up">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 uppercase">
                  Community-Driven<br />Culture
                </h1>
              </FadeIn>
              <FadeIn delay={0.3} direction="up">
                <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-lg font-mono">
                  More than just a brand, we're a movement-connecting creatives, skaters, and trendsetters who define the streets.
                </p>
              </FadeIn>
              <FadeIn delay={0.4} direction="up">
                <button className="group bg-white text-black px-6 py-3 rounded-full font-medium flex items-center gap-3 hover:bg-black hover:text-white transition-all duration-300">
                  Shop now
                  <div className="bg-black text-white p-1 rounded-full group-hover:bg-white group-hover:text-black transition-all duration-300">
                    <ArrowRight size={16} className="group-hover:rotate-45 transition-transform duration-300" />
                  </div>
                </button>
              </FadeIn>
            </div>

            {/* Slider Indicators */}
            <FadeIn delay={0.5} direction="up">
              <div className="w-full flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {[
                  { num: '01', title: 'Limited Drops. Maximum Impact.' },
                  { num: '02', title: 'Built for the Streets' },
                  { num: '03', title: 'Art Meets Attitude' },
                  { num: '04', title: 'Future-Ready Fashion' },
                  { num: '05', title: 'Community-Driven Culture', active: true },
                ].map((item, index) => (
                  <div key={index} className="flex-1 min-w-[150px]">
                    <div className={`h-1 w-full mb-3 rounded-full ${item.active ? 'bg-white' : 'bg-white/30'}`}></div>
                    <div className="font-mono text-xs mb-1 opacity-70">{item.num}</div>
                    <div className={`text-sm font-medium ${item.active ? 'text-white' : 'text-white/70'}`}>
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </FadeIn>
    </section>
  );
};

export default Hero;
