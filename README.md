# Data Challenge 22X

This repo contains my submission for the DALI data challenge 22X! I put a lot more effort in compared to last time, particularly in attempting to code my visualizations from scratch using D3. Hope you enjoy!

<br />

## Part 1: Visualizations

Please view the visualizations deployed [here](!https://genuine-flan-85a02b.netlify.app/).

### Part 1 Additional Notes

The visualizations are broken down into individual components:
- [bar.js](./src/components/bar.js)
- [line_graph.js](./src/components/line_graph.js)
- [map.js](./src/components/map.js)

Data is held in each component's state and is imported via CSV. These CSVs were built with the help of [this notebook](./src/notebooks/superstore_functions.ipynb) (`src/notebooks/superstore_functions.ipynb`), and each CSV was downloaded to the `src/notebooks` folder. Data cleaning and analysis for the visualizations were also done in the `superstore_functions` notebook.

A couple things I didn't get around to but want to add when I have some more time:
- Axis labels
- Tooltip for the line graph
- Transition for the line graph

I spent a lot of time working with D3 to complete these visualizations, and feel very confident in my ability to add these features. Just ran out of time.

<br />

## Part 2: Sales Prediction Model

Please view the machine learning jupyter notebook [here](./src/notebooks/superstore_ml.ipynb) (`src/notebooks/superstore_ml.ipynb`)

I first performed some EDA using basic pandas functions. I wanted to separate the data from individual identities, so I dropped identity-linked columns (such as name) amongst others. After I completed the EDA, I used sklearn to implement several different regression models in an effort to predict sales based on a variety of features. The most successful model was ...



<br />

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.



