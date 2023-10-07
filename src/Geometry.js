class Geometry {
  constructor() {}
  //check if point is in between 2 other points
  #isInLine(line, point) {
    return (
      point.lon <= Math.max(line.p1.lon, line.p2.lon) &&
      point.lon >= Math.min(line.p1.lon, line.p2.lon) &&
      point.lat <= Math.max(line.p1.lat, line.p2.lat) &&
      point.lat >= Math.min(line.p1.lat, line.p2.lat)
    )
  }
  #direction(p1, p2, p3) {
    let val =
      (p2.lat - p1.lat) * (p3.lon - p2.lon) -
      (p2.lon - p1.lon) * (p3.lat - p2.lat)
    if (val == 0) {
      // Collinear
      return 0
    } else if (val < 0) {
      // Anti-clockwise direction
      return 2
    }
    // Clockwise direction
    else return 1
  }
  #getIntersectPoint(l1, l2) {
    //make line equation y=mx+b
    let m1 = (l1.p1.lat - l1.p2.lat) / (l1.p1.lon - l1.p2.lon)
    let m2 = (l2.p1.lat - l2.p2.lat) / (l2.p1.lon - l2.p2.lon)
    let b1 = l1.p1.lat - m1 * l1.p1.lon
    let b2 = l2.p1.lat - m2 * l2.p1.lon
    console.log(m1, m2, b1, b2)
    let x = (b1 - b2) / (m2 - m1)
    let y = m1 * x + b1
    return {
      lat: y,
      lon: x,
    }
  }
  #isIntersect(l1, l2) {
    let dir1 = this.#direction(l1.p1, l1.p2, l2.p1)
    let dir2 = this.#direction(l1.p1, l1.p2, l2.p2)
    let dir3 = this.#direction(l2.p1, l2.p2, l1.p1)
    let dir4 = this.#direction(l2.p1, l2.p2, l1.p2)
    //if interecting
    if (dir1 !== dir2 && dir3 !== dir4) {
      return true
    }
    // When p2 of line2 are on the line1
    if (dir1 == 0 && this.#isInLine(l1, l2.p1)) {
      return true
    }
    // When p1 of line2 are on the line1
    if (dir2 == 0 && this.#isInLine(l1, l2.p2)) {
      return true
    }
    // When p2 of line1 are on the line2
    if (dir3 == 0 && this.#isInLine(l2, l1.p1)) {
      return true
    }
    // When p1 of line1 are on the line2
    if (dir4 == 0 && this.#isInLine(l2, l1.p2)) {
      return true
    }
    return false
  }
  isValidPoly(poly) {
    let n = poly.length
    // When polygon has less than 3 edge, it is not polygon
    if (n < 3) {
      return false
    }
    const sides = []
    let i = 0
    do {
      // Forming a line from two consecutive points of poly
      let i2 = (i + 1) % n
      let lat1 = poly[i].lat
      let lng1 = poly[i].lng
      let lat2 = poly[i2].lat
      let lng2 = poly[i2].lng
      let point1 = new Point(lng1, lat1)
      let point2 = new Point(lng2, lat2)
      let side = new Line(point1, point2)
      console.log(`Create side with (${lng1},${lat1}) and (${lng2},${lat2})`)
      sides.push(side)
      i = i2
    } while (i != 0)
    let m = sides.length
    for (i = 0; i < m; i++) {
      for (let j = 0; j < m; j++) {
        //successive lines can have intersect point
        if (i + 1 == j || i == j || i - 1 == j) {
          continue
        }
        if (this.#isIntersect(sides[i], sides[j])) {
          const intersectPoint = this.#getIntersectPoint(sides[i], sides[j])
          if (this.#isInLine(sides[i], intersectPoint)) {
            return false
          }
        }
      }
    }
    return true
  }
  /**
   * return all indexes of points that is inside the polygone
   * @returns indexes of points
   */
  getPointsInsidePoly(poly, points = []) {
    //check if polygone is valid
    if (!this.isValidPoly(poly)) {
      return []
    }
    let result = []
    let n = poly.length
    points.forEach((p, index) => {
      let inLine = false
      // Create a point at infinity, lat is same as point p
      let tmp = new Point(p.lon, 9999)
      let curP = new Point(p.lon, p.lat)
      let exline = new Line(curP, tmp)
      let count = 0
      let i = 0
      do {
        // Forming a line from two consecutive points of poly
        let i2 = (i + 1) % n
        let lat1 = poly[i].lat
        let lng1 = poly[i].lng
        let lat2 = poly[i2].lat
        let lng2 = poly[i2].lng
        let point1 = new Point(lng1, lat1)
        let point2 = new Point(lng2, lat2)
        let side = new Line(point1, point2)
        if (this.#isIntersect(side, exline)) {
          // If side is intersects exline
          if (
            this.#direction(side.p1, p, side.p2) == 0 &&
            this.#isInLine(side, p)
          ) {
            inLine = true
            break
          }
          // if count is odd, point is inside the polygone
          count++
        }
        i = i2
      } while (i != 0)
      if (count % 2 !== 0 || inLine) result.push(index)
    })
    return result
  }
}
class Point {
  //int lon, lat;
  constructor(lon, lat) {
    this.lon = lon
    this.lat = lat
  }
}

class Line {
  //Point p1, p2;
  constructor(p1, p2) {
    this.p1 = p1
    this.p2 = p2
  }
}

const poly = [
  {
    lng: 1,
    lat: 1,
  },
  {
    lng: 5,
    lat: 7,
  },
  {
    lng: 2,
    lat: 10,
  },
  {
    lng: 1,
    lat: 7,
  },
]

const points = [
  {
    lon: 1.6,
    lat: 2.14,
  },
  {
    lon: 4.94,
    lat: 6.71,
  },
  {
    lon: 6,
    lat: 9.5,
  },
  {
    lon: 0.35,
    lat: 7.04,
  },
  {
    lon: 5,
    lat: 1,
  },
  {
    lon: 2.5,
    lat: -0.04,
  },
]

const geo = new Geometry()
// const result = geo.getPointsInsidePoly(poly,points);
// result.forEach(val=>console.log(points[val]));
// let point1 = new Point(1,4);
// let point2 = new Point(8,9);
// let point3 = new Point(5,1);
// let point4 = new Point(1,9);
// let line1 = new Line(point1,point2);
// let line2 = new Line(point3,point4);
console.log('Polygone is valid: ' + geo.isValidPoly(poly))
