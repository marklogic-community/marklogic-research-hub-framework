Often, a Research Hub project contains raw data or other files. Particluarly for an initial or 
demonstration system, the data to be loaded is included in this data directory, with sub-directories 
for each data type (e.g. each entity).

Avoid checking very large data sets into github, however. For large data sets, consider a gradle task
that ftp or copies a known file from a remote location.

See the pharma-research example for details.