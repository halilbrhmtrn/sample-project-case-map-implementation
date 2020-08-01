import React, { Component } from 'react';

class DrawRoute extends Component {

    createMarkers = (H, map, points) => {
        points.forEach(point => {
            let pointMarker = new H.map.Marker({ lat: point.C, lng: point.D }, { volatility: true });
            pointMarker.setData('RouteId: ' + point.A.toString() + ' Sequence: ' + point.B.toString() + ' Lat: ' + point.C.toString() + ' Lng: ' + point.D.toString());
            pointMarker.draggable = true;
            map.addObject(pointMarker);
        })
    }
    console = () => {
        console.log(this.props);
    }
    calculateAndDrawRoute = (platform, H, map, points, lineString) => {
        if(map.getObjects().length !== 0) {
            map.removeObjects(map.getObjects());
        }
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
                const polyline = new H.map.Polyline(lineString);
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
    render() {
        return (
            <button className="btn waves-effect waves-light red" onClick={() => this.calculateAndDrawRoute(...this.props.params)}>Calculate Route {this.props.routeName}</button>
        );
    }
}

export default DrawRoute;