/**
 * Lightweight Chart Components
 * Custom SVG-based charts without external dependencies
 */
import { useMemo } from 'react';

/**
 * Line Chart Component
 */
export const LineChart = ({ data, width = 600, height = 300, color = '#A35E47' }) => {
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const { points, maxValue, minValue, xLabels } = useMemo(() => {
    if (!data || data.length === 0) return { points: '', maxValue: 0, minValue: 0, xLabels: [] };

    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((d.value - min) / range) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    const xLabels = data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1)) * chartWidth,
      label: d.label
    }));

    return { points, maxValue: max, minValue: min, xLabels };
  }, [data, chartWidth, chartHeight, padding.left, padding.top]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Grid lines */}
      <g stroke="#e5e7eb" strokeWidth="1" opacity="0.3">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + chartHeight * (1 - ratio);
          return (
            <line
              key={i}
              x1={padding.left}
              y1={y}
              x2={padding.left + chartWidth}
              y2={y}
            />
          );
        })}
      </g>

      {/* Area fill */}
      <path
        d={`M ${padding.left},${padding.top + chartHeight} L ${points} L ${padding.left + chartWidth},${padding.top + chartHeight} Z`}
        fill={color}
        fillOpacity="0.1"
      />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {data.map((d, i) => {
        const x = padding.left + (i / (data.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - ((d.value - minValue) / (maxValue - minValue || 1)) * chartHeight;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="4" fill={color} stroke="white" strokeWidth="2" />
          </g>
        );
      })}

      {/* Y-axis labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const value = minValue + (maxValue - minValue) * ratio;
        const y = padding.top + chartHeight * (1 - ratio);
        return (
          <text
            key={i}
            x={padding.left - 10}
            y={y}
            textAnchor="end"
            alignmentBaseline="middle"
            className="text-xs fill-gray-600 dark:fill-gray-400"
          >
            {value.toFixed(0)}
          </text>
        );
      })}

      {/* X-axis labels */}
      {xLabels.map((item, i) => {
        if (i % Math.ceil(xLabels.length / 6) === 0 || i === xLabels.length - 1) {
          return (
            <text
              key={i}
              x={item.x}
              y={padding.top + chartHeight + 25}
              textAnchor="middle"
              className="text-xs fill-gray-600 dark:fill-gray-400"
            >
              {item.label}
            </text>
          );
        }
        return null;
      })}
    </svg>
  );
};

/**
 * Bar Chart Component
 */
export const BarChart = ({ data, width = 600, height = 300, color = '#A35E47' }) => {
  const padding = { top: 20, right: 20, bottom: 60, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = chartWidth / data.length * 0.8;
  const barSpacing = chartWidth / data.length * 0.2;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Grid lines */}
      <g stroke="#e5e7eb" strokeWidth="1" opacity="0.3">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + chartHeight * (1 - ratio);
          return (
            <line
              key={i}
              x1={padding.left}
              y1={y}
              x2={padding.left + chartWidth}
              y2={y}
            />
          );
        })}
      </g>

      {/* Bars */}
      {data.map((d, i) => {
        const barHeight = (d.value / maxValue) * chartHeight;
        const x = padding.left + i * (chartWidth / data.length) + barSpacing / 2;
        const y = padding.top + chartHeight - barHeight;

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              opacity="0.8"
              rx="4"
              className="hover:opacity-100 transition-opacity cursor-pointer"
            />
            <text
              x={x + barWidth / 2}
              y={y - 8}
              textAnchor="middle"
              className="text-xs font-bold fill-gray-700 dark:fill-gray-300"
            >
              {d.value}
            </text>
          </g>
        );
      })}

      {/* Y-axis labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const value = maxValue * ratio;
        const y = padding.top + chartHeight * (1 - ratio);
        return (
          <text
            key={i}
            x={padding.left - 10}
            y={y}
            textAnchor="end"
            alignmentBaseline="middle"
            className="text-xs fill-gray-600 dark:fill-gray-400"
          >
            {value.toFixed(0)}
          </text>
        );
      })}

      {/* X-axis labels */}
      {data.map((d, i) => {
        const x = padding.left + i * (chartWidth / data.length) + chartWidth / data.length / 2;
        return (
          <text
            key={i}
            x={x}
            y={padding.top + chartHeight + 20}
            textAnchor="middle"
            className="text-xs fill-gray-600 dark:fill-gray-400"
            transform={`rotate(-45, ${x}, ${padding.top + chartHeight + 20})`}
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
};

/**
 * Donut Chart Component
 */
export const DonutChart = ({ data, width = 300, height = 300, colors = ['#A35E47', '#898989', '#4b6e48', '#b2ac88'] }) => {
  const radius = Math.min(width, height) / 2 - 40;
  const innerRadius = radius * 0.6;
  const centerX = width / 2;
  const centerY = height / 2;

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = -90;

  const slices = data.map((d, i) => {
    const percentage = (d.value / total) * 100;
    const angle = (d.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const ix1 = centerX + innerRadius * Math.cos(startRad);
    const iy1 = centerY + innerRadius * Math.sin(startRad);
    const ix2 = centerX + innerRadius * Math.cos(endRad);
    const iy2 = centerY + innerRadius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${ix2} ${iy2}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}
      Z
    `;

    const labelAngle = startAngle + angle / 2;
    const labelRad = (labelAngle * Math.PI) / 180;
    const labelRadius = radius + 30;
    const labelX = centerX + labelRadius * Math.cos(labelRad);
    const labelY = centerY + labelRadius * Math.sin(labelRad);

    return { path, percentage, color: colors[i % colors.length], label: d.label, labelX, labelY };
  });

  return (
    <svg width={width} height={height}>
      {/* Slices */}
      {slices.map((slice, i) => (
        <path
          key={i}
          d={slice.path}
          fill={slice.color}
          opacity="0.8"
          className="hover:opacity-100 transition-opacity cursor-pointer"
        />
      ))}

      {/* Labels */}
      {slices.map((slice, i) => (
        <g key={i}>
          <text
            x={slice.labelX}
            y={slice.labelY}
            textAnchor="middle"
            className="text-xs font-bold fill-gray-700 dark:fill-gray-300"
          >
            {slice.percentage.toFixed(1)}%
          </text>
          <text
            x={slice.labelX}
            y={slice.labelY + 14}
            textAnchor="middle"
            className="text-xs fill-gray-600 dark:fill-gray-400"
          >
            {slice.label}
          </text>
        </g>
      ))}

      {/* Center circle */}
      <circle
        cx={centerX}
        cy={centerY}
        r={innerRadius}
        fill="var(--bg-main)"
        className="dark:fill-gray-900"
      />

      {/* Center text */}
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        alignmentBaseline="middle"
        className="text-2xl font-bold fill-gray-700 dark:fill-gray-300"
      >
        {total}
      </text>
      <text
        x={centerX}
        y={centerY + 20}
        textAnchor="middle"
        className="text-xs fill-gray-500"
      >
        Total
      </text>
    </svg>
  );
};
