import { LucideIcon } from 'lucide-react';

interface DesktopIconProps {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
  delay?: number;
}

export const DesktopIcon = ({
  icon: Icon,
  title,
  onClick,
  delay = 0,
}: DesktopIconProps) => {
  return (
    <div
      className="flex flex-col items-center cursor-pointer group animate-fade-in hover:scale-[1.07] transition-all duration-300 font-mono relative"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="relative">
        {/* Matrix-style binary background */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-500 overflow-hidden rounded-[4px]">
          <div className="absolute inset-0 text-green-500/30 text-xs animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-matrix-mini" style={{ animationDelay: `${i * 0.1}s` }}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <span key={j} className="inline-block w-2">
                    {Math.random() > 0.5 ? '1' : '0'}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Outer neon glow with pulsing */}
        <div className="absolute -inset-2 bg-gradient-to-br from-green-400/10 via-emerald-400/5 to-green-400/10 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
        
        {/* Secondary glow layer */}
        <div className="absolute -inset-1 bg-green-400/20 rounded-md blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

        {/* Terminal-style frame with enhanced effects */}
        <div className="relative bg-black/95 backdrop-blur-sm p-4 rounded-[6px] border-2 border-green-500/60 group-hover:border-green-300 shadow-[0_0_15px_rgba(0,255,0,0.3),inset_0_0_15px_rgba(0,255,0,0.1)] group-hover:shadow-[0_0_30px_rgba(0,255,0,0.6),inset_0_0_20px_rgba(0,255,0,0.2),0_0_50px_rgba(0,255,0,0.3)] transition-all duration-300">
          {/* Corner brackets */}
          <div className="absolute top-1 left-1 w-2 h-2 border-l-2 border-t-2 border-green-400/80"></div>
          <div className="absolute top-1 right-1 w-2 h-2 border-r-2 border-t-2 border-green-400/80"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 border-l-2 border-b-2 border-green-400/80"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-green-400/80"></div>
          
          {/* Scanline effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/5 to-transparent animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Icon with enhanced glow */}
          <Icon className="h-8 w-8 text-green-400 group-hover:text-green-200 transition-all duration-300 drop-shadow-[0_0_8px_rgba(0,255,0,0.8)] group-hover:drop-shadow-[0_0_15px_rgba(0,255,0,1)] relative z-10 filter brightness-110 group-hover:brightness-125" />
          
          {/* Glitch overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-200">
            <div className="w-full h-px bg-green-300 absolute top-1/4 animate-pulse"></div>
            <div className="w-full h-px bg-green-300 absolute bottom-1/4 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        {/* Status indicator LED */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,0,0.8)] group-hover:shadow-[0_0_12px_rgba(0,255,0,1)] transition-all"></div>
      </div>

      {/* Label with enhanced styling */}
      <div className="relative mt-3">
        {/* Text glow background */}
        <div className="absolute inset-0 text-green-400 text-sm text-center tracking-[0.2em] font-bold blur-sm opacity-0 group-hover:opacity-60 transition-all duration-300">
          {title.replace(/\s+/g, '_').toUpperCase()}
        </div>
        
        {/* Main text */}
        <span className="relative text-green-400 group-hover:text-green-200 text-sm text-center tracking-[0.15em] font-semibold transition-all duration-300 drop-shadow-[0_0_8px_rgba(0,255,0,0.8)] group-hover:drop-shadow-[0_0_12px_rgba(0,255,0,1)] block">
          {title.replace(/\s+/g, '_').toUpperCase()}
        </span>
        
        {/* Typing cursor effect */}
        <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      </div>

      {/* Binary rain on hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-500 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-green-500/60 text-xs font-mono"
            style={{
              left: `${20 + i * 25}%`,
              animationName: 'binary-fall',
              animationDuration: '2s',
              animationDelay: `${i * 0.3}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
            }}
          >
            {Array.from({ length: 8 }).map((_, j) => (
              <div key={j} className="leading-none">
                {Math.random() > 0.5 ? '1' : '0'}
              </div>
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes binary-fall {
          0% {
            transform: translateY(-50px);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(120px);
            opacity: 0;
          }
        }
        
        @keyframes matrix-mini {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
        
        .animate-matrix-mini {
          animation: matrix-mini 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};