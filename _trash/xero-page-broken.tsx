"use client";

import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface Centre {
  id: string;
  name: string;
  code: string;
}

interface BudgetData {
  category: string;
  monthlyBudget: number;
  actualSpend: number;
  variance: number;
  monthlyData: {
    [month: string]: number;
  };
}

interface BudgetCategory {
  id: string;
  name: string;
  description?: string;
}

interface CentreBudget {
  id: string;
  centreId: string;
  categoryId: string;
  monthlyBudget: number;
  xeroAccountCode?: string;
  centre: Centre;
  category: BudgetCategory;
}

// Sample data - this will come from API in final version
const sampleCentres: Centre[] = [
  { id: '1', name: 'Papamoa Beach', code: 'PB1' },
  { id: '2', name: 'The Boulevard', code: 'TB1' },
  { id: '3', name: 'Livingstone Drive', code: 'LIV' },
];

const sampleBudgetData: { [centreId: string]: BudgetData[] } = {
  '1': [ // Papamoa Beach
    {
      category: 'Art and Messy Play',
      monthlyBudget: 300,
      actualSpend: 228,
      variance: 72,
      monthlyData: { 'JAN': 18, 'FEB': 20, 'MAR': 19, 'APR': 21, 'MAY': 20, 'JUN': 19, 'JUL': 18, 'AUG': 20, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
    {
      category: 'Centre Purchases',
      monthlyBudget: 500,
      actualSpend: 460,
      variance: 40,
      monthlyData: { 'JAN': 35, 'FEB': 40, 'MAR': 38, 'APR': 42, 'MAY': 39, 'JUN': 37, 'JUL': 36, 'AUG': 41, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
  ],
  '2': [
    {
      category: 'Art and Messy Play',
      monthlyBudget: 250,
      actualSpend: 200,
      variance: 50,
      monthlyData: { 'JAN': 15, 'FEB': 18, 'MAR': 17, 'APR': 19, 'MAY': 18, 'JUN': 17, 'JUL': 16, 'AUG': 18, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
    {
      category: 'Centre Purchases',
      monthlyBudget: 400,
      actualSpend: 350,
      variance: 50,
      monthlyData: { 'JAN': 28, 'FEB': 32, 'MAR': 30, 'APR': 34, 'MAY': 31, 'JUN': 29, 'JUL': 28, 'AUG': 33, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
  ],
  '3': [
    {
      category: 'Art and Messy Play',
      monthlyBudget: 200,
      actualSpend: 150,
      variance: 50,
      monthlyData: { 'JAN': 12, 'FEB': 14, 'MAR': 13, 'APR': 15, 'MAY': 14, 'JUN': 13, 'JUL': 12, 'AUG': 14, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
    {
      category: 'Centre Purchases',
      monthlyBudget: 350,
      actualSpend: 300,
      variance: 50,
      monthlyData: { 'JAN': 22, 'FEB': 26, 'MAR': 24, 'APR': 28, 'MAY': 25, 'JUN': 23, 'JUL': 22, 'AUG': 27, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
  ],
};

// ...rest of the file unchanged, see original for full code...
