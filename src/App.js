import React, { useState } from 'react';
import CarnetMaintenancePAC from './components/CarnetMaintenancePAC';
import MachineCatalog from './components/MachineCatalog';
import ApiServerSelector from './components/ApiServerSelector';
import { setApiBaseUrl, getApiBaseUrl } from './services/MachineApi';

function App() {
  const [apiServer, setApiServer] = useState(getApiBaseUrl());

  const handleServerChange = (url) => {
    setApiBaseUrl(url);
    setApiServer(url);
  };

  return (
    <div className="App">
      <ApiServerSelector onChange={handleServerChange} />
      <CarnetMaintenancePAC />
      <MachineCatalog apiServer={apiServer} />
    </div>
  );
}

export default App;
