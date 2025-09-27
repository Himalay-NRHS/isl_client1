export interface SignModel {
  id: string;
  name: string;
  cleanName: string;
  gujaratiName: string;
  category: string;
  modelPath: string;
  description?: string;
}

export const modelCategories: { [key: string]: { name: string; gujaratiName: string; icon: string; color: string; } } = {
  animals: { 
    name: 'Animals', 
    gujaratiName: 'પ્રાણીઓ',
    icon: '🐾',
    color: 'from-green-400 to-green-600'
  },
  people: { 
    name: 'People & Relationships', 
    gujaratiName: 'લોકો અને સંબંધો',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-blue-400 to-blue-600'
  },
  actions: { 
    name: 'Actions & Verbs', 
    gujaratiName: 'ક્રિયાઓ',
    icon: '🏃‍♂️',
    color: 'from-purple-400 to-purple-600'
  },
  objects: { 
    name: 'Objects', 
    gujaratiName: 'વસ્તુઓ',
    icon: '🪑',
    color: 'from-orange-400 to-orange-600'
  },
  places: { 
    name: 'Places', 
    gujaratiName: 'સ્થળો',
    icon: '🏫',
    color: 'from-indigo-400 to-indigo-600'
  },
  emotions: { 
    name: 'Emotions & Feelings', 
    gujaratiName: 'લાગણીઓ',
    icon: '😊',
    color: 'from-pink-400 to-pink-600'
  },
  qualities: { 
    name: 'Qualities & Descriptions', 
    gujaratiName: 'ગુણધર્મો',
    icon: '⭐',
    color: 'from-yellow-400 to-yellow-600'
  }
};

export const signModels: SignModel[] = [
  // Animals
  {
    id: 'birds',
    name: 'Birds',
    cleanName: 'Birds',
    gujaratiName: 'પક્ષીઓ',
    category: 'animals',
    modelPath: '/models/birds.glb',
    description: 'Sign for birds - flying creatures with wings'
  },
  {
    id: 'cat',
    name: 'Cat',
    cleanName: 'Cat',
    gujaratiName: 'બિલાડી',
    category: 'animals',
    modelPath: '/models/cat.glb',
    description: 'Sign for cat - a domestic feline animal'
  },
  {
    id: 'dog',
    name: 'Dog',
    cleanName: 'Dog',
    gujaratiName: 'કૂતરો',
    category: 'animals',
    modelPath: '/models/dog.glb',
    description: 'Sign for dog - a loyal domestic animal'
  },

  // People & Relationships
  {
    id: 'child',
    name: 'Child',
    cleanName: 'Child',
    gujaratiName: 'બાળક',
    category: 'people',
    modelPath: '/models/child.glb',
    description: 'Sign for child - a young person'
  },
  {
    id: 'father',
    name: 'Father',
    cleanName: 'Father',
    gujaratiName: 'પિતા',
    category: 'people',
    modelPath: '/models/father.glb',
    description: 'Sign for father - male parent'
  },
  {
    id: 'friend',
    name: 'Friend',
    cleanName: 'Friend',
    gujaratiName: 'મિત્ર',
    category: 'people',
    modelPath: '/models/friend.glb',
    description: 'Sign for friend - a close companion'
  },
  {
    id: 'girl',
    name: 'Girl',
    cleanName: 'Girl',
    gujaratiName: 'છોકરી',
    category: 'people',
    modelPath: '/models/Girl.glb',
    description: 'Sign for girl - a young female person'
  },
  {
    id: 'student',
    name: 'Student',
    cleanName: 'Student',
    gujaratiName: 'વિદ્યાર્થી',
    category: 'people',
    modelPath: '/models/student.glb',
    description: 'Sign for student - a person who studies'
  },

  // Actions & Verbs
  {
    id: 'go',
    name: 'Go',
    cleanName: 'Go',
    gujaratiName: 'જાવું',
    category: 'actions',
    modelPath: '/models/Go.glb',
    description: 'Sign for go - to move or travel'
  },
  {
    id: 'collect',
    name: 'Collect',
    cleanName: 'Collect',
    gujaratiName: 'એકત્રિત કરવું',
    category: 'actions',
    modelPath: '/models/Collect.glb',
    description: 'Sign for collect - to gather things together'
  },
  {
    id: 'share',
    name: 'Share',
    cleanName: 'Share',
    gujaratiName: 'વહેંચવું',
    category: 'actions',
    modelPath: '/models/Share.glb',
    description: 'Sign for share - to give or divide something with others'
  },

  // Objects
  {
    id: 'chair',
    name: 'Chair',
    cleanName: 'Chair',
    gujaratiName: 'ખુરશી',
    category: 'objects',
    modelPath: '/models/chair.glb',
    description: 'Sign for chair - furniture for sitting'
  },

  // Places
  {
    id: 'school',
    name: 'School',
    cleanName: 'School',
    gujaratiName: 'શાળા',
    category: 'places',
    modelPath: '/models/school.glb',
    description: 'Sign for school - a place of learning'
  },

  // Emotions & Feelings
  {
    id: 'sorry',
    name: 'Sorry',
    cleanName: 'Sorry',
    gujaratiName: 'માફ કરશો',
    category: 'emotions',
    modelPath: '/models/sorry.glb',
    description: 'Sign for sorry - expressing regret or apology'
  },

  // Qualities & Descriptions
  {
    id: 'good',
    name: 'Good',
    cleanName: 'Good',
    gujaratiName: 'સારું',
    category: 'qualities',
    modelPath: '/models/good.glb',
    description: 'Sign for good - something positive or well done'
  },
  {
    id: 'hot',
    name: 'Hot',
    cleanName: 'Hot',
    gujaratiName: 'ગરમ',
    category: 'qualities',
    modelPath: '/models/hot.glb',
    description: 'Sign for hot - high temperature or spicy'
  },
  {
    id: 'hard',
    name: 'Hard',
    cleanName: 'Hard',
    gujaratiName: 'મુશ્કેલ',
    category: 'qualities',
    modelPath: '/models/Hard.glb',
    description: 'Sign for hard - difficult or solid'
  },
  {
    id: 'old',
    name: 'Old',
    cleanName: 'Old',
    gujaratiName: 'જૂનું',
    category: 'qualities',
    modelPath: '/models/old.glb',
    description: 'Sign for old - having existed for a long time'
  },
  {
    id: 'depth',
    name: 'Deep',
    cleanName: 'Deep',
    gujaratiName: 'ઊંડું',
    category: 'qualities',
    modelPath: '/models/depth.glb',
    description: 'Sign for deep - extending far down or inward'
  },
  {
    id: 'score',
    name: 'Score',
    cleanName: 'Score',
    gujaratiName: 'સ્કોર',
    category: 'actions',
    modelPath: '/models/Score.glb',
    description: 'Sign for score - points earned in a game or test'
  }
];

// Helper functions
export const getModelsByCategory = (category: string): SignModel[] => {
  return signModels.filter(model => model.category === category);
};

export const searchModels = (query: string): SignModel[] => {
  const lowercaseQuery = query.toLowerCase();
  return signModels.filter(model => 
    model.cleanName.toLowerCase().includes(lowercaseQuery) ||
    model.gujaratiName.includes(lowercaseQuery) ||
    model.description?.toLowerCase().includes(lowercaseQuery)
  );
};

export const getAllCategories = () => {
  return Object.keys(modelCategories);
};