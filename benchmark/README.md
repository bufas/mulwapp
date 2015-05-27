Benchmarking
============

Making a new benchmark
-----------------------
Create a .js file in the benchmarks directory. The file must add a button to the
``.benchmark-buttons''-div that when clicked calls the main benchmark function
with the name of the benchmark and a reference to the benchmark function (which
should take no parameters).

Create a directory in the data dirctory with the name of the benchmark. The 
folder must contain a gnuplot file called ``plot.txt'' that will be called by
the makeplots program to generate png files.

Update the makeplots program to include the ``plot.txt'' you just created.

Plotting data
-------------
Run the makeplots program, and watch the magic happen. Plots will be placed in 
the plots folder.