set terminal png
set term png size 1000, 450
set termoption dash

set xlabel "Operations"
set ylabel "Time (ms)"
set xtic auto
set ytic auto
set yrange [0:]
set key left top

set output "plots/perf_apply_remote_changes_nodes10.png"
plot \
  "data/perf_apply_remote_changes/deletechild_nodes10.dat" using 6:2:3 title 'Delete child' with errorlines, \
  "data/perf_apply_remote_changes/deleteobject_nodes10.dat" using 6:2:3 title 'Delete object' with errorlines, \
  "data/perf_apply_remote_changes/insertchild_nodes10.dat" using 6:2:3 title 'Insert child' with errorlines, \
  "data/perf_apply_remote_changes/insertobject_nodes10.dat" using 6:2:3 title 'Insert object' with errorlines, \
  "data/perf_apply_remote_changes/updateprop_nodes10.dat" using 6:2:3 title 'Update property' with errorlines

set output "plots/perf_apply_remote_changes_nodes50.png"
plot \
  "data/perf_apply_remote_changes/deletechild_nodes50.dat" using 6:2:3 title 'Delete child' with errorlines, \
  "data/perf_apply_remote_changes/deleteobject_nodes50.dat" using 6:2:3 title 'Delete object' with errorlines, \
  "data/perf_apply_remote_changes/insertchild_nodes50.dat" using 6:2:3 title 'Insert child' with errorlines, \
  "data/perf_apply_remote_changes/insertobject_nodes50.dat" using 6:2:3 title 'Insert object' with errorlines, \
  "data/perf_apply_remote_changes/updateprop_nodes50.dat" using 6:2:3 title 'Update property' with errorlines

set output "plots/perf_apply_remote_changes_nodes100.png"
plot \
  "data/perf_apply_remote_changes/deletechild_nodes100.dat" using 6:2:3 title 'Delete child' with errorlines, \
  "data/perf_apply_remote_changes/deleteobject_nodes100.dat" using 6:2:3 title 'Delete object' with errorlines, \
  "data/perf_apply_remote_changes/insertchild_nodes100.dat" using 6:2:3 title 'Insert child' with errorlines, \
  "data/perf_apply_remote_changes/insertobject_nodes100.dat" using 6:2:3 title 'Insert object' with errorlines, \
  "data/perf_apply_remote_changes/updateprop_nodes100.dat" using 6:2:3 title 'Update property' with errorlines

set output "plots/perf_apply_remote_changes_nodes500.png"
plot \
  "data/perf_apply_remote_changes/deletechild_nodes500.dat" using 6:2:3 title 'Delete child' with errorlines, \
  "data/perf_apply_remote_changes/deleteobject_nodes500.dat" using 6:2:3 title 'Delete object' with errorlines, \
  "data/perf_apply_remote_changes/insertchild_nodes500.dat" using 6:2:3 title 'Insert child' with errorlines, \
  "data/perf_apply_remote_changes/insertobject_nodes500.dat" using 6:2:3 title 'Insert object' with errorlines, \
  "data/perf_apply_remote_changes/updateprop_nodes500.dat" using 6:2:3 title 'Update property' with errorlines

set output "plots/perf_apply_remote_changes_nodes1000.png"
plot \
  "data/perf_apply_remote_changes/deletechild_nodes1000.dat" using 6:2:3 title 'Delete child' with errorlines, \
  "data/perf_apply_remote_changes/deleteobject_nodes1000.dat" using 6:2:3 title 'Delete object' with errorlines, \
  "data/perf_apply_remote_changes/insertchild_nodes1000.dat" using 6:2:3 title 'Insert child' with errorlines, \
  "data/perf_apply_remote_changes/insertobject_nodes1000.dat" using 6:2:3 title 'Insert object' with errorlines, \
  "data/perf_apply_remote_changes/updateprop_nodes1000.dat" using 6:2:3 title 'Update property' with errorlines

set output "plots/perf_apply_remote_changes_vary_nodes.png"
plot \
  "data/perf_apply_remote_changes/updateprop_nodes10.dat" using 6:2:3 title '10 nodes' with errorlines, \
  "data/perf_apply_remote_changes/updateprop_nodes100.dat" using 6:2:3 title '100 nodes' with errorlines, \
  "data/perf_apply_remote_changes/updateprop_nodes1000.dat" using 6:2:3 title '1000 nodes' with errorlines
