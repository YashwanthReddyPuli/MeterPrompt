const Plan = require('../models/Plan');

/**
 * @route   POST /api/plans
 * @desc    Admin creates a new subscription plan
 * @access  Private (Admin)
 */
const createPlan = async (req, res, next) => {
  try {
    const { name, description, priceUSD, priceINR, billingCycle, featureLimits } = req.body;

    const existingPlan = await Plan.findOne({ name });
    if (existingPlan) {
      return res.status(409).json({
        success: false,
        message: `Plan with name '${name}' already exists.`,
        errorCode: 'DUPLICATE_RESOURCE_ERROR'
      });
    }

    const plan = await Plan.create({
      name,
      description,
      priceUSD,
      priceINR,
      billingCycle: billingCycle || 'monthly',
      featureLimits
    });

    return res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully.',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/plans
 * @desc    Get all active subscription plans (Public/Authenticated)
 * @access  Public / Authenticated
 */
const getPlans = async (req, res, next) => {
  try {
    const query = req.user && req.user.role === 'admin' ? {} : { isActive: true };
    let plans = await Plan.find(query).sort({ priceUSD: 1 });

    const standardPlans = [
      {
        name: 'Starter',
        description: 'For small apps & AI prototyping',
        priceUSD: 19.99,
        priceINR: 1499,
        billingCycle: 'monthly',
        isActive: true,
        featureLimits: {
          maxRequestsPerMinute: 60,
          maxTokensPerMonth: 100000,
          allowedModels: ['gpt-4o', 'gpt-4o-mini'],
          overageRatePer1kTokensUSD: 0.002
        }
      },
      {
        name: 'Pro',
        description: 'High-throughput Gateway for growing SaaS platforms',
        priceUSD: 49.99,
        priceINR: 3799,
        billingCycle: 'monthly',
        isActive: true,
        featureLimits: {
          maxRequestsPerMinute: 300,
          maxTokensPerMonth: 500000,
          allowedModels: ['gpt-4o', 'claude-3-5-sonnet', 'gpt-4o-mini'],
          overageRatePer1kTokensUSD: 0.0015
        }
      },
      {
        name: 'Max',
        description: 'Dedicated rate limits & high-volume token quotas',
        priceUSD: 199.99,
        priceINR: 14999,
        billingCycle: 'monthly',
        isActive: true,
        featureLimits: {
          maxRequestsPerMinute: 1200,
          maxTokensPerMonth: 2500000,
          allowedModels: ['gpt-4o', 'claude-3-5-sonnet', 'deepseek-r1'],
          overageRatePer1kTokensUSD: 0.001
        }
      }
    ];

    if (plans.length < 3) {
      for (const sp of standardPlans) {
        const exists = plans.some(p => p.name.toLowerCase().includes(sp.name.toLowerCase()));
        if (!exists) {
          const created = await Plan.create(sp);
          plans.push(created);
        }
      }
      plans.sort((a, b) => a.priceUSD - b.priceUSD);
    }

    return res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/plans/:id
 * @desc    Get plan by ID
 * @access  Public / Authenticated
 */
const getPlanById = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found.',
        errorCode: 'NOT_FOUND_ERROR'
      });
    }

    return res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/plans/:id
 * @desc    Admin updates an existing plan
 * @access  Private (Admin)
 */
const updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found.',
        errorCode: 'NOT_FOUND_ERROR'
      });
    }

    const { name, description, priceUSD, priceINR, billingCycle, featureLimits, isActive } = req.body;

    if (name) plan.name = name;
    if (description !== undefined) plan.description = description;
    if (priceUSD !== undefined) plan.priceUSD = priceUSD;
    if (priceINR !== undefined) plan.priceINR = priceINR;
    if (billingCycle) plan.billingCycle = billingCycle;
    if (isActive !== undefined) plan.isActive = isActive;
    if (featureLimits) {
      plan.featureLimits = { ...plan.featureLimits, ...featureLimits };
    }

    const updatedPlan = await plan.save();

    return res.status(200).json({
      success: true,
      message: 'Plan updated successfully.',
      data: updatedPlan
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/plans/:id
 * @desc    Admin deletes or deactivates a plan
 * @access  Private (Admin)
 */
const deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found.',
        errorCode: 'NOT_FOUND_ERROR'
      });
    }

    // Deactivate instead of hard delete to preserve historical billing references
    plan.isActive = false;
    await plan.save();

    return res.status(200).json({
      success: true,
      message: 'Plan deactivated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan
};
