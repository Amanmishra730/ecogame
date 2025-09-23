import React from 'react';

// A clean HTML/CSS rendition of the provided blue-ribbon certificate template
// Props: studentName, course, date, leftSigner, rightSigner
// Use: <CertificateClassic studentName="Juliana Silva" course="Climate Quiz" date="2025-09-23" />

type Props = {
  studentName: string;
  course: string;
  date: string; // YYYY-MM-DD
  leftSigner?: string;
  rightSigner?: string;
};

const CertificateClassic: React.FC<Props> = ({ studentName, course, date, leftSigner = 'Rufus Stewart', rightSigner = 'Olivia Wilson' }) => {
  return (
    <div
      id="certificate-canvas"
      className="relative mx-auto bg-white text-[#1f2b3a]"
      style={{ width: 1120, height: 790, boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid #c9d3de' }}
    >
      {/* Border */}
      <div className="absolute inset-6 border" style={{ borderColor: '#c9d3de' }} />

      {/* Curved blue ribbons */}
      <svg className="absolute top-0 left-0 w-full" height="170" viewBox="0 0 1120 170" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#0b5394"/>
            <stop offset="100%" stopColor="#043d75"/>
          </linearGradient>
        </defs>
        <path d="M0,0 C220,140 500,60 700,110 C880,150 1000,120 1120,60 L1120,0 L0,0 Z" fill="url(#g1)" opacity="0.9"/>
        <path d="M0,0 C240,120 540,80 760,120 C940,150 1040,140 1120,100 L1120,0 L0,0 Z" fill="#114c8a" opacity="0.5"/>
      </svg>
      <svg className="absolute bottom-0 right-0 w-full" height="170" viewBox="0 0 1120 170" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,170 C220,30 520,110 740,60 C940,15 1050,40 1120,80 L1120,170 L0,170 Z" fill="#114c8a" opacity="0.75"/>
        <path d="M0,170 C260,60 520,130 760,90 C960,55 1060,80 1120,120 L1120,170 L0,170 Z" fill="#0b5394" opacity="0.5"/>
      </svg>

      {/* Heading */}
      <div className="absolute inset-x-0 top-40 text-center px-10">
        <div className="tracking-widest text-3xl font-serif" style={{ letterSpacing: '0.2em' }}>CERTIFICATE</div>
        <div className="uppercase text-lg font-semibold tracking-[0.35em] mt-1">of Achievement</div>
        <div className="mt-6 text-sm tracking-widest text-gray-600">This certificate is proudly presented to</div>
        <div className="mt-3 text-5xl font-serif italic text-[#2f3b4c]">{studentName}</div>
        <div className="mx-auto mt-3" style={{ width: 560, borderTop: '2px solid #c9d3de' }} />
        <div className="mt-4 max-w-3xl mx-auto text-gray-600 leading-relaxed">
          For outstanding performance and completion of
          <span className="font-semibold"> {course} </span>
          on <span className="font-semibold">{new Date(date).toLocaleDateString()}</span>.
        </div>
      </div>

      {/* Signatures */}
      <div className="absolute bottom-28 left-0 right-0 px-24 grid grid-cols-2 gap-8 items-end">
        <div className="text-center">
          <div className="h-10 text-gray-500 italic">Signature</div>
          <div className="mx-auto" style={{ width: 240, borderTop: '1px solid #c9d3de' }} />
          <div className="mt-2 text-sm font-semibold">{leftSigner}</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest">Representatives</div>
        </div>
        <div className="text-center">
          <div className="h-10 text-gray-500 italic">Signature</div>
          <div className="mx-auto" style={{ width: 240, borderTop: '1px solid #c9d3de' }} />
          <div className="mt-2 text-sm font-semibold">{rightSigner}</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest">Representatives</div>
        </div>
      </div>

      {/* Seal */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-40">
        <div className="w-20 h-20 rounded-full border-4 border-[#c9d3de]" />
      </div>
    </div>
  );
};

export default CertificateClassic;
