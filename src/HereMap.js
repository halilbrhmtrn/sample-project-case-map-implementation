import React, { Component } from 'react';
import DrawRoute from './DrawRoute';
import DrawResizablePolygon from './DrawResizablePolygon';

class HereMap extends Component {
    mapRef = React.createRef();

    state = {
        map: null,
        paramsA: null,
        paramsB: null,
        paramsTerritory1: null,
        paramsTerritory2: null
    };

    createLineStringFromPoints = (H, points) => {
        var lineString = new H.geo.LineString();
        points.forEach(point => {
            lineString.pushPoint({ lat: point.C, lng: point.D });
        })
        return lineString;
    }
    componentDidMount() {
        const { data } = this.props;
        let routePoints = data['Route Points'].slice(1);
        let polygonPoints = data['Polygon Points'].slice(1);
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
            if (point.A === "TERRITORRY_1") {
                territory1Points.push(point);
            }
            else {
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

        this.setState({
            paramsA: [platform, H, map, routePointsA, this.createLineStringFromPoints(H, routePointsA)],
            paramsB: [platform, H, map, routePointsB, this.createLineStringFromPoints(H, routePointsB)],
            paramsTerritory1: [H, map, this.createLineStringFromPoints(H, territory1Points)],
            paramsTerritory2: [H, map, this.createLineStringFromPoints(H, territory2Points)]
        });

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
        return (
            <div className="container">
                <div ref={this.mapRef} style={{ height: "80vh", width: "100vw" }} />
                <DrawRoute routeName="A" params={this.state.paramsA} />
                <DrawRoute routeName="B" params={this.state.paramsB} />
                <DrawResizablePolygon territoryName="1" params={this.state.paramsTerritory1} />
                <DrawResizablePolygon territoryName="2" params={this.state.paramsTerritory1} />
            </div>
        );
    }
}

export default HereMap;