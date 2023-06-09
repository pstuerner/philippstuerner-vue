// Taken from https://bl.ocks.org/mbostock/85d7dce6fca6277f75fe
import * as d3 from 'd3';
import * as voronoi from 'd3-voronoi';
import * as color from 'd3-color';

/**
 * @name createVoronoi
 * @description Main function that runs the d3 visualization.
 */
function createVoronoi() {
    var width = d3.select("header").node().getBoundingClientRect().width,
        height = d3.select("header").node().getBoundingClientRect().height;
    
    var canvas = d3
            .select("#canvas-voronoi")
            .attr("width", width)
            .attr("height", height)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .classed("svg-content", true),
        context = canvas.node().getContext("2d"),
        voro = voronoi.voronoi().extent([
            [0.5, 0.5],
            [width - 0.5, height - 0.5],
        ]);
    
    var rainbow1 = d3.interpolateCubehelixLong(
            color.cubehelix(-100, 0.75, 0.35),
            color.cubehelix(80, 1.5, 0.8)
        ),
        rainbow2 = d3.interpolateCubehelixLong(
            color.cubehelix(80, 1.5, 0.8),
            color.cubehelix(260, 0.75, 0.35)
        );

    var n = Math.ceil(width * 0.03),
        particles = new Array(n),
        radius = 20;

    for (var i = 0; i < n; ++i)
        particles[i] = {
            0: Math.random() * width,
            1: Math.random() * height,
            vx: 0,
            vy: 0,
        };

    d3.timer(function (elapsed) {
        for (var i = 0; i < n; ++i) {
            var p = particles[i];
            p[0] += p.vx;
            if (p[0] < 0) p[0] = p.vx *= -1;
            else if (p[0] > width) p[0] = width + (p.vx *= -1);
            p[1] += p.vy;
            if (p[1] < 0) p[1] = p.vy *= -1;
            else if (p[1] > height) p[1] = height + (p.vy *= -1);
            p.vx += 0.1 * (Math.random() - 0.5) - 0.01 * p.vx;
            p.vy += 0.1 * (Math.random() - 0.5) - 0.01 * p.vy;
        }

        var cells = voro(particles);
        context.beginPath();
        cells.cells.forEach(function (cell) {
            drawRoundedPolygon(cell, radius);
        });
        context.globalAlpha = 0.2;
        context.lineWidth = 4;
        context.strokeStyle = "#000";
        context.stroke();

        context.beginPath();
        cells.cells.forEach(function (cell) {
            drawRoundedPolygon(cell, radius);
        });
        context.globalAlpha = 1;
        var t = (elapsed / 5000) % 2;
        context.strokeStyle = t > 1 ? rainbow2(t - 1) : rainbow1(t);
        context.lineWidth = 1.5;
        context.stroke();
    });

    function drawPoint(point) {
        context.moveTo(point[0] + 1.5, point[1]);
        context.arc(point[0], point[1], 1.5, 0, 2 * Math.PI);
    }

    function drawPolygon(points) {
        context.moveTo(points[0][0], points[0][1]);
        for (var i = 1, n = points.length; i < n; ++i)
            context.lineTo(points[i][0], points[i][1]);
        context.closePath();
    }

    function drawRoundedPolygon(points, r) {
        var i,
            n = points.length,
            p0,
            p1,
            p2,
            p3,
            n1 = 0,
            t012,
            t123,
            x21,
            y21,
            x4,
            y4,
            x5,
            y5,
            moved,
            circle = polygonIncircle(points);

        // Build a linked list from the array of vertices so we can splice.
        for (i = 0, p1 = points[n - 2], p2 = points[n - 1]; i < n; ++i) {
            (p0 = p1), (p1 = p2), (p2 = points[i]);
            p1.previous = p0;
            p1.next = p2;
        }

        // The rounding radius can’t be bigger than the polygon’s incircle.
        // The fudge factor of 1px lets the rounded polygon get squished a bit.
        // TODO Abort the search for the incircle if one is found larger than r.
        r = Math.min(r, circle.radius - 1);
        if (r <= 0) return;

        // TODO do we need to make all these extra passes?
        for (i = 0, p3 = p2.next; n1 <= n; ++n1) {
            (p0 = p1), (p1 = p2), (p2 = p3), (p3 = p3.next);
            t012 = cornerTangent(p0[0], p0[1], p1[0], p1[1], p2[0], p2[1], r);
            t123 =
                1 - cornerTangent(p3[0], p3[1], p2[0], p2[1], p1[0], p1[1], r);

            // If the following corner’s tangent is before this corner’s tangent,
            // replace p1 and p2 with the intersection of the lines 01 and 23.
            if (t012 >= t123) {
                p2 =
                    p0.next =
                    p3.previous =
                        lineLineIntersection(
                            p0[0],
                            p0[1],
                            p1[0],
                            p1[1],
                            p2[0],
                            p2[1],
                            p3[0],
                            p3[1]
                        );
                p2.previous = p0;
                p2.next = p3;
                p3 = p2;
                p2 = p3.previous;
                p1 = p2.previous;
                p0 = p1.previous;
                n1 = 0;
                if (--n < 3) break;
            }
        }

        // If we removed too many points, just draw the previously computed incircle.
        if (n < 3) {
            context.moveTo(circle[0] + circle.radius, circle[1]);
            context.arc(circle[0], circle[1], circle.radius, 0, 2 * Math.PI);
            return;
        }

        // Draw the rounded polygon, compting the corner tangents.
        for (i = 0; i <= n; ++i) {
            (p0 = p1), (p1 = p2), (p2 = p3), (p3 = p3.next);
            t012 = cornerTangent(p0[0], p0[1], p1[0], p1[1], p2[0], p2[1], r);
            t123 =
                1 - cornerTangent(p3[0], p3[1], p2[0], p2[1], p1[0], p1[1], r);
            (x21 = p2[0] - p1[0]), (y21 = p2[1] - p1[1]);
            (x4 = p1[0] + t012 * x21), (y4 = p1[1] + t012 * y21);
            (x5 = p1[0] + t123 * x21), (y5 = p1[1] + t123 * y21);
            if (moved) context.arcTo(p1[0], p1[1], x4, y4, r);
            else (moved = true), context.moveTo(x4, y4);
            context.lineTo(x5, y5);
        }
    }

    // Given a circle of radius r that is tangent to the line segments 01 and 12,
    // returns the parameter t of the tangent along the line segment 12.
    function cornerTangent(x0, y0, x1, y1, x2, y2, r) {
        var theta = innerAngle(x0, y0, x1, y1, x2, y2),
            x21 = x2 - x1,
            y21 = y2 - y1,
            l21 = Math.sqrt(x21 * x21 + y21 * y21),
            l14 = r / Math.tan(theta / 2);
        return l14 / l21;
    }

    // A horrible brute-force algorithm for determining the largest circle that can
    // fit inside a convex polygon. For each distinct set of three sides of the
    // polygon, compute the tangent circle. Then reduce the circle’s radius against
    // the remaining sides of the polygon.
    function polygonIncircle(points) {
        var circle = { radius: 0 };

        for (var i = 0, n = points.length; i < n; ++i) {
            var pi0 = points[i],
                pi1 = points[(i + 1) % n];
            for (var j = i + 1; j < n; ++j) {
                var pj0 = points[j],
                    pj1 = points[(j + 1) % n],
                    pij =
                        j === i + 1
                            ? pj0
                            : lineLineIntersection(
                                  pi0[0],
                                  pi0[1],
                                  pi1[0],
                                  pi1[1],
                                  pj0[0],
                                  pj0[1],
                                  pj1[0],
                                  pj1[1]
                              );
                search: for (var k = j + 1; k < n; ++k) {
                    var pk0 = points[k],
                        pk1 = points[(k + 1) % n],
                        pik = lineLineIntersection(
                            pi0[0],
                            pi0[1],
                            pi1[0],
                            pi1[1],
                            pk0[0],
                            pk0[1],
                            pk1[0],
                            pk1[1]
                        ),
                        pjk =
                            k === j + 1
                                ? pk0
                                : lineLineIntersection(
                                      pj0[0],
                                      pj0[1],
                                      pj1[0],
                                      pj1[1],
                                      pk0[0],
                                      pk0[1],
                                      pk1[0],
                                      pk1[1]
                                  ),
                        candidate = triangleIncircle(
                            pij[0],
                            pij[1],
                            pik[0],
                            pik[1],
                            pjk[0],
                            pjk[1]
                        ),
                        radius = candidate.radius;

                    for (var l = 0; l < n; ++l) {
                        var pl0 = points[l],
                            pl1 = points[(l + 1) % n],
                            r = pointLineDistance(
                                candidate[0],
                                candidate[1],
                                pl0[0],
                                pl0[1],
                                pl1[0],
                                pl1[1]
                            );
                        if (r < circle.radius) continue search;
                        if (r < radius) radius = r;
                    }

                    circle = candidate;
                    circle.radius = radius;
                }
            }
        }

        return circle;
    }

    // Returns the angle between segments 01 and 12.
    function innerAngle(x0, y0, x1, y1, x2, y2) {
        var x01 = x0 - x1,
            y01 = y0 - y1,
            x12 = x1 - x2,
            y12 = y1 - y2,
            x02 = x0 - x2,
            y02 = y0 - y2,
            l01_2 = x01 * x01 + y01 * y01,
            l12_2 = x12 * x12 + y12 * y12,
            l02_2 = x02 * x02 + y02 * y02;
        return Math.acos(
            (l12_2 + l01_2 - l02_2) / (2 * Math.sqrt(l12_2 * l01_2))
        );
    }

    // Returns the intersection of the infinite lines 01 and 23.
    function lineLineIntersection(x0, y0, x1, y1, x2, y2, x3, y3) {
        var x02 = x0 - x2,
            y02 = y0 - y2,
            x10 = x1 - x0,
            y10 = y1 - y0,
            x32 = x3 - x2,
            y32 = y3 - y2,
            t = (x32 * y02 - y32 * x02) / (y32 * x10 - x32 * y10);
        return [x0 + t * x10, y0 + t * y10];
    }

    // Returns the signed distance from point 0 to the infinite line 12.
    function pointLineDistance(x0, y0, x1, y1, x2, y2) {
        var x21 = x2 - x1,
            y21 = y2 - y1;
        return (
            (y21 * x0 - x21 * y0 + x2 * y1 - y2 * x1) /
            Math.sqrt(y21 * y21 + x21 * x21)
        );
    }

    // Returns the largest circle inside the triangle 012.
    function triangleIncircle(x0, y0, x1, y1, x2, y2) {
        var x01 = x0 - x1,
            y01 = y0 - y1,
            x02 = x0 - x2,
            y02 = y0 - y2,
            x12 = x1 - x2,
            y12 = y1 - y2,
            l01 = Math.sqrt(x01 * x01 + y01 * y01),
            l02 = Math.sqrt(x02 * x02 + y02 * y02),
            l12 = Math.sqrt(x12 * x12 + y12 * y12),
            k0 = l01 / (l01 + l02),
            k1 = l12 / (l12 + l01),
            center = lineLineIntersection(
                x0,
                y0,
                x1 - k0 * x12,
                y1 - k0 * y12,
                x1,
                y1,
                x2 + k1 * x02,
                y2 + k1 * y02
            );
        center.radius =
            Math.sqrt(
                ((l02 + l12 - l01) * (l12 + l01 - l02) * (l01 + l02 - l12)) /
                    (l01 + l02 + l12)
            ) / 2;
        return center;
    }
}

export { createVoronoi };
// createVoronoi();
