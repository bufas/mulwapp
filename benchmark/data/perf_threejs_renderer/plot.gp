set terminal png
set term png size 1000, 450
set termoption dash

# set title "Traversal speed"
set xlabel "Nodes in scene"
set ylabel "Time (ms)"
set xtic auto
set ytic auto
# set yrange[0:25]

set output "plots/threejs_rendering_speed.png"
plot \
  "data/perf_threejs_renderer/threejs_rendering.dat" using 1:2:3 title 'Rendering' with errorlines

set output "plots/threejs_vs_mulwapp_speed.png"
set ylabel "% better than performance requirement"
set zeroaxis
plot \
  "data/perf_threejs_renderer/handmade_mulwapp_local_ops_20pct.dat" using 1:((((0.5*$2)-$4)/(0.5*$2))*100) title 'Mulwapp 20% nodes 3 changes' with linespoints, \
  "data/perf_threejs_renderer/handmade_mulwapp_local_ops_100pct.dat" using 1:((((0.5*$2)-$4)/(0.5*$2))*100) title 'Mulwapp all nodes 3 changes' with linespoints, \
  "data/perf_threejs_renderer/handmade_mulwapp_local_ops_3.dat" using 1:((((0.5*$2)-$4)/(0.5*$2))*100) title 'Mulwapp 3 nodes 3 changes' with linespoints

set output "plots/threejs_vs_mulwapp_speed_cut300.png"
set xrange [0:300]
plot \
  "data/perf_threejs_renderer/handmade_mulwapp_local_ops_20pct.dat" using 1:((((0.5*$2)-$4)/(0.5*$2))*100) title 'Mulwapp 20% nodes 3 changes' with linespoints, \
  "data/perf_threejs_renderer/handmade_mulwapp_local_ops_100pct.dat" using 1:((((0.5*$2)-$4)/(0.5*$2))*100) title 'Mulwapp all nodes 3 changes' with linespoints, \
  "data/perf_threejs_renderer/handmade_mulwapp_local_ops_3.dat" using 1:((((0.5*$2)-$4)/(0.5*$2))*100) title 'Mulwapp 3 nodes 3 changes' with linespoints
