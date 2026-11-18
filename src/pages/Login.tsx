import * as d3 from "d3";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export default function Login({ onGuestLogin }: { onGuestLogin: () => void }) {
  const d3Container = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!d3Container.current) return;

    const svg = d3.select(d3Container.current);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;


    const numPoints = isMobile ? 25 : 50; 
    const points = d3.range(0, numPoints).map((i) => ({ x: i, y: 0 }));
    
    const x = d3.scaleLinear().domain([0, numPoints - 1]).range([0, width]);
    
    const amplitude = isMobile ? height * 0.15 : height * 0.12;
    const y = d3.scaleLinear().domain([-1, 1]).range([height / 2 - amplitude, height / 2 + amplitude]);

    const line = d3.line<any>()
      .x((d) => x(d.x))
      .y((d) => y(Math.sin(d.y)))
      .curve(d3.curveBasis);

    svg.selectAll("*").remove();
    const dnaGroup = svg.append("g");

    const filter = svg.append("defs").append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const strand1 = dnaGroup.append("path")
      .datum(points)
      .attr("fill", "none")
      .attr("stroke", "#ff1e42") 
      .attr("stroke-width", isMobile ? 3 : 2)
      .attr("filter", "url(#glow)")
      .attr("opacity", 0.6);

    const strand2 = dnaGroup.append("path")
      .datum(points)
      .attr("fill", "none")
      .attr("stroke", "#00d4ff") 
      .attr("stroke-width", isMobile ? 3 : 2)
      .attr("filter", "url(#glow)")
      .attr("opacity", 0.4);

    const rungsGroup = dnaGroup.append("g");

    let t = 0;
    const timer = d3.timer(() => {

      t += isMobile ? 0.025 : 0.015; 
      
      points.forEach((p, i) => {

        p.y = t + i / (isMobile ? 2.5 : 4); 
      });

      strand1.attr("d", line(points));
      strand2.attr("d", line(points.map(p => ({ ...p, y: p.y + Math.PI }))));

      const rungs = rungsGroup.selectAll("line").data(points);
      
      rungs.enter()
        .append("line")
        .merge(rungs as any)
        .attr("x1", d => x(d.x))
        .attr("y1", d => y(Math.sin(d.y)))
        .attr("x2", d => x(d.x))
        .attr("y2", d => y(Math.sin(d.y + Math.PI)))
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("opacity", 0.15);
        
      rungs.exit().remove();
    });

    return () => timer.stop();
  }, []);


  return (
    <div className="relative h-screen w-full flex items-center justify-center bg-pin-charcoal overflow-hidden font-sans">
      <svg ref={d3Container} className="absolute inset-0 w-full h-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-[90%] max-w-sm p-8 md:p-12 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3rem] border border-white/10 shadow-2xl text-center"
      >
        <p className="text-gray-300 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-12">
          Genomic Intelligence
        </p>

        <div className="space-y-4">
          <button
            onClick={onGuestLogin}
            className="w-full bg-white text-pin-charcoal py-4 rounded-2xl font-bold hover:bg-gray-100 shadow-xl shadow-black/20 transition-all cursor-pointer"
          >
            <span className="text-sm">Continue as Guest</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}