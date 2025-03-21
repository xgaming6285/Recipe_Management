import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ingredientSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  }
});

const recipeSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  ingredients: [ingredientSchema],
  instructions: [{
    step: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  cookingTime: {
    type: Number,
    required: true,
    min: [1, 'Cooking time must be at least 1 minute']
  },
  servings: {
    type: Number,
    required: true,
    min: [1, 'Recipe must serve at least 1 person']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack']
  },
  tags: [{
    type: String,
    trim: true
  }],
  nutrition: {
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fat: Number
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratings: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: 'default-recipe.jpg'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for URL
recipeSchema.virtual('url').get(function() {
  return `/recipes/${this._id}`;
});

// Index for better search performance
recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Pre-save middleware to calculate average rating
recipeSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    this.averageRating = this.ratings.reduce((acc, curr) => acc + curr.rating, 0) / this.ratings.length;
  }
  next();
});

// Static method to find similar recipes
recipeSchema.statics.findSimilar = function(recipeId) {
  return this.find({
    _id: { $ne: recipeId },
    $or: [
      { category: this.category },
      { tags: { $in: this.tags } }
    ]
  }).limit(5);
};

// Instance method to check if recipe is vegetarian
recipeSchema.methods.isVegetarian = function() {
  const nonVegIngredients = ['chicken', 'beef', 'pork', 'fish'];
  return !this.ingredients.some(ing => 
    nonVegIngredients.some(nonVeg => 
      ing.name.toLowerCase().includes(nonVeg)
    )
  );
};

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;