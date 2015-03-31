var RTT = pathgl.texture(null, {
    format: 'UNSIGNED_BYTE'
}).repeat()

// // d3.timer(function () {
// //   disco.filter(function (d, i) { return Math.random() > .99  }).transition()
// //   .attr('fill', function () { return 'hsl(' + Math.random() * 360 + ',100%, 50%)' })
// // })

var shit = d3.select(RTT)
.selectAll("circle")
.data(d3.range(100), function (d) { return d })
.enter().append("circle")
.attr('r', 50)
.attr('cx', function (d) { return 100 * (d % 10) })
.attr('cy', function (d) { return 100 * ~~(d / 10) })
.attr('fill', function () { return 'hsl(' + Math.random() * 360 + ',100%, 50%)' }, RTT)

// var disco = d3.select('canvas')
// .selectAll('circle')
// .data(d3.range(1000))
// .enter()
// .append('rect')
// .attr('width', 20)
// .attr('height', 20)
// .attr('x', function (d) { return 20 * (d % 30) })
// .attr('y', function (d) { return 20 * ~~(d / 40) })
// .attr('fill', RTT)


var disco = d3.select('canvas')
.selectAll('circle')
.data(d3.range(1000))
.enter()
.append('rect')
.attr('width', 20)
.attr('height', 20)
.attr('x', function (d) { return 20 * (d % 30) })
.attr('y', function (d) { return 20 * ~~(d / 40) })
.attr('fill', RTT)
