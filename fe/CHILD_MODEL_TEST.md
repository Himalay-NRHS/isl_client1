# Testing the Child.glb Model Display

## Current Setup
The frontend has been configured to display the `child.glb` model using Three.js. Here's what's been implemented:

### 1. **Default Model Display**
- The `GLBViewer` component now defaults to showing `/models/child.glb` when no words are provided
- The model will appear in the "Text to Sign" converter animation box
- The model will automatically load and play its animation (if available)

### 2. **How to Test**

#### Option A: Full Interface
1. Navigate to the frontend directory: `cd /d/projects/sih/product/product/fe`
2. Start the development server: `npm run dev`
3. Open the app in your browser (usually http://localhost:5173)
4. Click on "Text to Sign" mode
5. You should see the child.glb model loaded in the animation box

#### Option B: Simple Test Component
If you want to test just the model loading:
1. Change the import in `src/main.tsx` from `./App.tsx` to `./TestApp.tsx`
2. Run the development server
3. You'll see a simple page with just the child model

### 3. **What You Should See**
- The child.glb model should load automatically
- If the model has animations, they will play in a loop
- You should see a 3D rendered model in the animation box
- Loading states and error handling are included

### 4. **Troubleshooting**
If the model doesn't appear:
1. Check browser console for loading errors
2. Verify the model path: `/models/child.glb`
3. Ensure the model file is not corrupted
4. Check network tab for 404 errors

### 5. **Technical Details**
- **Technology**: Pure Three.js (no React-Three libraries)
- **Model Format**: GLB (optimized GLTF)
- **Animation**: Automatic loop if animations exist
- **Camera**: Positioned at (0, 1.6, 3) for optimal viewing
- **Lighting**: Ambient + directional light setup

### 6. **Next Steps**
Once you confirm the child.glb model displays correctly:
1. Test with different models by typing words in the text input
2. Connect to your backend API for real text-to-sign conversion
3. Add more models to the `/public/models/` folder as needed

The system is now ready to display the child.glb model by default in the Text to Sign converter!