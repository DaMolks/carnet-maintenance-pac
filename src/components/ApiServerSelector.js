import React, { useEffect, useState } from 'react';
import { detectLocalServers, getApiBaseUrl } from '../services/MachineApi';

const ApiServerSelector = ({ onChange }) => {
  const [servers, setServers] = useState([]);
  const [current, setCurrent] = useState(getApiBaseUrl());

  const detect = async () => {
    const found = await detectLocalServers();
    setServers(found);
    if (found.length && !found.includes(current)) {
      setCurrent(found[0]);
      onChange(found[0]);
    }
  };

  useEffect(() => {
    detect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const url = e.target.value;
    setCurrent(url);
    onChange(url);
  };

  return (
    <div className="p-4 flex items-center space-x-2">
      <label className="text-sm font-medium">Serveur:</label>
      <select value={current} onChange={handleChange} className="border rounded p-1">
        <option value={current}>{current}</option>
        {servers.filter(s => s !== current).map(url => (
          <option key={url} value={url}>{url}</option>
        ))}
      </select>
      <button onClick={detect} className="px-2 py-1 border rounded">Détecter</button>
    </div>
  );
};

export default ApiServerSelector;
