import React, { PureComponent } from 'react';
import ReactQMap from 'react-qmap';

class Analysis extends PureComponent {
  render() {
    return (
      <ReactQMap
        style={{ position: 'absolute' }}
        center={{ latitude: 30.53786, longitude: 104.07265 }}
        initialOptions={{ zoomControl: true, mapTypeControl: true }}
        apiKey="UN6BZ-MP2W6-XWCSX-M2ATU-QORGZ-OWFOE"
      />
    );
  }
}

export default Analysis;
