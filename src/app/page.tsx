'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Create confetti animation
    const createConfetti = () => {
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
      
      for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
          position: fixed;
          width: 10px;
          height: 10px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          left: ${Math.random() * 100}vw;
          animation: fall ${Math.random() * 3 + 2}s linear infinite;
          z-index: 1000;
          border-radius: 2px;
        `;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
      }
    };

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fall {
        to {
          transform: translateY(100vh) rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);
    
    createConfetti();
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            🎉 مرحباً بك في نظام إدارة المراكز التعليمية
          </h1>
          
          <div className="text-lg text-gray-700 leading-relaxed space-y-4">
            <p className="font-semibold text-blue-600">
              شكرا لاشتراكك في نظام إدارة المراكز التعليمية. نحن سعداء بانضمامك! 
              فيما يلي بعض الإرشادات لكيفية استخدام النظام والاستفادة القصوى منه:
            </p>
            
            <div className="text-right space-y-3 mt-6">
              <p>• أولاً، قم بتسجيل الدخول لبدء استخدام النظام.</p>
              <p>• يمكنك الاطلاع على الدورات والبرامج التعليمية المتاحة في القائمة.</p>
              <p>• في حال واجهت أي مشكلة، يرجى الاتصال بفريق الدعم الفني المتاح على مدار الساعة.</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          🚀 بدء النظام
        </button>
      </div>
    </div>
  );
}