import { useLocation } from 'wouter';

export default function VoiceFiles() {
  const [, setLocation] = useLocation();

  const handleNavigateToVoiceReader = () => {
    setLocation('/voice-reader');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200 py-3 px-6">
          <h5 className="text-lg font-medium text-slate-900 mb-0">Ses Dosyalarım</h5>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center mt-4">
            <div className="w-32 mb-3 mt-4">
              <svg 
                width="128" 
                height="128" 
                viewBox="0 0 512 512" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <g strokeWidth="0"></g>
                <g strokeLinecap="round" strokeLinejoin="round"></g>
                <path 
                  fill="#696cff" 
                  d="M468.53 236.03H486v39.94h-17.47zm-34.426 51.634h17.47v-63.328h-17.47zm-33.848 32.756h17.47V191.58h-17.47zm-32.177 25.276h17.47V167.483h-17.47v178.17zm-34.448-43.521h17.47v-92.35h-17.47zm-34.994 69.879h17.47v-236.06h-17.525v236.06zM264.2 405.9h17.47V106.1H264.2zm-33.848-46.284h17.47V152.383h-17.47v207.234zm-35.016-58.85h17.47v-87.35h-17.47zm-33.847-20.823h17.47V231.98h-17.47v48.042zm-33.848 25.66h17.47v-99.24h-17.47v99.272zm-33.302 48.04h17.47V152.678H94.34v201zm-33.847-30.702h17.47V187.333h-17.47v135.642zM26 287.664h17.47v-63.328H26z"
                />
              </svg>
            </div>
            
            <div className="text-base mb-2 text-slate-900 font-medium text-center">
              Henüz bir ses dosyanız bulunmuyor.
            </div>
            
            <div className="text-base mb-4 text-slate-900 font-medium text-center">
              Aşağıdaki butona tıklayarak ilk metninizi seslendirebilirsiniz.
            </div>
            
            <div className="text-lg mb-3 text-slate-900 text-center">
              <button 
                onClick={handleNavigateToVoiceReader}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
                title="Yeni Metin Seslendir"
              >
                <i className="fas fa-microphone mr-2"></i> 
                Yeni Metin Seslendir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}