
// Middleware to validate recipe input
const validateRecipeInput = (req, res, next) => {
  // Basic validation
  const { title, ingredients, instructions } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Recipe title is required' });
  }

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'At least one ingredient is required' });
  }

  if (!instructions || instructions.trim() === '') {
    return res.status(400).json({ error: 'Recipe instructions are required' });
  }

  next();
};

export default validateRecipeInput; 