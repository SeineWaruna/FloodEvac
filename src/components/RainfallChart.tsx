import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface RainfallData {
  date: string;
  rainfall: number;
}

export default function RainfallChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<RainfallData[]>([]);

  useEffect(() => {
    fetch('/api/rainfall-history')
      .then((res) => res.json())
      .then(setData);
  }, []);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.parentElement?.clientWidth || 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const x = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, (d3.max(data, d => d.rainfall) || 0) + 20])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.attr('width', width).attr('height', height);

    // Grid lines
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y)
        .tickSize(-width + margin.left + margin.right)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('stroke-opacity', 0.1);

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickValues(x.domain().filter((_, i) => i % 5 === 0)))
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#64748b');

    // Y Axis
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}mm`))
      .selectAll('text')
      .style('font-size', '10px')
      .style('fill', '#64748b');

    // Bars
    svg.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.date) || 0)
      .attr('y', d => y(d.rainfall))
      .attr('width', x.bandwidth())
      .attr('height', d => height - margin.bottom - y(d.rainfall))
      .attr('fill', d => d.rainfall > 60 ? '#3b82f6' : '#94a3b8')
      .attr('rx', 4);

    // Add interactivity
    const tooltip = d3.select('body').append('div')
      .attr('class', 'absolute hidden bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none')
      .style('z-index', '100');

    svg.selectAll('.bar')
      .on('mouseover', (event, d: any) => {
        d3.select(event.currentTarget as any).attr('fill', '#2563eb');
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`${d.date}: <strong>${d.rainfall}mm</strong>`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
          .classed('hidden', false);
      })
      .on('mouseout', (event, d: any) => {
        d3.select(event.currentTarget as any).attr('fill', d.rainfall > 60 ? '#3b82f6' : '#94a3b8');
        tooltip.classed('hidden', true);
      });

  }, [data]);

  return (
    <div className="w-full overflow-hidden">
      <svg ref={svgRef} className="max-w-full overflow-visible" />
    </div>
  );
}
