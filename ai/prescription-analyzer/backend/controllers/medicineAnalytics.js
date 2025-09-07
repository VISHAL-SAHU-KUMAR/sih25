const mongoose = require('mongoose');

// Medicine Stock Schema (you'll need to create this model)
const medicineStockSchema = new mongoose.Schema({
  medicineId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  genericName: String,
  category: { type: String, required: true },
  manufacturer: String,
  pharmacy: {
    name: { type: String, required: true },
    location: {
      district: String,
      address: String
    }
  },
  stock: {
    current: { type: Number, required: true, min: 0 },
    minimum: { type: Number, required: true, min: 0 },
    maximum: { type: Number, required: true }
  },
  pricing: {
    costPrice: Number,
    sellingPrice: Number,
    mrp: Number
  },
  expiryInfo: {
    expiryDate: Date,
    batchNumber: String
  },
  usage: {
    dailyAverage: { type: Number, default: 0 },
    weeklyAverage: { type: Number, default: 0 },
    monthlyAverage: { type: Number, default: 0 }
  },
  lastUpdated: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const MedicineStock = mongoose.model('MedicineStock', medicineStockSchema);

class MedicineAnalyticsController {

  // Get medicine stock overview
  async getStockOverview(req, res) {
    try {
      const { district, category, pharmacy, lowStock } = req.query;

      let matchQuery = { isActive: true };

      if (district && district !== 'All') {
        matchQuery['pharmacy.location.district'] = district;
      }

      if (category && category !== 'All') {
        matchQuery.category = category;
      }

      if (pharmacy && pharmacy !== 'All') {
        matchQuery['pharmacy.name'] = pharmacy;
      }

      // Add low stock filter
      if (lowStock === 'true') {
        matchQuery.$expr = { $lte: ['$stock.current', '$stock.minimum'] };
      }

      const stockData = await MedicineStock.aggregate([
        { $match: matchQuery },
        {
          $addFields: {
            stockPercentage: {
              $multiply: [
                { $divide: ['$totalCurrentStock', '$totalMaxStock'] },
                100
              ]
            },
            performance: {
              $cond: {
                if: { $and: [{ $lt: ['$lowStockItems', 3] }, { $eq: ['$outOfStockItems', 0] }] },
                then: 'excellent',
                else: {
                  $cond: {
                    if: { $and: [{ $lt: ['$lowStockItems', 5] }, { $lte: ['$outOfStockItems', 1] }] },
                    then: 'good',
                    else: 'needs_attention'
                  }
                }
              }
            }
          }
        },
        { $sort: { stockPercentage: -1 } }
      ]);

      res.json({
        success: true,
        data: pharmacyStats,
        summary: {
          totalPharmacies: pharmacyStats.length,
          avgStockPercentage: pharmacyStats.reduce((sum, p) => sum + p.stockPercentage, 0) / pharmacyStats.length || 0,
          excellentPerformers: pharmacyStats.filter(p => p.performance === 'excellent').length,
          needsAttention: pharmacyStats.filter(p => p.performance === 'needs_attention').length
        }
      });

    } catch (error) {
      console.error('Pharmacy analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Generate automated reorder suggestions
  async generateReorderSuggestions(req, res) {
    try {
      const { district, urgencyLevel = 'all' } = req.query;

      let matchQuery = { 
        isActive: true,
        'usage.dailyAverage': { $gt: 0 }
      };

      if (district && district !== 'All') {
        matchQuery['pharmacy.location.district'] = district;
      }

      const suggestions = await MedicineStock.aggregate([
        { $match: matchQuery },
        {
          $addFields: {
            daysUntilEmpty: {
              $divide: ['$stock.current', '$usage.dailyAverage']
            },
            recommendedOrderQuantity: {
              $subtract: [
                '$stock.maximum',
                '$stock.current'
              ]
            },
            urgency: {
              $cond: {
                if: { $lte: ['$stock.current', 0] },
                then: 'critical',
                else: {
                  $cond: {
                    if: { $lte: ['$stock.current', '$stock.minimum'] },
                    then: 'high',
                    else: {
                      $cond: {
                        if: { $lte: [{ $divide: ['$stock.current', '$usage.dailyAverage'] }, 15] },
                        then: 'medium',
                        else: 'low'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          $match: {
            urgency: urgencyLevel === 'all' ? { $exists: true } : urgencyLevel
          }
        },
        {
          $project: {
            medicineId: 1,
            name: 1,
            category: 1,
            pharmacy: 1,
            stock: 1,
            daysUntilEmpty: 1,
            recommendedOrderQuantity: 1,
            urgency: 1,
            estimatedCost: { $multiply: ['$recommendedOrderQuantity', '$pricing.costPrice'] }
          }
        },
        { $sort: { urgency: 1, daysUntilEmpty: 1 } }
      ]);

      const totalEstimatedCost = suggestions.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

      res.json({
        success: true,
        data: suggestions,
        summary: {
          totalSuggestions: suggestions.length,
          criticalItems: suggestions.filter(s => s.urgency === 'critical').length,
          highPriorityItems: suggestions.filter(s => s.urgency === 'high').length,
          totalEstimatedCost
        }
      });

    } catch (error) {
      console.error('Reorder suggestions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper methods
  async generateReorderRecommendations(predictions) {
    return predictions.map(prediction => ({
      medicineId: prediction.medicineId,
      name: prediction.name,
      currentStock: prediction.stock.current,
      recommendedOrderQuantity: Math.max(
        prediction.stock.maximum - prediction.stock.current,
        prediction.usage.dailyAverage * 30
      ),
      priority: prediction.severity,
      estimatedCost: prediction.pricing?.costPrice * 
        (prediction.stock.maximum - prediction.stock.current) || 0
    }));
  }

  async calculateDemandForecast(medicine, days) {
    // Simple linear forecasting based on usage trends
    const dailyUsage = medicine.usage.dailyAverage;
    const weeklyVariation = 0.15; // 15% variation
    
    const forecast = [];
    let currentStock = medicine.stock.current;

    for (let day = 1; day <= days; day++) {
      // Add some realistic variation
      const variation = (Math.random() - 0.5) * weeklyVariation;
      const predictedUsage = dailyUsage * (1 + variation);
      
      currentStock -= predictedUsage;
      
      forecast.push({
        day,
        predictedUsage: Math.round(predictedUsage * 100) / 100,
        predictedStock: Math.max(0, Math.round(currentStock * 100) / 100),
        stockoutRisk: currentStock <= medicine.stock.minimum ? 
          (currentStock <= 0 ? 'high' : 'medium') : 'low'
      });
    }

    return forecast;
  }

  aggregateForecastSummary(forecasts) {
    const totalMedicines = forecasts.length;
    const stockoutRisk = forecasts.filter(f => 
      f.forecast.some(day => day.stockoutRisk === 'high')
    ).length;

    const avgForecastAccuracy = 85; // Placeholder - implement actual accuracy calculation

    return {
      totalMedicines,
      stockoutRisk,
      avgForecastAccuracy,
      recommendationsCount: stockoutRisk
    };
  }

  async updateUsageStatistics(medicine) {
    // Update usage statistics based on recent stock changes
    // This is a simplified implementation - you might want to track actual usage
    const now = new Date();
    const lastWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);
    
    // In a real implementation, you'd track actual dispensing data
    medicine.usage.dailyAverage = medicine.usage.dailyAverage || 5;
    medicine.usage.weeklyAverage = medicine.usage.dailyAverage * 7;
    medicine.usage.monthlyAverage = medicine.usage.dailyAverage * 30;
  }

  getStockStatus(medicine) {
    if (medicine.stock.current <= 0) return 'out_of_stock';
    if (medicine.stock.current <= medicine.stock.minimum) return 'low_stock';
    return 'in_stock';
  }

  async logStockChange(changeData) {
    // Log stock changes for audit trail
    console.log('Stock change logged:', changeData);
    // In a real implementation, save to audit log collection
  }

  // Export medicine data
  async exportMedicineData(req, res) {
    try {
      const { district, format = 'json' } = req.query;

      let matchQuery = { isActive: true };

      if (district && district !== 'All') {
        matchQuery['pharmacy.location.district'] = district;
      }

      const medicines = await MedicineStock.find(matchQuery)
        .select('name category pharmacy stock usage pricing expiryInfo')
        .sort({ 'pharmacy.name': 1, name: 1 });

      if (format === 'csv') {
        // Convert to CSV format
        const csvData = this.convertToCSV(medicines);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=medicine-data.csv');
        res.send(csvData);
      } else {
        res.json({
          success: true,
          data: medicines,
          exportedAt: new Date(),
          totalRecords: medicines.length
        });
      }

    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  convertToCSV(data) {
    const headers = ['Name', 'Category', 'Pharmacy', 'Current Stock', 'Minimum Stock', 'Status'];
    const csvRows = [headers.join(',')];

    data.forEach(item => {
      const status = this.getStockStatus(item);
      const row = [
        item.name,
        item.category,
        item.pharmacy.name,
        item.stock.current,
        item.stock.minimum,
        status
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }
}

module.exports = new MedicineAnalyticsController(); {
            stockStatus: {
              $cond: {
                if: { $lte: ['$stock.current', 0] },
                then: 'out_of_stock',
                else: {
                  $cond: {
                    if: { $lte: ['$stock.current', '$stock.minimum'] },
                    then: 'low_stock',
                    else: 'in_stock'
                  }
                }
              }
            },
            stockPercentage: {
              $multiply: [
                { $divide: ['$stock.current', '$stock.maximum'] },
                100
              ]
            },
            daysRemaining: {
              $cond: {
                if: { $gt: ['$usage.dailyAverage', 0] },
                then: { $divide: ['$stock.current', '$usage.dailyAverage'] },
                else: null
              }
            }
          }
        },
        {
          $sort: { 'stock.current': 1 }
        }
      ]);

      // Calculate summary statistics
      const summary = {
        totalMedicines: stockData.length,
        inStock: stockData.filter(item => item.stockStatus === 'in_stock').length,
        lowStock: stockData.filter(item => item.stockStatus === 'low_stock').length,
        outOfStock: stockData.filter(item => item.stockStatus === 'out_of_stock').length,
        avgStockLevel: stockData.reduce((sum, item) => sum + item.stockPercentage, 0) / stockData.length || 0
      };

      res.json({
        success: true,
        data: stockData,
        summary
      });

    } catch (error) {
      console.error('Stock overview error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Predict medicine shortages
  async predictShortages(req, res) {
    try {
      const { district, days = 30 } = req.query;
      const forecastDays = parseInt(days);

      let matchQuery = { 
        isActive: true,
        'usage.dailyAverage': { $gt: 0 }
      };

      if (district && district !== 'All') {
        matchQuery['pharmacy.location.district'] = district;
      }

      const predictions = await MedicineStock.aggregate([
        { $match: matchQuery },
        {
          $addFields: {
            predictedShortage: {
              $lte: [
                { $divide: ['$stock.current', '$usage.dailyAverage'] },
                forecastDays
              ]
            },
            daysUntilShortage: {
              $divide: ['$stock.current', '$usage.dailyAverage']
            },
            predictedStockAfterDays: {
              $subtract: [
                '$stock.current',
                { $multiply: ['$usage.dailyAverage', forecastDays] }
              ]
            }
          }
        },
        {
          $match: {
            $or: [
              { predictedShortage: true },
              { predictedStockAfterDays: { $lte: '$stock.minimum' } }
            ]
          }
        },
        {
          $addFields: {
            severity: {
              $cond: {
                if: { $lte: ['$daysUntilShortage', 7] },
                then: 'critical',
                else: {
                  $cond: {
                    if: { $lte: ['$daysUntilShortage', 15] },
                    then: 'high',
                    else: 'medium'
                  }
                }
              }
            }
          }
        },
        {
          $sort: { daysUntilShortage: 1 }
        }
      ]);

      // Calculate reorder recommendations
      const reorderRecommendations = await this.generateReorderRecommendations(predictions);

      res.json({
        success: true,
        data: {
          predictions,
          reorderRecommendations,
          summary: {
            totalPredictedShortages: predictions.length,
            criticalShortages: predictions.filter(p => p.severity === 'critical').length,
            highPriorityShortages: predictions.filter(p => p.severity === 'high').length,
            avgDaysUntilShortage: predictions.reduce((sum, p) => sum + p.daysUntilShortage, 0) / predictions.length || 0
          }
        }
      });

    } catch (error) {
      console.error('Shortage prediction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get medicine usage analytics
  async getUsageAnalytics(req, res) {
    try {
      const { district, timeRange = '30d', category } = req.query;
      
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      let matchQuery = {
        isActive: true,
        lastUpdated: { $gte: startDate }
      };

      if (district && district !== 'All') {
        matchQuery['pharmacy.location.district'] = district;
      }

      if (category && category !== 'All') {
        matchQuery.category = category;
      }

      // Usage trends by category
      const categoryUsage = await MedicineStock.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$category',
            totalUsage: { $sum: '$usage.monthlyAverage' },
            averageUsage: { $avg: '$usage.monthlyAverage' },
            medicineCount: { $sum: 1 },
            totalStock: { $sum: '$stock.current' }
          }
        },
        { $sort: { totalUsage: -1 } }
      ]);

      // Usage trends by pharmacy
      const pharmacyUsage = await MedicineStock.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$pharmacy.name',
            totalMedicines: { $sum: 1 },
            totalUsage: { $sum: '$usage.monthlyAverage' },
            avgStockLevel: { 
              $avg: { 
                $multiply: [
                  { $divide: ['$stock.current', '$stock.maximum'] },
                  100
                ]
              }
            },
            lowStockItems: {
              $sum: {
                $cond: [{ $lte: ['$stock.current', '$stock.minimum'] }, 1, 0]
              }
            }
          }
        },
        { $sort: { totalUsage: -1 } }
      ]);

      // Top used medicines
      const topMedicines = await MedicineStock.find(matchQuery)
        .sort({ 'usage.monthlyAverage': -1 })
        .limit(10)
        .select('name category usage pharmacy stock');

      res.json({
        success: true,
        data: {
          categoryUsage,
          pharmacyUsage,
          topMedicines,
          summary: {
            totalCategories: categoryUsage.length,
            totalPharmacies: pharmacyUsage.length,
            avgCategoryUsage: categoryUsage.reduce((sum, cat) => sum + cat.averageUsage, 0) / categoryUsage.length || 0
          }
        }
      });

    } catch (error) {
      console.error('Usage analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get demand forecasting
  async getDemandForecast(req, res) {
    try {
      const { medicineId, district, forecastDays = 30 } = req.query;

      let matchQuery = { isActive: true };
      
      if (medicineId) {
        matchQuery.medicineId = medicineId;
      }

      if (district && district !== 'All') {
        matchQuery['pharmacy.location.district'] = district;
      }

      const medicines = await MedicineStock.find(matchQuery);

      const forecasts = await Promise.all(medicines.map(async (medicine) => {
        const forecast = await this.calculateDemandForecast(medicine, parseInt(forecastDays));
        return {
          medicineId: medicine.medicineId,
          name: medicine.name,
          category: medicine.category,
          pharmacy: medicine.pharmacy.name,
          currentStock: medicine.stock.current,
          forecast
        };
      }));

      // Aggregate forecast summary
      const summary = this.aggregateForecastSummary(forecasts);

      res.json({
        success: true,
        data: forecasts,
        summary
      });

    } catch (error) {
      console.error('Demand forecast error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update medicine stock
  async updateStock(req, res) {
    try {
      const { medicineId, newStock, reason } = req.body;

      const medicine = await MedicineStock.findOne({ medicineId });
      if (!medicine) {
        return res.status(404).json({ error: 'Medicine not found' });
      }

      const previousStock = medicine.stock.current;
      medicine.stock.current = newStock;
      medicine.lastUpdated = new Date();

      // Update usage statistics
      await this.updateUsageStatistics(medicine);

      await medicine.save();

      // Log stock change
      await this.logStockChange({
        medicineId,
        previousStock,
        newStock,
        reason,
        pharmacy: medicine.pharmacy.name
      });

      res.json({
        success: true,
        message: 'Stock updated successfully',
        data: {
          medicineId,
          previousStock,
          newStock,
          stockStatus: this.getStockStatus(medicine)
        }
      });

    } catch (error) {
      console.error('Stock update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get pharmacy analytics
  async getPharmacyAnalytics(req, res) {
    try {
      const { district } = req.query;

      let matchQuery = { isActive: true };

      if (district && district !== 'All') {
        matchQuery['pharmacy.location.district'] = district;
      }

      const pharmacyStats = await MedicineStock.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              pharmacy: '$pharmacy.name',
              district: '$pharmacy.location.district'
            },
            totalMedicines: { $sum: 1 },
            totalCurrentStock: { $sum: '$stock.current' },
            totalMaxStock: { $sum: '$stock.maximum' },
            lowStockItems: {
              $sum: {
                $cond: [{ $lte: ['$stock.current', '$stock.minimum'] }, 1, 0]
              }
            },
            outOfStockItems: {
              $sum: {
                $cond: [{ $lte: ['$stock.current', 0] }, 1, 0]
              }
            },
            totalValue: {
              $sum: { $multiply: ['$stock.current', '$pricing.sellingPrice'] }
            },
            avgUsage: { $avg: '$usage.monthlyAverage' }
          }
        },
        {
          $addFields:
