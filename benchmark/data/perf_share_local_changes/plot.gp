set terminal png
set term png size 500, 500
set termoption dash

set xlabel "Percentage of nodes changed"
set ylabel "Time (ms)"
set xtic auto
set ytic auto

set output "plots/perf_share_local_changes_10nodes.png"
plot \
  "data/perf_share_local_changes/nodes10_changes1.dat" using 5:2:3 title '1 change to each node' with errorlines, \
  "data/perf_share_local_changes/nodes10_changes6.dat" using 5:2:3 title '6 changes to each node' with errorlines

set output "plots/perf_share_local_changes_50nodes.png"
plot \
  "data/perf_share_local_changes/nodes50_changes1.dat" using 5:2:3 title '1 change to each node' with errorlines, \
  "data/perf_share_local_changes/nodes50_changes6.dat" using 5:2:3 title '6 changes to each node' with errorlines

set output "plots/perf_share_local_changes_100nodes.png"
plot \
  "data/perf_share_local_changes/nodes100_changes1.dat" using 5:2:3 title '1 change to each node' with errorlines, \
  "data/perf_share_local_changes/nodes100_changes6.dat" using 5:2:3 title '6 changes to each node' with errorlines

set output "plots/perf_share_local_changes_500nodes.png"
plot \
  "data/perf_share_local_changes/nodes500_changes1.dat" using 5:2:3 title '1 change to each node' with errorlines, \
  "data/perf_share_local_changes/nodes500_changes6.dat" using 5:2:3 title '6 changes to each node' with errorlines

set output "plots/perf_share_local_changes_1000nodes.png"
plot \
  "data/perf_share_local_changes/nodes1000_changes1.dat" using 5:2:3 title '1 change to each node' with errorlines, \
  "data/perf_share_local_changes/nodes1000_changes6.dat" using 5:2:3 title '6 changes to each node' with errorlines


set term png size 1000, 450
set output "plots/perf_share_local_changes_vary_nodes.png"
set xlabel "Number of nodes"
set yrange [0:]
plot \
  "data/perf_share_local_changes/changes1.dat" using 1:2:3 title '1 change to each node' with errorlines, \
  "data/perf_share_local_changes/changes6.dat" using 1:2:3 title '6 changes to each node' with errorlines

