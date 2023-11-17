import React from 'react';
import './index.css'
import {Col, Row} from 'antd';

const points = [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, '?'];

function PointSelection({onSelect}) {
  return (
    <Row gutter={[8, 0]}>
      {points.map((point) => (
        <Col>
          <div className={"card"} key={point} onClick={() => onSelect(point)}>
            {point}
          </div>
        </Col>
      ))}
    </Row>
  );
}

export default PointSelection;
