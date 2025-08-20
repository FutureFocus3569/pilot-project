"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

export function DateRangePicker() {
  const [selectedRange, setSelectedRange] = useState("last-30-days");

  const ranges = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last-7-days", label: "Last 7 days" },
    { value: "last-30-days", label: "Last 30 days" },
    { value: "this-month", label: "This month" },
    { value: "last-month", label: "Last month" },
    { value: "custom", label: "Custom range" },
  ];

  return (
    <div className="relative">
      <select
        value={selectedRange}
        onChange={(e) => setSelectedRange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-md pl-10 pr-8 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {ranges.map((range) => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </select>
      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
