import { Request, Response } from 'express';
import Segment from '../models/Segment';
import Customer from '../models/Customer';
import { generateSegmentQuery } from '../services/aiService';

export const buildMongoQueryFromFilters = (rules: any[]) => {
  if (!rules || rules.length === 0) return {};
  
  const query: any = {};
  
  rules.forEach(rule => {
    const { field, operator, value } = rule;
    if (!field || !operator) return;

    let mongoOperator = '';
    switch (operator) {
      case 'greaterThan': mongoOperator = '$gt'; break;
      case 'lessThan': mongoOperator = '$lt'; break;
      case 'equals': mongoOperator = '$eq'; break;
      case 'contains': 
        query[field] = { $regex: value, $options: 'i' }; 
        return;
    }

    if (field === 'lastPurchaseDays') {
      const date = new Date();
      date.setDate(date.getDate() - Number(value));
      // if greater than 45 days, date must be LESS than (older than) 45 days ago
      query['lastOrderDate'] = { [operator === 'greaterThan' ? '$lt' : '$gt']: date };
      return;
    }

    if (mongoOperator) {
      if (!query[field]) query[field] = {};
      query[field][mongoOperator] = isNaN(Number(value)) ? value : Number(value);
    }
  });

  return query;
};

export const createSegment = async (req: Request, res: Response) => {
  try {
    const { name, description, rules, aiInterpretation, recommendations } = req.body;
    
    if (!rules || !Array.isArray(rules)) {
      res.status(400).json({ error: 'Valid rules array is required' });
      return;
    }

    const segment = await Segment.create({
      name,
      description,
      rules,
      aiInterpretation,
      recommendations
    });

    res.status(201).json(segment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSegments = async (req: Request, res: Response) => {
  try {
    const segments = await Segment.find().sort({ createdAt: -1 });
    res.json(segments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const previewSegment = async (req: Request, res: Response) => {
  try {
    const { prompt, manualRules } = req.body;
    
    let aiResponse: any = null;
    let rulesToUse = [];

    if (prompt) {
      aiResponse = await generateSegmentQuery(prompt);
      rulesToUse = aiResponse.rules || [];
    } else if (manualRules) {
      rulesToUse = manualRules;
    } else {
      res.status(400).json({ error: 'Provide prompt or manualRules' });
      return;
    }

    const criteria = buildMongoQueryFromFilters(rulesToUse);
    const customers = await Customer.find(criteria).limit(50); // increased limit for better preview
    const count = await Customer.countDocuments(criteria);

    // Calculate Insights
    const totalSpend = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgSpend = customers.length ? (totalSpend / customers.length) : 0;

    res.json({ 
      customers, 
      totalMatches: count, 
      rules: rulesToUse,
      aiInterpretation: aiResponse?.interpretation,
      recommendations: aiResponse?.recommendations,
      insights: {
        audienceSize: count,
        avgSpend,
        potentialRevenue: count * avgSpend
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
