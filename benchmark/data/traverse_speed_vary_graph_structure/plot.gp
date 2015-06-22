set terminal png
set term png size 1000, 450
set termoption dash

# set title "Traversal speed"
set xlabel "Nodes in scene"
set ylabel "Time (ms)"
set xtic auto
set ytic auto

set output "plots/traverse_speed_vary_graph_structure.png"
plot \
  "data/traverse_speed_vary_graph_structure/flat.dat" using 1:2:3 title 'flat' with errorlines, \
  "data/traverse_speed_vary_graph_structure/snake.dat" using 1:2:3 title 'snake' with errorlines, \
  "data/traverse_speed_vary_graph_structure/binary.dat" using 1:2:3 title 'binary' with errorlines, \
  "data/traverse_speed_vary_graph_structure/4ary.dat" using 1:2:3 title '4ary' with errorlines

set output "plots/traverse_speed_vary_graph_structure_cut300.png"
set xrange [0:300]
plot \
  "data/traverse_speed_vary_graph_structure/flat.dat" using 1:2:3 title 'flat' with errorlines, \
  "data/traverse_speed_vary_graph_structure/snake.dat" using 1:2:3 title 'snake' with errorlines, \
  "data/traverse_speed_vary_graph_structure/binary.dat" using 1:2:3 title 'binary' with errorlines, \
  "data/traverse_speed_vary_graph_structure/4ary.dat" using 1:2:3 title '4ary' with errorlines
