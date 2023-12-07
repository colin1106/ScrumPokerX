import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';
import {Avatar, Button, Card, List, Space, Typography} from 'antd';
import UserInput from './UserInput';
import PointSelection from './PointSelection';

const {Title} = Typography;
const ColorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];

function App() {

  const [socket, setSocket] = useState(null);
  const [name, setName] = useState(null);
  const [points, setPoints] = useState([]);
  const [results, setResults] = useState(null);
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [allSelected, setAllSelected] = useState(false);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    setSocket(socket);

    socket.on('update', (data) => {
      // 更新点数状态
      setPoints(data.points);
      // 更新结果状态
      setResults({min: data.min, max: data.max, avg: data.avg});
      console.log(data.points);
      if (data.points.every(([_, p]) => p !== null)) {
        setAllSelected(true);
      }
    });

    socket.on('userJoined', (name) => {
      setPoints((points) => [...points, [name, null]]);
      setResults(null);
      setAllSelected(false);
    });

    socket.on('userSelected', (name) => {
      setPoints((points) => points.map(([n, p, s]) => n === name ? [n, p, true] : [n, p, s]));
    });

    socket.on('userDisconnected', (name) => {
      setPoints((points) => points.filter(([n,]) => n !== name));
    });

    socket.on('usernameError', (message) => {
      alert(message);
      setNameSubmitted(false);
    });

    socket.on('users', (users) => {
      setPoints(users);
    });

    socket.on('reset', () => {
      setPoints((points) => points.map(([name,]) => [name, null]));
      setAllSelected(false);
      setResults(null);
    });
    return () => socket.close();
  }, []);

  const handleNameSubmit = (name) => {
    setName(name);
    socket.emit('join', name);
    setNameSubmitted(true);
  };

  const handlePointSelect = (point) => {
    socket.emit('select', {name, point});
  };

  const handleReset = () => {
    socket.emit('reset');
  };

  return (
    <div style={{padding: '2em'}}>
      <Space>
        {!nameSubmitted && <UserInput onSubmit={handleNameSubmit}/>}
        {nameSubmitted && <PointSelection onSelect={handlePointSelect}/>}
        {allSelected && nameSubmitted && <Button type="primary" onClick={handleReset}>Start Next Round</Button>}
      </Space>
      {points && (
        <List
          header={<Title level={3}>Users</Title>}
          style={{marginTop: '2em'}}
          bordered
          dataSource={points}
          renderItem={([name, point, selected], index) => (
            <List.Item>
              <Space>
                <Avatar
                  style={{backgroundColor: ColorList[index % ColorList.length], verticalAlign: 'middle'}}
                  size={36}
                >
                  {name}
                </Avatar>
                <div>{point} {selected ? '✔' : ''}</div>
              </Space>

            </List.Item>
          )}
        />
      )}
      {results && (
        <Card title={<Title level={3}>Results</Title>} style={{marginTop: '2em'}}>
          <p>Min: {results.min}</p>
          <p>Max: {results.max}</p>
          <p>Avg: {results.avg}</p>
        </Card>
      )}
    </div>
  );
}

export default App;
