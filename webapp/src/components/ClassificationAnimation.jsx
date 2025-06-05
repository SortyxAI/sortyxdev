import { motion } from 'framer-motion';

const ClassificationAnimation = ({ classification, objectName }) => {
  const getBucketColor = () => {
    switch (classification.id) {
      case 'recyclable': return 'bg-primary-500';
      case 'hazardous': return 'bg-error-500';
      case 'solid': return 'bg-gray-600';
      case 'organic': return 'bg-secondary-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="relative h-64 w-full max-w-md mx-auto mb-8">
      <motion.div
        initial={{ y: 0, x: "50%", scale: 1 }}
        animate={{ y: 200, scale: 0.5 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute top-0 transform -translate-x-1/2"
      >
        <div className="p-4 bg-white rounded-lg shadow-lg">
          <span className="text-2xl">{objectName}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
      >
        <div className={`w-32 h-40 ${getBucketColor()} rounded-lg relative`}>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="text-4xl">{classification.icon}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ClassificationAnimation;