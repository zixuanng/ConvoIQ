import React, { useEffect, useRef, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as d3 from 'd3';

interface MomentumChartProps {
  data: { date: string; score: number }[];
  disableAnimations?: boolean;
}

export const MomentumChart: React.FC<MomentumChartProps> = ({ data, disableAnimations = false }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No momentum data available</div>;
  }

  return (
    <div style={{ width: '100%', height: 256, minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
            minTickGap={30}
          />
          <YAxis 
            hide 
            domain={[0, 100]} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#2dd4bf' }}
            cursor={{ stroke: '#0d9488', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area 
            type="monotone" 
            dataKey="score" 
            stroke="#0d9488" 
            fillOpacity={1} 
            fill="url(#colorScore)" 
            strokeWidth={3}
            animationDuration={1500}
            isAnimationActive={!disableAnimations}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface EmotionalSpectrumProps {
  emotions: { label: string; count: number; color: string }[];
  disableAnimations?: boolean;
}

export const EmotionalSpectrum: React.FC<EmotionalSpectrumProps> = ({ emotions, disableAnimations = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resizing
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Only update if dimensions actually changed to avoid infinite loops
        // and ensure we have a valid width > 0
        if (width > 0 && height > 0) {
           setDimensions({ width, height });
        }
      }
    };

    // Initial sizing
    updateDimensions();

    // Use ResizeObserver for robust detection
    const resizeObserver = new ResizeObserver(() => {
       // Wrap in requestAnimationFrame to avoid "ResizeObserver loop limit exceeded"
       requestAnimationFrame(() => updateDimensions());
    });
    
    resizeObserver.observe(containerRef.current);

    // Also listen to window resize as fallback
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Draw chart when dimensions or data change
  useEffect(() => {
    if (!containerRef.current || !svgRef.current || emotions.length === 0 || dimensions.width === 0) return;

    // Clear previous
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width } = dimensions;
    const height = 300; // Fixed height logic to match the container styling
    
    // Prepare data structure for pack layout
    const root = d3.hierarchy({ children: emotions })
      .sum((d: any) => d.count ? d.count : 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Create pack layout
    const pack = d3.pack()
      .size([width, height])
      .padding(15); // Padding between circles

    const nodes = pack(root).leaves();

    // -- Visual Effects --
    const defs = svg.append("defs");

    // Glow Filter
    const filter = defs.append("filter")
      .attr("id", "glow-effect")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
      
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
      
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const g = svg.append("g");

    // Create Node Groups
    const node = g.selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    // Draw Circles
    const circles = node.append("circle")
      .attr("fill", (d: any) => d.data.color)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("fill-opacity", 0.9)
      .style("filter", "url(#glow-effect)")
      .style("cursor", "pointer");

    if (disableAnimations) {
      circles.attr("r", d => d.r);
    } else {
      circles.attr("r", 0)
        .transition().duration(1000).ease(d3.easeElasticOut)
        .attr("r", d => d.r);
    }

    // Add Text Labels
    const labels = node.append("text")
      .attr("dy", "0.3em")
      .attr("text-anchor", "middle")
      .text((d: any) => d.data.label)
      .attr("fill", "white")
      .attr("font-weight", "700")
      .attr("font-family", "system-ui, -apple-system, sans-serif")
      .style("pointer-events", "none")
      .style("text-shadow", "0 2px 4px rgba(0,0,0,0.4)")
      .style("font-size", d => {
        const size = d.r / 3;
        return `${Math.max(10, Math.min(size, 16))}px`;
      });

    if (disableAnimations) {
       labels.style("opacity", d => d.r > 20 ? 1 : 0);
    } else {
       labels.style("opacity", 0)
         .transition().delay(500).duration(500)
         .style("opacity", d => d.r > 20 ? 1 : 0);
    }

    // Hover Interaction
    node.on("mouseenter", function() {
      d3.select(this).select("circle")
        .transition().duration(200)
        .attr("transform", "scale(1.1)")
        .attr("stroke-width", 4);
    }).on("mouseleave", function() {
      d3.select(this).select("circle")
        .transition().duration(200)
        .attr("transform", "scale(1)")
        .attr("stroke-width", 2);
    });

  }, [emotions, dimensions, disableAnimations]);

  return (
    <div ref={containerRef} className="w-full h-[300px] flex items-center justify-center overflow-hidden">
      <svg 
        ref={svgRef} 
        width="100%" 
        height="100%" 
        style={{ overflow: 'visible', width: '100%', height: '100%' }} 
      />
    </div>
  );
};