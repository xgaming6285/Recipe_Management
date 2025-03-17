import mongoose from 'mongoose';
const { Schema } = mongoose;

const RecipeSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  ingredients: {
    type: [String],
    required: [true, 'At least one ingredient is required'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one ingredient is required'
    }
  },
  steps: {
    type: [String],
    required: [true, 'At least one step is required'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one step is required'
    }
  },
  imageUrl: {
    type: String,
    default: ''
  },
  cookingTime: {
    type: Number,
    required: [true, 'Cooking time is required'],
    min: [1, 'Cooking time must be at least 1 minute']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'other'],
    default: 'other'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  }
}, { timestamps: true });

// Add text index for search functionality
RecipeSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Recipe', RecipeSchema);