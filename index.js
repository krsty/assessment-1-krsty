/* Sources:
Base: https://bl.ocks.org/mbostock/3885304
D3-tip: http://bl.ocks.org/Caged/6476579
Animation: https://bl.ocks.org/RandomEtc/cff3610e7dd47bef2d01 */

var margin = {
		top: 150,
		right: 20,
		bottom: 60,
		left: 100
	},
    
	width = 2000 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal() // ordinal scale specifies an explicit mapping from a set of data values to a corresponding set of visual attributes 
	.rangeRoundBands([0, width], .1); // rangeRoundBand: spaces are guaranteed to be integers, avoiding antialiasing on screen 

var y = d3.scale.linear() // scale linear is used for continuous quantitative data 
	.range([height, 0]); //range is the visual space of a scale 

// D3 Axis - renders a d3 scale in SVG
var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left")
	.ticks(11);


// D3-tip adds tooltips to a d3 bar chart
var tip = d3.tip()
	.attr('class', 'd3-tip')
	.offset([-10, 0])
	.html(function(d) {
		return d.language + " - " +
			d.speakers;
	})



// Append - create a new element into an existing element
// "g" - group
var svg = d3.select("body").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Call event handler for tooltips
svg.call(tip);

svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")

svg.append("g")
	.attr("class", "y axis")
	.append("text")
	.attr("transform", "rotate(-90)") // rotate the text!
	.attr("y", 6)
	.attr("dy", ".71em")
	.style("text-anchor", "end")

// d3.tsv is a wrapper around XMLHTTPRequest, returns array of arrays (?) for a TSV file

d3.tsv("data.tsv", type, function(error, data) {
	replay(data);
});

// type function transforms strings to numbers, dates, etc.
function type(d) {
	// + coerces to a Number from a String (or anything)
	d.speakers = +d.speakers;
	return d; // (d) is one item from the data array
}
// Slices - returns the selected elements in an array, as a new array object
// Functie: als i kleiner is dan data.length, i++,
function replay(data) {
	var slices = [];
	for (var i = 0; i < data.length; i++) {
		slices.push(data.slice(0, i + 1));
	}
    
	slices.forEach(function(slice, index) {
		setTimeout(function() {
			draw(slice);
		}, index * 300);
	});
}



function draw(data) {
	// measure the domain (for x, unique letters) (for y [0,maxFrequency])
	
	x.domain(data.map(function(d) { // Domain is the space of data */
		return d.language;
	}));
	y.domain([0, d3.max(data, function(d) {
		return d.speakers;
	})]);
    // now the scales are finished and usable
    

	// another g element, this time to move the origin to the bottom of the svg element
	// the end result is g populated with text and lines
	svg.select('.x.axis').transition().duration(300).call(xAxis);

	// same for yAxis 
	svg.select(".y.axis").transition().duration(300).call(yAxis)

    // THE BARS
	var bars = svg.selectAll(".bar").data(data, function(d) {
			return d.language;
		}) 

	bars.exit()
		.transition()
		.duration(300)
		.attr("y", y(0))
		.attr("height", height - y(0))
		.style('fill-opacity', 1e-6)
		.remove();

	// data that needs DOM = enter()
	bars.enter().append("rect")
		.attr("class", "bar")
		.attr("y", y(0))
		.attr("height", height - y(0))
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide);

	// the "UPDATE" set:
	bars.transition().duration(300).attr("x", function(d) {
			return x(d.language);
		}) // (d) is one item from the data array, x is the scale object from above
		.attr("width", x.rangeBand()) // constant, so no callback function(d) here
		.attr("y", function(d) {
			return y(d.speakers);
		})
		.attr("height", function(d) {
			return height - y(d.speakers);
		}); // flip the height, because y's domain is bottom up, but SVG renders top down

}

//Function for d3-tip
function type(d) {
	d.frequency = +d.frequency;
	return d;
}