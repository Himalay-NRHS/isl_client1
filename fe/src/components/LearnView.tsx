import { Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import { ModelCard } from './ModelCard';
import { ModelModal } from './ModelModal';
import { signModels, modelCategories, searchModels } from '../data/models';
import { useLanguage } from '../contexts/LanguageContext';
import type { SignModel } from '../data/models';

export function LearnView() {
  const { t } = useLanguage();
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

  const handleStartPractice = async () => {
    try {
      // Call backend to start the OpenCV model
      const response = await fetch('http://localhost:3001/api/start-practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Show success message or notification
        alert('OpenCV Practice Mode Started! Check your camera for the ISL detection window.');
      } else {
        alert('Failed to start practice mode. Make sure the backend server is running.');
      }
    } catch (error) {
      console.error('Error starting practice mode:', error);
      alert('Failed to connect to the server. Make sure both frontend and backend are running.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6">
          <span className="text-4xl">🤟</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('learn.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6">
          {t('learn.subtitle')}
        </p>
        
        {/* Global Practice Button */}
        <button
          onClick={handleStartPractice}
          className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          <span className="text-2xl">📹</span>
          <span>Start Practice Mode</span>
        </button>
      </div>

      {/* Filter and Search Section */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('learn.searchPlaceholder')}
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
            {t('learn.allCategories')}
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
              {t(`categories.${key}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('learn.showingResults', { count: filteredModels.length, total: signModels.length })}
        </p>
      </div>

      {/* Models Grid */}
      {filteredModels.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('learn.noSignsFound')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('learn.tryAdjusting')}
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
                      {t(`categories.${categoryKey}`)}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {models.length} {t('learn.signs')}
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
            {t('learn.yourLearningJourney')}
          </h2>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{signModels.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('learn.totalSigns')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{Object.keys(modelCategories).length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('learn.categories')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">3D</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('learn.interactive')}
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
      />
    </div>
  );
}