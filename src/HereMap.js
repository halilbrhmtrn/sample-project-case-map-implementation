import React, { Component } from 'react';


class HereMap extends Component {
    mapRef = React.createRef();

    state = {
        map: null
    };

    createLineStringFromPoints(H, points) {
        var lineString = new H.geo.LineString();
        points.forEach(point => {
            lineString.pushPoint({ lat: point.C, lng: point.D });
        })
        return lineString;
    }
    createMarkers(H, map, points) {
        points.forEach(point => {
            let pointMarker = new H.map.Marker({ lat: point.C, lng: point.D }, { volatility: true });
            pointMarker.setData('RouteId: ' + point.A.toString() + ' Sequence: ' + point.B.toString() + ' Lat: ' + point.C.toString() + ' Lng: ' + point.D.toString());
            pointMarker.draggable = true;
            map.addObject(pointMarker);
        })
    }
    calculateAndDrawRoute(platform, H, map, points) {
        var router = platform.getRoutingService(null, 8),
            routeRequestParams = {
                routingMode: 'fast',
                transportMode: 'pedestrian',
                origin: points[0].C.toString() + ',' + points[0].D.toString(),
                destination: points[points.length - 2].C.toString() + ',' + points[points.length - 2].D.toString(),
                return: 'polyline'
            };


        router.calculateRoute(
            routeRequestParams, (result) => {
            const polyline = new H.map.Polyline(this.createLineStringFromPoints(H, points));
            map.addObject(polyline);
            map.getViewModel().setLookAtData({
                bounds: polyline.getBoundingBox()
            });
            this.createMarkers(H, map, points);

        },
            () => {
                alert('Can\'t reach the remote server');
            }
        );
    }
     createResizablePolygon(H, map, lineString) {
        var svgCircle = '<svg width="20" height="20" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
            '<circle cx="10" cy="10" r="7" fill="transparent" stroke="red" stroke-width="4"/>' +
            '</svg>',
            polygon = new H.map.Polygon(
              new H.geo.Polygon(lineString),
              {
                style: {fillColor: 'rgba(150, 100, 0, .8)', lineWidth: 0}
              }
            ),
            verticeGroup = new H.map.Group({
              visibility: false
            }),
            mainGroup = new H.map.Group({
              volatility: true, 
              objects: [polygon, verticeGroup]
            }),
            polygonTimeout;
      
        polygon.draggable = true;
      
        polygon.getGeometry().getExterior().eachLatLngAlt(function(lat, lng, alt, index) {
          var vertice = new H.map.Marker(
            {lat, lng},
            {
              icon: new H.map.Icon(svgCircle, {anchor: {x: 10, y: 10}})
            }
          );
          vertice.draggable = true;
          vertice.setData({'verticeIndex': index})
          verticeGroup.addObject(vertice);
        });
      
        map.addObject(mainGroup);
      
        mainGroup.addEventListener('pointerenter', function(evt) {
          if (polygonTimeout) {
            clearTimeout(polygonTimeout);
            polygonTimeout = null;
          }
      
          verticeGroup.setVisibility(true);
        }, true);
      
        mainGroup.addEventListener('pointerleave', function(evt) {
          var timeout = (evt.currentPointer.type === 'touch') ? 1000 : 0;
      
          polygonTimeout = setTimeout(function() {
            verticeGroup.setVisibility(false);
          }, timeout);
        }, true);
      
        verticeGroup.addEventListener('pointerenter', function(evt) {
          document.body.style.cursor = 'pointer';
        }, true);
      
        verticeGroup.addEventListener('pointerleave', function(evt) {
          document.body.style.cursor = 'default';
        }, true);
      
        verticeGroup.addEventListener('drag', function(evt) {
          var pointer = evt.currentPointer,
              geoLineString = polygon.getGeometry().getExterior(),
              geoPoint = map.screenToGeo(pointer.viewportX, pointer.viewportY);
      
          evt.target.setGeometry(geoPoint);
      
          geoLineString.removePoint(evt.target.getData()['verticeIndex']);
          geoLineString.insertPoint(evt.target.getData()['verticeIndex'], geoPoint);
          polygon.setGeometry(new H.geo.Polygon(geoLineString));
      
          evt.stopPropagation();
        }, true);
      }
      
    componentDidMount() {
        const { data } = this.props;
        let routePoints = data['Route Points'].slice(1);
        const polygonPoints = data['Polygon Points'].slice(1);
        let territory1Points = [];
        let territory2Points = [];
        let routePointsA = [];
        let routePointsB = [];
        routePoints.map(point => {
            if (point.A === 1)
                routePointsA.push(point);
            else
                routePointsB.push(point);
        });
        polygonPoints.map(point => {
            if(point.A === "TERRITORRY_1"){
                territory1Points.push(point);
            }
            else{
                territory2Points.push(point)
            }
        });

        const H = window.H;
        const platform = new H.service.Platform({
            apikey: "_ZCu9hKCQoOJUSgQXCDkJYFlayYDzKBAKICn5yQamO8"
        });

        const defaultLayers = platform.createDefaultLayers();

        const map = new H.Map(
            this.mapRef.current,
            defaultLayers.vector.normal.map,
            {
                center: { lat: 38.3194223, lng: 27.1324156 },
                zoom: 4,
                pixelRatio: window.devicePixelRatio || 1
            }
        );
        window.addEventListener('resize', () => map.getViewPort().resize());

        const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

        const ui = H.ui.UI.createDefault(map, defaultLayers);
 
        //this.calculateAndDrawRoute(platform, H, map, routePointsA);
        //this.calculateAndDrawRoute(platform, H, map, routePointsB);
        this.createResizablePolygon(H,map,this.createLineStringFromPoints(H,territory2Points));
        console.log(territory1Points);
        console.log(territory2Points)

        map.addEventListener('tap', (e) => {
            if (e.target instanceof H.map.Marker) {
                let bubble = new H.ui.InfoBubble(e.target.getGeometry(), {
                    content: e.target.getData()
                });
                ui.addBubble(bubble);
            }
            else {

            }
        });
        map.addEventListener('dragstart', function (ev) {
            var target = ev.target,
                pointer = ev.currentPointer;
            if (target instanceof H.map.Marker) {
                var targetPosition = map.geoToScreen(target.getGeometry());
                var targetLatLng = target.getGeometry();
                target.setData('marker dragged. Lat: ' + targetLatLng.lat + ' Lng: ' + targetLatLng.lng);
                target['offset'] = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y);
                behavior.disable();
            }
        }, false);

        map.addEventListener('dragend', function (ev) {
            var target = ev.target;
            if (target instanceof H.map.Marker) {
                behavior.enable();
            }
        }, false);

        map.addEventListener('drag', function (ev) {
            var target = ev.target,
                pointer = ev.currentPointer;
            if (target instanceof H.map.Marker) {
                target.setGeometry(map.screenToGeo(pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y));
            }
        }, false);


        this.setState({ map });
    }

    componentWillUnmount() {
        this.state.map.dispose();
    }

    render() {
        return <div ref={this.mapRef} style={{ height: "80vh", width: "100vw" }} />;
    }
}

export default HereMap;