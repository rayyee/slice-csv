# slice-csv

🌘 Simple to slice csv file   

### Why
If your have a large size csv file, and you want to open it by some editor, like Excel,   
it may be throw some errors, and cannot open the csv file,   
then you can slice the csv file.

### Warning

Only support MacOS or Linux platform,    
Use `cat foo.csv | wc -l` to count rows.

### Install

`yarn global add slice-csv`

### How to

`slice-csv /tmp/foo.csv -s 0.2 -e GBK`
