import React, {useState} from 'react';
import {Button, Col, Input, Row} from "antd";

function UserInput({onSubmit}) {
  const [name, setName] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(name);
  };

  return (
    <Row gutter={[8, 0]}>
      <Col>
        <Input
          type="text"
          placeholder="取个响亮的名字吧😉"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Col>
      <Col>
        <Button type="primary" onClick={handleSubmit}>Submit</Button>
      </Col>
    </Row>
  );
}

export default UserInput;
