interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  category: string;
}

const modules: Module[] = [
  {
    id: 'keyword-generator',
    title: 'Anahtar Kelime Üretici',
    description: 'İşiniz için anahtar kelimeler üretin',
    icon: <Search className="h-12 w-12" />,
    route: 'keyword-generator',
    category: 'SEO'
  },
  {
    id: 'wp-comment-generator',
    title: 'Wordpress Yorum Üretici',
    description: 'Web siteniz veya içeriğiniz için gerçek yorumlar üretin',
    icon: (
      <svg className="h-12 w-12" viewBox="0 0 512 512" fill="currentColor">
        <path d="M61.7 169.4l101.5 278C92.2 413 43.3 340.2 43.3 256c0-30.9 6.6-60.1 18.4-86.6zm337.9 75.9c0-26.3-9.4-44.5-17.5-58.7-10.8-17.5-20.9-32.4-20.9-49.9 0-19.6 14.8-37.8 35.7-37.8.9 0 1.8.1 2.8.2-37.9-34.7-88.3-55.9-143.7-55.9-74.3 0-139.7 38.1-177.8 95.9 5 .2 9.7.3 13.7.3 22.2 0 56.7-2.7 56.7-2.7 11.5-.7 12.8 16.2 1.4 17.5 0 0-11.5 1.3-24.3 2l77.5 230.4L249.8 247l-33.1-90.8c-11.5-.7-22.3-2-22.3-2-11.5-.7-10.1-18.2 1.3-17.5 0 0 35.1 2.7 56 2.7 22.2 0 56.7-2.7 56.7-2.7 11.5-.7 12.8 16.2 1.4 17.5 0 0-11.5 1.3-24.3 2l76.9 228.7 21.2-70.9c9-29.4 16-50.5 16-68.7zm-139.9 29.3l-63.8 185.5c19.1 5.6 39.2 8.7 60.1 8.7 24.8 0 48.5-4.3 70.6-12.1-.6-.9-1.1-1.9-1.5-2.9l-65.4-179.2zm183-120.7c.9 6.8 1.4 14 1.4 21.9 0 21.6-4 45.8-16.2 76.2l-65 187.9C426.2 403 468.7 334.5 468.7 256c0-37-9.4-71.8-26-102.1z"/>
      </svg>
    ),
    route: 'wp-comment-generator',
    category: 'WordPress'
  },
  {
    id: 'title-generator',
    title: 'Makale Başlığı Üretici',
    description: 'Özgün makale başlıkları üretin',
    icon: <FileText className="h-12 w-12" />,
    route: 'title-generator',
    category: 'SEO'
  },
  {
    id: 'about-generator',
    title: 'Hakkımda Yazısı Üretici',
    description: 'Dilediğiniz dilde hakkımda yazısı üretin',
    icon: <User className="h-12 w-12" />,
    route: 'about-generator',
    category: 'Genel'
  },
  {
    id: 'cv-writer',
    title: 'CV Yazarı',
    description: 'Kişisel bilgilerinizle istediğiniz dilde cv metni üretin',
    icon: <IdCard className="h-12 w-12" />,
    route: 'cv-writer',
    category: 'Genel'
  },
  {
    id: 'service-description',
    title: 'Hizmet Açıklaması Yazarı',
    description: 'Verdiğiniz Hizmetler için açıklamalar üretin',
    icon: <Wrench className="h-12 w-12" />,
    route: 'service-description',
    category: 'Genel'
  },
  {
    id: 'product-description',
    title: 'Ürün Açıklaması Üretici',
    description: 'E-ticaret için SEO uyumlu ürün açıklamaları',
    icon: <Tag className="h-12 w-12" />,
    route: 'product-description',
    category: 'SEO'
  },
  {
    id: 'faq-generator',
    title: 'Sıkça Sorulan Sorular',
    description: 'İstediğin konuda SSS ve cevapları üret',
    icon: <HelpCircle className="h-12 w-12" />,
    route: 'faq-generator',
    category: 'Genel'
  },
  {
    id: 'rewrite-tool',
    title: 'Yeniden Yazdır',
    description: 'İstediğin metni özgünce yeniden yazdır',
    icon: <RefreshCw className="h-12 w-12" />,
    route: 'url-rewrite',
    category: 'Genel'
  },
  {
    id: 'google-review',
    title: 'Google Yorum Üretici',
    description: 'Google maps için gerçek yorumlar üretin',
    icon: <MapPin className="h-12 w-12" />,
    route: 'google-review',
    category: 'Google'
  }
];

interface TemplateHubProps {
  setLoading: (loading: boolean) => void;
}

export default function TemplateHub({ setLoading }: TemplateHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  const categories = ['Tümü', 'SEO', 'Google', 'Instagram', 'Facebook', 'Youtube', 'Genel', 'Coder', 'Twitter', 'Resim'];

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleModuleClick = (module: Module) => {
    setLoading(true);
    window.location.href = `?page=${module.route}`;
  };

  return (
    <div className="pb-20">
      <div style={{ display: 'flex' }}>
        <div className="p-2 md:p-8">
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '24px' }}>
            Tüm Modüller
          </h1>
          
          {/* Search Bar */}
          <div className="ml-2 mt-8 md:mt-4">
            <input
              className="shadow-md w-[78%] md:w-[320px] h-[45px] p-2 pl-5"
              placeholder="Modül Ara"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                borderRadius: '4px',
                borderColor: 'rgb(112, 112, 112)',
                outline: 'none'
              }}
            />
            <button
              className="w-[20%] md:w-[80px] h-[45px] bg-white shadow-md hover:shadow-xl"
              style={{
                borderLeftWidth: '1px',
                borderColor: 'rgb(112, 112, 112)',
                borderTopRightRadius: '4px',
                borderBottomRightRadius: '4px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '20px',
                color: 'rgb(51, 51, 51)'
              }}
            >
              Ara
            </button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`mt-4 ml-2 px-2 py-1 bg-white shadow-md hover:shadow-xl rounded-md ${
                  selectedCategory === category 
                    ? 'outline outline-2 outline-[#5356FF]' 
                    : 'outline outline-0 hover:outline-1 outline-[#5356FF]'
                }`}
              >
                <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: '500' }}>
                  #{category}
                </p>
              </button>
            ))}
          </div>

          {/* Modules Grid */}
          <div className="flex flex-wrap">
            {filteredModules.map((module) => (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module)}
                className="bg-white w-[48%] md:w-[280px] h-[180px] md:h-[240px] rounded-md shadow-lg hover:shadow-xl p-4 relative outline outline-0 hover:outline-1 md:ml-4 text-center flex flex-col items-center mt-8 md:mt-6"
              >
                <div className="mt-2">
                  {module.icon}
                </div>
                <h2 style={{ 
                  fontFamily: 'Poppins, sans-serif', 
                  fontSize: '20px', 
                  marginTop: '20px' 
                }}>
                  {module.title}
                </h2>
                <p style={{ 
                  fontFamily: 'Poppins, sans-serif', 
                  fontWeight: '300', 
                  marginTop: '10px' 
                }}>
                  {module.description}
                </p>
                <div className="bg-[#5356FF] w-[80px] h-[40px] flex items-center justify-center rounded-md absolute bottom-2">
                  <p style={{ 
                    fontFamily: 'Poppins, sans-serif', 
                    fontWeight: '500', 
                    color: 'white' 
                  }}>
                    Yazdır
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}