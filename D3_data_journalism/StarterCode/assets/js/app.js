// set SVG dimension
var svgHeight=600;
var svgWidth=1000;

// set margins
var margin={
    top:80,
    right:80,
    bottom:80,
    left:80
};

// set chart dimension
var chartHeight=svgHeight-margin.top-margin.bottom;
var chartWidth=svgWidth-margin.left-margin.right;

// create svg container
var svg=d3.select("#scatter")
.append("svg")
.attr("height",svgHeight)
.attr("width",svgWidth);

// set chart group with margin
var chartGroup=svg.append("g")
.attr("transform",`translate(${margin.left},${margin.top})`)

// Initial Params
var chosenXAxis="poverty";
var chosenYAxis="healthcare";

// function to update x-scale var upon click on axis label
function xScale(censusData,chosenXAxis) {
    // create scales
    var xLinearScale=d3.scaleLinear()
        .domain([d3.min(censusData,d=>d[chosenXAxis])*0.95,
            d3.max(censusData,d=>d[chosenXAxis])*1.05])
        .range([0,chartWidth]);
    return xLinearScale;
}

// function to update y-scale var upon click on axis label
function yScale(censusData,chosenYAxis) {
    // create scales
    var yLinearScale=d3.scaleLinear()
        .domain([d3.min(censusData,d=>d[chosenYAxis])*0.8,
            d3.max(censusData,d=>d[chosenYAxis])*1.1])
        .range([chartHeight,0]);
    return yLinearScale;
}

// function to update and render xAxis upon click on axis label
function renderXAxes(newXScale,xAxis) {
    var bottomAxis=d3.axisBottom(newXScale);
    xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  
    return xAxis;
}

// function to update and render yAxis var upon click on axis label
function renderYAxes(newYScale,yAxis) {
    var leftAxis=d3.axisLeft(newYScale);
    yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  
    return yAxis;
}
    
// function used for updating circles group
function renderCircles(circlesGroup,newXScale,chosenXAxis,newYScale,chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx",d=>newXScale(d[chosenXAxis]))
        .attr("cy",d=>newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// function used for updating circles text
function renderCirclesText(circlesText,newXScale,chosenXAxis,newYScale,chosenYAxis) {
    circlesText.transition()
        .duration(1000)
        .attr("x",d=>newXScale(d[chosenXAxis]))
        .attr("y",d=>newYScale(d[chosenYAxis]));

    return circlesText;
}

// function used for updating tooltip
function updateToolTip(chosenXAxis,chosenYAxis,circlesText) {
    var labelX;
    if (chosenXAxis==="poverty") {
        labelX="Poverty:";
    }
    else if (chosenXAxis==="age") {
        labelX="Age:";
    }
    else {
        labelX="Income:";
    }
    var labelY;
    if (chosenYAxis==="healthcare") {
        labelY="Healthcare:";
    }
    else if (chosenYAxis==="smokes") {
        labelY="Smokes:";
    }
    else {
        labelY="Obese:";
    }
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            if (labelX==("Age:"||"Income:")) {
                return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}%`);
            }
            else {
                return (`${d.state}<br>${labelX} ${d[chosenXAxis]}%<br>${labelY} ${d[chosenYAxis]}%`);
            }
        });
  
    circlesText.call(toolTip);
    
    // onmouseover event
    circlesText.on("mouseover", function(d) {
        var stateId=d.id;
        d3.selectAll("circle")
            .filter(function(d) {return d.id==stateId;})
            .style("stroke","grey");
        toolTip.show(d);
        })
    // onmouseout event
    .on("mouseout", function(d) {
        var stateId=d.id;
        d3.selectAll("circle")
            .filter(function(d) {return d.id==stateId;})
            .style("stroke","#e3e3e3");
        toolTip.hide(d);
    });
  
    return circlesText;
}

// read data
d3.csv("./assets/data/data.csv").then(function(censusData) {
    censusData.forEach(function(data) {
        data.poverty=+data.poverty;
        data.age=+data.age;
        data.income=+data.income;
        data.obesity=+data.obesity;
        data.smokes=+data.smokes;
        data.healthcare=+data.healthcare;
    })

    // xLinearScale
    var xLinearScale=xScale(censusData,chosenXAxis);

    // yLinearScale
    var yLinearScale=yScale(censusData,chosenYAxis);

    // create chart axes
    var bottomAxis=d3.axisBottom(xLinearScale);
    var leftAxis=d3.axisLeft(yLinearScale);

    // insert chart axes
    var yAxis=chartGroup.append("g")
    .call(leftAxis)

    var xAxis=chartGroup.append("g")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

    // create scatter points (ie. circles)
    var circlesGroup=chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .classed("stateCircle",true)
    .attr("cx",d=>xLinearScale(d[chosenXAxis]))
    .attr("cy",d =>yLinearScale(d[chosenYAxis]))
    .attr("r",8);

    // insert text inside scatter points
    var circlesText=chartGroup.append("g")
    .selectAll("text")
    .data(censusData)
    .enter()
    .append("text")
    .attr("x",d=>xLinearScale(d[chosenXAxis]))
    .attr("y",d=>yLinearScale(d[chosenYAxis])+3)
    .classed("stateText",true)
    .attr("font-size","8px")
    .text(d=>`${d.abbr}`);
        
    // insert x-axis label
    var labelsXGroup=chartGroup.append("g")
    .attr("transform",`translate(${chartWidth/2},${chartHeight+20})`)
        
    var povertyLabel=labelsXGroup.append("text")
    .attr("x",0)
    .attr("y",20)
    .attr("value","poverty")
    .classed("active",true)
    .text("In Poverty (%)");

    var ageLabel=labelsXGroup.append("text")
    .attr("x",0)
    .attr("y",40)
    .attr("value","age")
    .classed("inactive",true)
    .text("Age (Median)");

    var incomeLabel=labelsXGroup.append("text")
    .attr("x",0)
    .attr("y",60)
    .attr("value","income")
    .classed("inactive",true)
    .text("Household Income (Median)");

    // insert y-axis label
    var labelsYGroup=chartGroup.append("g")
    .attr("transform","rotate(-90)")
        
    var obesityLabel=labelsYGroup.append("text")
    .attr("x",0-(chartHeight/2))
    .attr("y",-30)
    .attr("value","obesity")
    .classed("inactive",true)
    .text("Obese (%)");

    var smokeLabel=labelsYGroup.append("text")
    .attr("x",0-(chartHeight/2))
    .attr("y",-50)
    .attr("value","smokes")
    .classed("inactive",true)
    .text("Smokes (%)");

    var healthLabel=labelsYGroup.append("text")
    .attr("x",0-(chartHeight/2))
    .attr("y",-70)
    .attr("value","healthcare")
    .classed("active",true)
    .text("Lacks Healthcare (%)");
    
    // updateToolTip
    var circlesText=updateToolTip(chosenXAxis,chosenYAxis,circlesText);

    // x axis labels event listener
    labelsXGroup.selectAll("text")
        .on("click",function() {
        // get value of selection
        var value=d3.select(this).attr("value");
        if (value!==chosenXAxis) {
            chosenXAxis=value;
            // updates x scale for new data
            xLinearScale=xScale(censusData,chosenXAxis);
            // updates x axis with transition
            xAxis=renderXAxes(xLinearScale,xAxis);
            // updates circles with new x values
            circlesGroup=renderCircles(circlesGroup,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis);
            circlesText=renderCirclesText(circlesText,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis);
            // updates tooltips with new info
            circlesText=updateToolTip(chosenXAxis,chosenYAxis,circlesText);
            // changes classes to change bold text
            if (chosenXAxis==="poverty") {
                povertyLabel
                    .classed("active",true)
                    .classed("inactive",false);
                ageLabel
                    .classed("active",false)
                    .classed("inactive",true);
                incomeLabel
                    .classed("active",false)
                    .classed("inactive",true);
            }
            else if (chosenXAxis==="age") {
                povertyLabel
                    .classed("active",false)
                    .classed("inactive",true);
                ageLabel
                    .classed("active",true)
                    .classed("inactive",false);
                incomeLabel
                    .classed("active",false)
                    .classed("inactive",true);
            }
            else {
                povertyLabel
                    .classed("active",false)
                    .classed("inactive",true);
                ageLabel
                    .classed("active",false)
                    .classed("inactive",true);
                incomeLabel
                    .classed("active",true)
                    .classed("inactive",false);
            }
        }
        })
        // y axis labels event listener
        labelsYGroup.selectAll("text")
            .on("click",function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value!==chosenYAxis) {
                chosenYAxis=value;
                // updates y scale for new data
                yLinearScale=yScale(censusData,chosenYAxis);
                // updates y axis with transition
                yAxis=renderYAxes(yLinearScale,yAxis);
                // updates circles with new y values
                circlesGroup=renderCircles(circlesGroup,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis);
                circlesText=renderCirclesText(circlesText,xLinearScale,chosenXAxis,yLinearScale,chosenYAxis);
                // updates tooltips with new info
                circlesText=updateToolTip(chosenXAxis,chosenYAxis,circlesText);
            // changes classes to change bold text
            if (chosenYAxis==="obesity") {
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "smokes") {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
        })
    }).catch(function(error) {
    console.log(error);
})