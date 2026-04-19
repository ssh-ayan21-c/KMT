const enforceCatalogAccess = async (req, res, next) => {
  try {
    const user = req.user; 
    
    if (!user) {
        return res.status(401).json({ error: 'User context missing' });
    }

    if (user.role === 'admin') {
      req.categoryFilter = {}; 
      return next();
    }

    if (!user.isApproved || !user.approvedCategories || user.approvedCategories.length === 0) {
      req.categoryFilter = { _id: null }; 
      return next();
    }

    req.categoryFilter = { category: { $in: user.approvedCategories } };
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server configuration error' });
  }
};

module.exports = { enforceCatalogAccess };
