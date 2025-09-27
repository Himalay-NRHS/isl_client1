import SimpleChildViewer from './components/SimpleChildViewer';
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          ISL Child Model Test
        </h1>
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <SimpleChildViewer />
        </div>
      </div>
    </div>
  );
}

export default App;