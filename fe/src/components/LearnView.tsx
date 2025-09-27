import { Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import { ModelCard } from './ModelCard';
import { ModelModal } from './ModelModal';
import { signModels, modelCategories, searchModels } from '../data/models';
import type { Language } from '../types';
import type { SignModel } from '../data/models';

interface LearnViewProps {
  language: Language;
}

export function LearnView({ language }: LearnViewProps) {
  const [selectedModel, setSelectedModel] = useState<SignModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter models based on search and category
  const filteredModels = useMemo(() => {
    let models = signModels;
    
    // Apply search filter
    if (searchQuery) {
      models = searchModels(searchQuery);
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      models = models.filter(model => model.category === selectedCategory);
    }
    
    return models;
  }, [searchQuery, selectedCategory]);

  // Group models by category for display
  const modelsByCategory = useMemo(() => {
    const grouped: { [key: string]: SignModel[] } = {};
    
    filteredModels.forEach(model => {
      if (!grouped[model.category]) {
        grouped[model.category] = [];
      }
      grouped[model.category].push(model);
    });
    
    return grouped;
  }, [filteredModels]);

  const handleModelClick = (model: SignModel) => {
    setSelectedModel(model);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedModel(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6">
          <span className="text-4xl">🤟</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {language === 'en' ? 'Learn Indian Sign Language (ISL)' : 'ભારતીય સાઇન લેંગ્વેજ (ISL) શીખો'}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          {language === 'en' 
            ? 'Explore our comprehensive collection of ISL signs. Click on any card to see the 3D demonstration.'
            : 'ISL સાઇનના અમારા વ્યાપક સંગ્રહનું અન્વેષણ કરો. 3D દર્શન જોવા માટે કોઈપણ કાર્ડ પર ક્લિક કરો.'
          }
        </p>
      </div>

      {/* Filter and Search Section */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={language === 'en' ? 'Search signs...' : 'સાઇન શોધો...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="w-4 h-4 inline mr-2" />
            {language === 'en' ? 'All Categories' : 'બધી કેટેગરીઓ'}
          </button>
          
          {Object.entries(modelCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedCategory === key
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {language === 'en' ? category.name : category.gujaratiName}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {language === 'en' 
            ? `Showing ${filteredModels.length} of ${signModels.length} signs`
            : `${signModels.length} માંથી ${filteredModels.length} સાઇન દર્શાવી રહ્યા છીએ`
          }
        </p>
      </div>

      {/* Models Grid */}
      {filteredModels.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {language === 'en' ? 'No signs found' : 'કોઈ સાઇન મળ્યા નથી'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'en' 
              ? 'Try adjusting your search or filter criteria'
              : 'તમારા શોધ અથવા ફિલ્ટર માપદંડોને સમાયોજિત કરવાનો પ્રયાસ કરો'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(modelsByCategory).map(([categoryKey, models]) => (
            <div key={categoryKey}>
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${modelCategories[categoryKey]?.color || 'from-gray-400 to-gray-600'} rounded-xl flex items-center justify-center text-white text-xl`}>
                    {modelCategories[categoryKey]?.icon || '📝'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {language === 'en' 
                        ? modelCategories[categoryKey]?.name || categoryKey
                        : modelCategories[categoryKey]?.gujaratiName || categoryKey
                      }
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {models.length} {language === 'en' ? 'signs' : 'સાઇન'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Models Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {models.map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    language={language}
                    onClick={() => handleModelClick(model)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Progress Section */}
      <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {language === 'en' ? 'Your Learning Journey' : 'તમારી શીખવાની યાત્રા'}
          </h2>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{signModels.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'en' ? 'Total Signs' : 'કુલ સાઇન'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{Object.keys(modelCategories).length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'en' ? 'Categories' : 'કેટેગરીઓ'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">3D</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'en' ? 'Interactive' : 'ઇન્ટરેક્ટિવ'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ModelModal
        model={selectedModel}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        language={language}
      />
    </div>
  );
}