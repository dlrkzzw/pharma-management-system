import type { FC } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/es/locale/zh_CN';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Hospitals from './pages/Hospitals';
import Doctors from './pages/Doctors';
import Employees from './pages/Employees';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import './App.css';

const App: FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/inventory" element={<Inventory />} />
          </Routes>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

export default App;
