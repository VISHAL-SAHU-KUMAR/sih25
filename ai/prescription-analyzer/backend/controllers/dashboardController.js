const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

class DashboardController {

  // Get comprehensive dashboard overview
  async getDashboardOverview(req, res) {
    try {
      const { district, timeRange = '24h' } = req.query;
      
      const hours = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
      const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

      // Build match queries
      const doctorQuery = this.buildDistrictQuery(district, 'location.district');
      const appointmentQuery = this.buildDistrictQuery(district, 'patientInfo.location.district');
      appointmentQuery.createdAt = { $gte: startDate };

      // Fetch all metrics in parallel
      const [
        doctorStats,
        patientStats,
        appointmentStats,
        emergencyStats,
        performanceStats
      ] = await Promise.all([
        this.getDoctorStats(doctorQuery),
        this.getPatientStats(district),
        this.getAppointmentStats(appointmentQuery),
        this.getEmergencyStats(appointmentQuery),
        this.getPerformanceStats(appointmentQuery)
      ]);

      // Real-time metrics
      const realTimeMetrics = await this.getRealTimeMetrics(district);

      res.json({
        success: true,
        data: {
          overview: {
            ...doctorStats,
            ...patientStats,
            ...appointmentStats,
            ...emergencyStats,
            ...performanceStats
          },
          realTime: realTimeMetrics,
          lastUpdated: new Date()
        }
      });

    } catch (error) {
      console.error('Dashboard overview error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get real-time system metrics
  async getRealTimeMetrics(district) {
    const doctorQuery = this.buildDistrictQuery(district, 'location.district');
    const appointmentQuery = this.buildDistrictQuery(district, 'patientInfo.location.district');
    const now = new Date();
    const last5Minutes = new Date(now - 5 * 60 * 1000);

    appointmentQuery.createdAt = { $gte: last5Minutes };

    const [activeDoctors, ongoingConsultations, queueLength, systemLoad] = await Promise.all([
      Doctor.countDocuments({ ...doctorQuery, onlineStatus: 'online' }),
      Appointment.countDocuments({ 
        ...this.buildDistrictQuery(district, 'patientInfo.location.district'),
        status: 'in_progress' 
      }),
      Appointment.countDocuments({ 
        ...this.buildDistrictQuery(district, 'patientInfo.location.district'),
        status: 'scheduled',
        appointmentDate: { $gte: now, $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) }
      }),
      this.calculateSystemLoad(district)
    ]);

    return {
      activeDoctors,
      ongoingConsultations,
      queueLength,
      systemLoad,
      recentActivity: await this.getRecentActivity(district),
      alerts: await this.getSystemAlerts(district)
    };
  }

  // Get trend analysis data
  async getTrendAnalysis(req, res) {
    try {
      const { district, period = 'week' } = req.query;
      
      const days = period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 90;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const appointmentQuery = this.buildDistrictQuery(district, 'patientInfo.location.district');
      appointmentQuery.createdAt = { $gte: startDate };

      // Generate time series data
      const trends = await Promise.all([
        this.getAppointmentTrends(appointmentQuery, days),
        this.getDoctorUtilizationTrends(district, days),
        this.getPatientSatisfactionTrends(appointmentQuery, days),
        this.getSpecialtyDemandTrends(appointmentQuery, days)
      ]);

      res.json({
        success: true,
        data: {
          appointmentTrends: trends[0],
          doctorUtilization: trends[1],
          patientSatisfaction: trends[2],
          specialtyDemand: trends[3],
          period,
          generatedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Trend analysis error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get performance analytics
  async getPerformanceAnalytics(req, res) {
    try {
      const { district, metric = 'all' } = req.query;
      const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      let data = {};

      switch (metric) {
        case 'doctor_performance':
          data = await this.getDoctorPerformanceMetrics(district, last30Days);
          break;
        case 'system_efficiency':
          data = await this.getSystemEfficiencyMetrics(district, last30Days);
          break;
        case 'patient_outcomes':
          data = await this.getPatientOutcomeMetrics(district, last30Days);
          break;
        default:
          data = {
            doctorPerformance: await this.getDoctorPerformanceMetrics(district, last30Days),
            systemEfficiency: await this.getSystemEfficiencyMetrics(district, last30Days),
            patientOutcomes: await this.getPatientOutcomeMetrics(district, last30Days)
          };
      }

      res.json({
        success: true,
        data,
        metric,
        period: '30 days'
      });

    } catch (error) {
      console.error('Performance analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get resource utilization data
  async getResourceUtilization(req, res) {
    try {
      const { district } = req.query;
      const now = new Date();
      const last24Hours = new Date(now - 24 * 60 * 60 * 1000);

      const doctorQuery = this.buildDistrictQuery(district, 'location.district');
      const appointmentQuery = this.buildDistrictQuery(district, 'patientInfo.location.district');

      // Doctor utilization
      const doctorUtilization = await Doctor.aggregate([
        { $match: { ...doctorQuery, isActive: true } },
        {
          $addFields: {
            utilizationRate: {
              $multiply: [
                { $divide: ['$workload.currentPatients', '$availability.maxPatientsPerDay'] },
                100
              ]
            }
          }
        },
        {
          $group: {
            _id: '$specialization',
            avgUtilization: { $avg: '$utilizationRate' },
            doctorCount: { $sum: 1 },
            totalCapacity: { $sum: '$availability.maxPatientsPerDay' },
            currentLoad: { $sum: '$workload.currentPatients' }
          }
        },
        { $sort: { avgUtilization: -1 } }
      ]);

      // Time slot utilization
      const timeSlotUtilization = await Appointment.aggregate([
        {
          $match: {
            ...appointmentQuery,
            appointmentDate: { $gte: last24Hours },
            status: { $in: ['scheduled', 'confirmed', 'completed'] }
          }
        },
        {
          $group: {
            _id: { $hour: '$appointmentDate' },
            appointmentCount: { $sum: 1 },
            avgWaitTime: { $avg: '$analytics.waitTime' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Consultation mode utilization
      const modeUtilization = await Appointment.aggregate([
        {
          $match: {
            ...appointmentQuery,
            createdAt: { $gte: last24Hours }
          }
        },
        {
          $group: {
            _id: '$consultationMode',
            count: { $sum: 1 },
            avgDuration: { $avg: '$session.actualDuration' },
            successRate: {
              $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          doctorUtilization,
          timeSlotUtilization,
          modeUtilization,
          summary: {
            overallUtilization: doctorUtilization.reduce((sum, d) => sum + d.avgUtilization, 0) / doctorUtilization.length || 0,
            peakHour: timeSlotUtilization.reduce((peak, slot) => 
              slot.appointmentCount > peak.appointmentCount ? slot : peak, { _id: 0, appointmentCount: 0 })._id,
            preferredMode: modeUtilization.reduce((top, mode) => 
              mode.count > top.count ? mode : top, { _id: 'unknown', count: 0 })._id
          }
        }
      });

    } catch (error) {
      console.error('Resource utilization error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Generate automated reports
  async generateReport(req, res) {
    try {
      const { reportType, district, startDate, endDate, format = 'json' } = req.body;

      const dateRange = {
        start: new Date(startDate || Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(endDate || Date.now())
      };

      let reportData = {};

      switch (reportType) {
        case 'daily_operations':
          reportData = await this.generateDailyOperationsReport(district, dateRange);
          break;
        case 'weekly_summary':
          reportData = await this.generateWeeklySummaryReport(district, dateRange);
          break;
        case 'monthly_analytics':
          reportData = await this.generateMonthlyAnalyticsReport(district, dateRange);
          break;
        case 'performance_review':
          reportData = await this.generatePerformanceReviewReport(district, dateRange);
          break;
        default:
          return res.status(400).json({ error: 'Invalid report type' });
      }

      const report = {
        reportType,
        district: district || 'All Districts',
        dateRange,
        generatedAt: new Date(),
        data: reportData
      };

      if (format === 'pdf') {
        // In a real implementation, generate PDF using libraries like puppeteer
        res.json({ 
          success: true, 
          message: 'PDF generation not implemented in demo',
          reportData: report 
        });
      } else {
        res.json({
          success: true,
          report
        });
      }

    } catch (error) {
      console.error('Report generation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper methods
  buildDistrictQuery(district, fieldPath) {
    if (!district || district === 'All') return {};
    return { [fieldPath]: district };
  }

  async getDoctorStats(query) {
    const [total, active, online, verified] = await Promise.all([
      Doctor.countDocuments({ ...query, isActive: true }),
      Doctor.countDocuments({ ...query, isActive: true, isVerified: true }),
      Doctor.countDocuments({ ...query, onlineStatus: 'online' }),
      Doctor.countDocuments({ ...query, isVerified: true })
    ]);

    return {
      totalDoctors: total,
      activeDoctors: active,
      onlineDoctors: online,
      verifiedDoctors: verified
    };
  }

  async getPatientStats(district) {
    const query = this.buildDistrictQuery(district, 'address.district');
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [total, active, newPatients, urgentCases] = await Promise.all([
      Patient.countDocuments({ ...query, isActive: true }),
      Patient.countDocuments({ 
        ...query, 
        isActive: true, 
        'platformUsage.lastConsultation': { $gte: last30Days } 
      }),
      Patient.countDocuments({ 
        ...query, 
        createdAt: { $gte: last30Days } 
      }),
      Patient.countDocuments({ 
        ...query, 
        'recentHealthStatus.urgencyLevel': { $in: ['High', 'Emergency'] } 
      })
    ]);

    return {
      totalPatients: total,
      activePatients: active,
      newPatients,
      urgentCases
    };
  }

  async getAppointmentStats(query) {
    const [total, completed, cancelled, pending, avgWaitTime] = await Promise.all([
      Appointment.countDocuments(query),
      Appointment.countDocuments({ ...query, status: 'completed' }),
      Appointment.countDocuments({ ...query, status: 'cancelled' }),
      Appointment.countDocuments({ ...query, status: { $in: ['scheduled', 'confirmed'] } }),
      Appointment.aggregate([
        { $match: { ...query, 'analytics.waitTime': { $exists: true } } },
        { $group: { _id: null, avgWait: { $avg: '$analytics.waitTime' } } }
      ])
    ]);

    return {
      totalAppointments: total,
      completedAppointments: completed,
      cancelledAppointments: cancelled,
      pendingAppointments: pending,
      avgWaitTime: avgWaitTime[0]?.avgWait || 0,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }

  async getEmergencyStats(query) {
    const emergencyQuery = {
      ...query,
      'consultationReason.urgencyLevel': 'Emergency'
    };

    const [total, resolved, avgResponseTime] = await Promise.all([
      Appointment.countDocuments(emergencyQuery),
      Appointment.countDocuments({ ...emergencyQuery, status: 'completed' }),
      Appointment.aggregate([
        { $match: { ...emergencyQuery, 'analytics.responseTime': { $exists: true } } },
        { $group: { _id: null, avgResponse: { $avg: '$analytics.responseTime' } } }
      ])
    ]);

    return {
      emergencyAppointments: total,
      resolvedEmergencies: resolved,
      avgEmergencyResponseTime: avgResponseTime[0]?.avgResponse || 0
    };
  }

  async getPerformanceStats(query) {
    const satisfactionData = await Appointment.aggregate([
      { $match: { ...query, 'feedback.patientRating': { $exists: true } } },
      {
        $group: {
          _id: null,
          avgSatisfaction: { $avg: '$feedback.patientRating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    return {
      avgPatientSatisfaction: satisfactionData[0]?.avgSatisfaction || 0,
      totalSatisfactionRatings: satisfactionData[0]?.totalRatings || 0
    };
  }

  async calculateSystemLoad(district) {
    const doctorQuery = this.buildDistrictQuery(district, 'location.district');
    
    const doctors = await Doctor.find({
      ...doctorQuery,
      isActive: true,
      onlineStatus: 'online'
    }).select('workload.currentPatients availability.maxPatientsPerDay');

    if (doctors.length === 0) return 0;

    const totalLoad = doctors.reduce((sum, doc) => {
      const utilization = doc.workload.currentPatients / doc.availability.maxPatientsPerDay;
      return sum + utilization;
    }, 0);

    return Math.round((totalLoad / doctors.length) * 100);
  }

  async getRecentActivity(district) {
    const last10Minutes = new Date(Date.now() - 10 * 60 * 1000);
    const query = this.buildDistrictQuery(district, 'patientInfo.location.district');
    query.createdAt = { $gte: last10Minutes };

    return await Appointment.find(query)
      .select('patientInfo.name consultationReason.chiefComplaint createdAt status')
      .sort({ createdAt: -1 })
      .limit(5);
  }

  async getSystemAlerts(district) {
    const alerts = [];
    
    // Check for overloaded doctors
    const overloadedDoctors = await Doctor.countDocuments({
      ...this.buildDistrictQuery(district, 'location.district'),
      isActive: true,
      $expr: { $gt: ['$workload.currentPatients', { $multiply: ['$availability.maxPatientsPerDay', 0.9] }] }
    });

    if (overloadedDoctors > 0) {
      alerts.push({
        type: 'warning',
        message: `${overloadedDoctors} doctors are at >90% capacity`,
        priority: 'medium'
      });
    }

    // Check for long wait times
    const longWaits = await Appointment.countDocuments({
      ...this.buildDistrictQuery(district, 'patientInfo.location.district'),
      status: 'scheduled',
      'analytics.waitTime': { $gt: 60 }
    });

    if (longWaits > 0) {
      alerts.push({
        type: 'error',
        message: `${longWaits} patients waiting >60 minutes`,
        priority: 'high'
      });
    }

    return alerts;
  }

  async getAppointmentTrends(query, days) {
    const groupBy = days <= 7 ? { $hour: '$createdAt' } : { $dayOfYear: '$createdAt' };
    
    return await Appointment.aggregate([
      { $match: query },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
  }

  async getDoctorUtilizationTrends(district, days) {
    const doctorQuery = this.buildDistrictQuery(district, 'location.district');
    
    // Simplified implementation - in reality, you'd track utilization over time
    return await Doctor.aggregate([
      { $match: { ...doctorQuery, isActive: true } },
      {
        $project: {
          name: 1,
          utilization: {
            $multiply: [
              { $divide: ['$workload.currentPatients', '$availability.maxPatientsPerDay'] },
              100
            ]
          }
        }
      },
      { $sort: { utilization: -1 } },
      { $limit: 10 }
    ]);
  }

  async getPatientSatisfactionTrends(query, days) {
    const groupBy = days <= 7 ? 
      { $dateToString: { format: '%H', date: '$createdAt' } } :
      { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };

    return await Appointment.aggregate([
      { $match: { ...query, 'feedback.patientRating': { $exists: true } } },
      {
        $group: {
          _id: groupBy,
          avgRating: { $avg: '$feedback.patientRating' },
          ratingCount: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
  }

  async getSpecialtyDemandTrends(query, days) {
    return await Appointment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$specialty',
          demand: { $sum: 1 },
          avgWaitTime: { $avg: '$analytics.waitTime' },
          completionRate: { $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      },
      { $sort: { demand: -1 } }
    ]);
  }

  async generateDailyOperationsReport(district, dateRange) {
    // Implementation for daily operations report
    const query = this.buildDistrictQuery(district, 'patientInfo.location.district');
    query.createdAt = { $gte: dateRange.start, $lte: dateRange.end };

    return {
      appointments: await this.getAppointmentStats(query),
      doctors: await this.getDoctorStats(this.buildDistrictQuery(district, 'location.district')),
      performance: await this.getPerformanceStats(query)
    };
  }

  async generateWeeklySummaryReport(district, dateRange) {
    // Implementation for weekly summary report
    return this.generateDailyOperationsReport(district, dateRange);
  }

  async generateMonthlyAnalyticsReport(district, dateRange) {
    // Implementation for monthly analytics report
    return this.generateDailyOperationsReport(district, dateRange);
  }

  async generatePerformanceReviewReport(district, dateRange) {
    // Implementation for performance review report
    return this.generateDailyOperationsReport(district, dateRange);
  }
}

module.exports = new DashboardController();
