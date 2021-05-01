function canvas() {

    var svg = d3.select("body").append("svg")
        .attr("width", 960)
        .attr("height", 600);

    var tickDuration = 2000;

    var top = 10;
    var height = 600;
    var width = 920;

    const margin = {
        top: 80,
        right: 1,
        bottom: 5,
        left: 1
    };

    var barPadding = (height - (margin.bottom + margin.top)) / (top * 5);

    var title = svg.append('text')
        .attr('class', 'title')
        .attr('y', 30)
        .html('Nintendo Sales Per Year');

    var year = 2001;

    d3.csv("https://raw.githubusercontent.com/AlannahTanner/sales_csv/main/data/Sales.csv").then(function (data) {

        // console.log(data);

        data.forEach(e => {
            e.value = +e.value,
            e.value = isNaN(e.value) ? 0 : e.value,
            e.year = +e.year,
            e.colour = d3.hsl(Math.random() * 360, 0.25, 0.75)
        });

        console.log(data);

        var yearSlice = data.filter(e => e.year == year && !isNaN(e.value))
            .sort((a, b) => b.value - a.value)
            .slice(0, top);

        yearSlice.forEach((e, i) => e.position = i);

        console.log('yearSlice: ', yearSlice)

        var x = d3.scaleLinear()
            .domain([0, d3.max(yearSlice, e => e.value)])
            .range([margin.left, width - margin.right - 65]);

        var y = d3.scaleLinear()
            .domain([top, 0])
            .range([height - margin.bottom, margin.top]);

        var xAxis = d3.axisTop() // Shows the numbers above the graph and the lines
            .scale(x)
            .ticks(width > 500 ? 5 : 2)
            .tickSize(-(height - margin.top - margin.bottom))
            .tickFormat(e => d3.format(',')(e));
            
        svg.append('g') // Shows the numbers above the graph and the lines
            .attr('class', 'axis xAxis')
            .attr('transform', `translate(0, ${margin.top})`)
            .call(xAxis)
            .selectAll('.tick line')
            .classed('origin', e => e == 0);

        svg.selectAll('rect.bar') // Shows the coloured bars
            .data(yearSlice, e => e.name)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', x(0) + 1)
            .attr('width', e => x(e.value))
            .attr('y', e => y(e.position) + 5)
            .attr('height', y(1) - y(0) - barPadding)
            .style('fill', e => e.colour);

        svg.selectAll('text.label') // Shows console name
            .data(yearSlice, e => e.name)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', e => x(e.value) - 8)
            .attr('y', e => y(e.position) + 5 + ((y(1) - y(0)) / 2) + 1)
            .style('text-anchor', 'end')
            .html(e => e.name);

        svg.selectAll('text.valueLabel') //Shows value (Units sold)
            .data(yearSlice, e => e.name)
            .enter()
            .append('text')
            .attr('class', 'valueLabel')
            .attr('x', e => x(e.value) + 5)
            .attr('y', e => y(e.position) + 5 + ((y(1) - y(0)) / 2) + 1)
            .text(e => d3.format(',.0f')(e.value));

        var yearText = svg.append('text') // Shows what year
            .attr('class', 'yearText')
            .attr('x', width - margin.right)
            .attr('y', height - 25)
            .style('text-anchor', 'end')
            .html(~~year)
            .call(halo, 10);

        var ticker = d3.interval(e => {

            yearSlice = data.filter(e => e.year == year && !isNaN(e.value))
                .sort((a, b) => b.value - a.value)
                .slice(0, top);

            yearSlice.forEach((e, i) => e.position = i);

            x.domain([0, d3.max(yearSlice, e => e.value)]);

            svg.select('.xAxis') // Deals with numbers above the graph and lines
                .transition()
                .duration(tickDuration)
                .ease(d3.easeLinear)
                .call(xAxis);

            var bars = svg.selectAll('.bar').data(yearSlice, e => e.name);

            bars // Deals with the consoles bars
                .transition()
                .duration(tickDuration)
                .ease(d3.easeLinear)
                .attr('width', e => x(e.value))
                .attr('y', e => y(e.position) + 5);

            var labels = svg.selectAll('.label')
                .data(yearSlice, e => e.name);

            labels // Deals with the console names connected to the bar
                .transition()
                .duration(tickDuration)
                .ease(d3.easeLinear)
                .attr('x', e => x(e.value) - 8)
                .attr('y', e => y(e.position) + 5 + ((y(1) - y(0)) / 2) + 1);


            var valueLabels = svg.selectAll('.valueLabel').data(yearSlice, e => e.name);

            valueLabels // Deals with the sales number changing and showing up
                .transition()
                .duration(tickDuration)
                .ease(d3.easeLinear)
                .attr('x', e => x(e.value) + 5)
                .attr('y', e => y(e.position) + 5 + ((y(1) - y(0)) / 2) + 1)
                .tween("text", function (e) {
                    var i = d3.interpolateRound(0, e.value);
                    return function (t) {
                        this.textContent = d3.format(',')(i(t));
                    };
                });

            yearText.html(~~year); // double tilda shows the year as a whole number rather then as a float

            if (year == 2020) ticker.stop();
            year = d3.format('.1f')((+year) + 1);
        }, tickDuration);

    });

    const halo = function (text, strokeWidth) { // Styling for the year text
        text.select(function () { return this.parentNode.insertBefore(this.cloneNode(true), this); })
            .style('fill', '#ffffff')
            .style('stroke', '#ffffff')
            .style('stroke-width', strokeWidth)
            .style('stroke-linejoin', 'round')
            .style('opacity', 1);

    }
}