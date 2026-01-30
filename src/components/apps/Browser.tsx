import { useEffect } from "react";
import { Search } from "lucide-react";

export const Browser = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cse.google.com/cse.js?cx=86586834f7acf4b01";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(145deg, #1e1e1e, #252525)',
      border: '2px solid #3cff00',
      borderRadius: '14px',
      padding: '1rem',
      maxWidth: '600px',
      margin: 'auto',
      boxShadow: '0 0 15px rgba(60, 255, 0, 0.4)',
      fontFamily: '"Segoe UI", Arial, sans-serif'
    }}>
      <div style={{
        fontSize: '1.2rem',
        color: '#3cff00',
        fontWeight: 'bold',
        textAlign: 'center',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid rgba(60, 255, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <Search size={20} />
        Web Search
      </div>
      <div style={{ marginTop: '1rem' }}>
        <div className="gcse-search"></div>
      </div>
      <style jsx>{`
        .gsc-control-cse {
          background-color: transparent !important;
          border: none !important;
        }
        .gsc-search-box {
          background: rgba(0, 0, 0, 0.5) !important;
          border-radius: 8px !important;
          padding: 0.3rem !important;
        }
        .gsc-input-box {
          border: 2px solid #3cff00 !important;
          border-radius: 8px !important;
          background-color: #101010 !important;
        }
        input.gsc-input {
          background-color: #101010 !important;
          color: #fff !important;
          font-size: 1rem !important;
          padding: 0.4rem !important;
        }
        input.gsc-search-button {
          background: #3cff00 !important;
          color: #000 !important;
          border-radius: 8px !important;
          font-weight: bold;
          transition: background 0.2s ease;
        }
        input.gsc-search-button:hover {
          background: #2eb800 !important;
        }
      `}</style>
    </div>
  );
};