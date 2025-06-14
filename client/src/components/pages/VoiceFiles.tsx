export default function VoiceFiles() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Ses Dosyalarım</h1>
        <p className="text-slate-600 mt-2">Oluşturduğunuz ses dosyalarını görüntüleyin ve yönetin</p>
      </div>
      
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-volume-up text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Henüz Ses Dosyası Bulunmuyor</h3>
          <p className="text-slate-600">
            Metin seslendirme özelliğini kullanarak ses dosyaları oluşturabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}