set terminal png
set term png size 500, 500
set termoption dash

set xlabel "Nodes modified"
set ylabel "Latency of modificaiton"
set xtic auto
set ytic auto

set output "plots/latency_10nodes.png"
plot "data/latency/handmade_10nodes.dat" using 4:1:2 title '10 node scene' with errorlines

set output "plots/latency_100nodes.png"
plot "data/latency/handmade_100nodes.dat" using 4:1:2 title '100 node scene' with errorlines