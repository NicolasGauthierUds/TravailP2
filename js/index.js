const colors = {
  'C.A.Q.-E.F.L.': '#99ccff',
  'P.L.Q./Q.L.P.': '#e60000',
  'P.Q.': '#003366',
  'Q.S.': '#ff7f00'
};

const CarteStyle = function(feature) {
  const Parti = feature.get('Parti');
  const color = colors[Parti] || '#cccccc';
  return new ol.style.Style({
    fill: new ol.style.Fill({
      color: color
    }),
    stroke: new ol.style.Stroke({
      color: '#444',
      width: 1
    })
  });
};

const FondStyleSelect = new ol.style.Style({
  fill: new ol.style.Fill({
      color: [255, 0, 0, 1]
  }),
  stroke: new ol.style.Stroke({
    color: [177, 163, 148, 0.5],
    width: 2,
    lineCap: 'round'
  })
});

const pointStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 5,
    fill : new ol.style.Fill({
      color: '#666666'
    }),
    stroke: new ol.style.Stroke({
      color: '#bada55'
    })
  })
});

const view = new ol.View({
  center: ol.proj.transform([-73.56, 45.50],'EPSG:4326', 'EPSG:3857'),
  zoom: 3
});

const osmLayer = new ol.layer.Tile({
  title : 'OSM',
  type : 'base',
  source: new ol.source.OSM()
});
osmLayer.setVisible(true);

const StadiaLayer = new ol.layer.Tile({
  title: 'Stadia',
  type: 'base',
  source: new ol.source.StadiaMaps({
		layer: 'stamen_terrain',
			apiKey : '619379bd-8230-43e0-b189-0f7b2505d821'
  })
});
StadiaLayer.setVisible(false);

const bingMapsAerial = new ol.layer.Tile({
  title: 'Bing Aerial',
  type: 'base',
  preload: Infinity,
  source: new ol.source.BingMaps({
    key: 'Ai3-e45amfucPxepiUfo-ENEXreXqZvPCu3mJ9PaGfQeg-6RafUbA3g3bUVCiNQo',
    imagerySet: 'Aerial',
  })
});
bingMapsAerial.setVisible(false);

const vectorLayer1 = new ol.layer.Vector({
  id: 'Carte',
  title: 'Carte',
  source: new ol.source.Vector({
    url: './data/Carte.geojson',
    format: new ol.format.GeoJSON(),
  }),
  style: CarteStyle
});
vectorLayer1.setVisible(true);

const MousePosition = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(2),
  projection: 'EPSG:3857'
});

const ScaleLine = new ol.control.ScaleLine({
  units: 'metric',
  minWidth: 100
});

const vectormap = new ol.layer.Group({
  title: 'Couches',
  fold: 'open',
  layers: [vectorLayer1]
});

var basemap = new ol.layer.Group({
  title: 'Fonds de carte',
  fold: 'open',
  visible: true,
  layers: [osmLayer, bingMapsAerial, StadiaLayer]
});



const selectInteraction = new ol.interaction.Select({
	condition: ol.events.condition.pointerMove,
	layers: function (layer) {
    return layer.get('id') == 'Carte';
  },
  style: FondStyleSelect
});

const map = new ol.Map({
  target: 'map'
});

const tooltip = document.getElementById('tooltip');

map.on('pointermove', function (evt) {
  map.getTargetElement().style.cursor = '';

  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });

  if (feature) {
    const nom = feature.get('NM_CEP') || 'Circonscription inconnue';
    const parti = feature.get('Parti') || 'Parti inconnu';
    const prenom = feature.get('prenom') || '';
    const nomCandidat = feature.get('Nom') || '';
    const candidat = `${prenom} ${nomCandidat}`.trim();

    tooltip.innerHTML = `<strong>${nom}</strong><br>${candidat}<br><em>${parti}</em>`;
    tooltip.style.display = 'block';
    tooltip.style.left = (evt.pixel[0] + 15) + 'px';
    tooltip.style.top = (evt.pixel[1] + 15) + 'px';

    map.getTargetElement().style.cursor = 'pointer';
  } else {
    tooltip.style.display = 'none';
  }
});

var layerSwitcher = new ol.control.LayerSwitcher({
  reverse: true,
  groupSelectStyle: 'group'
});

map.addLayer(basemap);
map.addLayer(vectormap);
map.setView(view);
map.addInteraction(selectInteraction);
map.addControl(layerSwitcher);
map.addControl(MousePosition);
map.addControl(ScaleLine);