Statistic tools

TODO:
- Likelihood for conditional probability 
- Relationship/ Correlation

Tools:
- Frequent values. series.value_counts().sort_index()
- Series.describe()
- Series.clean()
- Histogram. If it is not normal than we can assume that we have some data that is not that we are looking
- Distribution, with and without normalisation
- Distribution Normalisation = counts -> fraction
- In general, I use CDFs when I am exploring data. That way, I get the best view of what’s going on without getting distracted by noise. Then, if I am presenting results to an audience unfamiliar with CDFs, I might use a PMF if the dataset contains a small number of unique values, or KDE if there are many unique values
- Variables relationship. Scatter plot. Jittering if data is cleaned or converted before(inches to cm example) 
