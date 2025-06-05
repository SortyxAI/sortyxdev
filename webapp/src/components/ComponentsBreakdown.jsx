import { motion } from 'framer-motion';
import { useWaste } from '../context/WasteContext';

const ComponentsBreakdown = () => {
  const { components, wasteCategories } = useWaste();

  if (!components || components.length <= 1) {
    return null; // Don't show if there's only one component or none
  }

  const getCategoryColor = (categoryId) => {
    const category = wasteCategories.find(cat => cat.id === categoryId);
    return category ? category.color : 'bg-gray-500';
  };

  const getCategoryIcon = (categoryId) => {
    const category = wasteCategories.find(cat => cat.id === categoryId);
    return category ? category.icon : '🗑️';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20"
    >
      <h3 className="text-xl font-bold text-white mb-4">Component Breakdown</h3>
      <p className="text-white/80 mb-6">
        This item has multiple components that should be separated for proper disposal:
      </p>

      <div className="space-y-4">
        {components.map((component, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 p-4 bg-white/5 rounded-lg"
          >
            <div className={`w-12 h-12 ${getCategoryColor(component.classification.id)} rounded-full flex items-center justify-center text-2xl`}>
              {getCategoryIcon(component.classification.id)}
            </div>
            
            <div className="flex-1">
              <h4 className="text-white font-medium">{component.name}</h4>
              <p className="text-white/70 text-sm mt-1">{component.reason}</p>
              <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/10">
                {component.classification.name}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <p className="text-white/80 text-sm">
          <span className="text-white font-medium">Pro Tip:</span> Separate these components before disposal to ensure each part is properly recycled or disposed of.
        </p>
      </div>
    </motion.div>
  );
};

export default ComponentsBreakdown;